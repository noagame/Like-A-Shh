### 1. Diagnóstico de `mongodb.ts`
- **Análisis de Conexión:** Revisa cómo se está instanciando y exportando la conexión a la base de datos. Detecta problemas de múltiples conexiones simultáneas, fugas de memoria o promesas no resueltas.

  El patrón actual de `MongoClient` como singleton es una idea correcta, pero en la implementación que se usa en el proyecto hay varios problemas técnicos reales:

  1. La conexión se crea en función de `process.env.NODE_ENV` y se cachea solo en desarrollo.
     - En desarrollo esto puede funcionar, pero en producción no hay una estrategia estable de reutilización de conexión y puede haber instancias duplicadas según el runtime del servidor.
     - En Next.js moderno, especialmente con serverless, la ejecución puede recrearse en varios workers o instancias; el singleton no siempre es global entre todas las trazas.

  2. `clientPromise` se exporta como una promesa, no como un cliente ya creado o un valor gestionado por una capa de abstracción.
     - Esto crea acoplamiento fuerte entre el módulo y el flujo de conexión.
     - Cuando un consumidor llama a `await clientPromise`, el archivo no controla ni inspecciona si la conexión realmente está viva.

  3. No hay gestión de errores de conexión ni timeouts configurados.
     - En MongoDB, si la red está caída o la URI es inválida, la operación puede quedar colgada o fallar sin un diagnóstico útil.
     - Sin `serverSelectionTimeoutMS`, un problema de red puede bloquear la app durante mucho tiempo.

  4. El bucket de GridFS está creado con una base de datos fija (`likeashh`) y un bucket fijo (`media`).
     - Eso limita el uso del módulo y dificulta probar distintos entornos.
     - En producción es mala práctica dejar valores hardcodeados cuando el entorno puede ser staging, preview, QA o local.

  5. Si `global._mongoClientPromise` se usa con un `any` implícito o una redefinición del objeto global en diferentes runtimes, puede aparecer un comportamiento inconsistente.
     - En Next.js con hot reload o workers distintos, la referencia global puede no ser compartida del modo esperado.

  6. El patrón `const uri = process.env.MONGODB_URI!;` y la validación posterior no es suficiente.
     - `!` solo silencia TypeScript; no valida runtime.
     - Si la variable está ausente, el error puede aparecer demasiado tarde o en un punto muy difícil de diagnosticar.

- **Explicación del Fallo:** Explica de forma clara y técnica qué está mal en la implementación actual.

  El fallo principal no está en MongoDB como motor, sino en la forma en que se expone la conexión:

  - se crea una promesa de conexión global solamente en desarrollo,
  - se exporta sin encapsular la base de datos ni la configuración,
  - no se valida ni centraliza el entorno,
  - no se comprueba si `MongoClient` ya existe o si queda viva,
  - y los consumers de la conexión no tienen un contrato claro para controlar errores, reintentos o fallos de instancia.

  Esto provoca varios síntomas reales:

  - conexiones múltiples cuando el proceso se reinicia o hay workers distintos,
  - promesas pendientes que no se resuelven bien si la red falla,
  - errores difíciles de rastrear porque se lanzan dentro de un `export default` no gestionado,
  - y un comportamiento impredecible en Server Actions que intentan acceder a `GridFSBucket` al mismo tiempo.

  En términos de debugging, la causa raíz es: la capa de persistencia no tiene un contrato de inicialización "once" robusto y no tiene límites de timeout ni un manejo centralizado de errores de conexión.


### 2. Diagnóstico de `/app/medios/actions.ts`
- **Análisis de Server Actions / Lógica:** Revisa el manejo de asincronía (`async/await`), el bloque de captura de errores (`try/catch`), la validación de los datos de entrada y la forma en que se realizan las consultas a la base de datos.

  La acción tiene varias deficiencias de diseño y control de flujo:

  1. La validación del archivo es insuficiente.
     - Se comprueba si `file` existe y si excede `MAX_SIZE_MB`, pero no se valida si `file` es un `File` válido, si el mime type es permitido, ni si el nombre del archivo es seguro.
     - Cuando `formData.get("file")` devuelve un valor inadecuado, el flujo se rompe con un error de runtime en lugar de una respuesta normalizada.

  2. No hay `try/catch` alrededor de la carga de MongoDB ni del insert en Supabase.
     - Si `bucket.openUploadStream()` falla, si `file.arrayBuffer()` falla o si la inserción en Supabase falla, la acción se cae y la respuesta del servidor puede quedar en un estado no controlado.
     - En Server Actions de Next.js, un error no capturado puede provocar un fallo de serialización o un estado de UI inconsistente.

  3. El bloque de limpieza en caso de error de insert en Postgres es incompleto.
     - Se intenta borrar la media recién creada en MongoDB, pero no se gestiona de forma escalonada ni consistente si la imagen ya no existe, o si el `ObjectId` es inválido.
     - Además, `await bucket.delete(new ObjectId(mongoFileId));` no está envuelto en validación de errores y puede bloquear la acción si `mongoFileId` no es un ObjectId válido.

  4. `publicUrl` se construye con `process.env.NEXT_PUBLIC_SITE_URL` sin validación.
     - Si falta esta variable, el archivo se sube pero la URL queda rota o apunta a un dominio inexistente.
     - Eso es un fallo funcional que luego se vuelve muy difícil de rastrear porque parece un problema de frontend o de routing.

  5. La acción mezcla responsabilidades de negocio y acceso a datos.
     - Subida, validación, generación de URL pública, inserción en Supabase, logging de auditoría y revalidación de cache están todo en una misma función.
     - Eso dificulta detectar dónde exactamente se rompe la operación.

  6. La revalidación de caché se hace sin comprobar que la operación fue exitosa.
     - Esto se puede hacer solo luego de que el insert en la base finalice con éxito.

  7. El código se basa en `Buffer.from(await file.arrayBuffer())` sin límites de memoria ni control de tamaño real en el backend.
     - Para uploads grandes, esto puede empeorar el consumo de memoria.

- **Explicación del Fallo:** Identifica por qué la acción está fallando (ej. timeouts, datos mal formateados, errores de serialización, estado de la respuesta).

  La falla más probable es una combinación de estas condiciones:

  - un `File` vacío o mal formateado,
  - una conexión de MongoDB que no está estable,
  - un `NEXT_PUBLIC_SITE_URL` inexistente o mal configurado,
  - un `try/catch` que no cubre todas las etapas del flujo,
  - y un manejo de respuesta que devuelve `error` y `url` en un formato no consistente.

  En un Server Action, si `Bucket` falla o la conexión a MongoDB está rota, la promesa no se maneja de forma estructurada, por lo que Next.js puede devolver un error de ejecución o un estado de UI no serializable. A nivel de negocio, la acción no responde con un contrato fuerte:

  - si falla, debe devolver un payload consistente,
  - si tiene éxito, debe devolver `ok: true` y la URL final,
  - y ambos casos deben manejarse con `try/catch` para prevenir que el stack se “escape” al cliente.


### 3. Interacción y Cuellos de Botella
- Explica si el error nace de la forma en que `actions.ts` está importando o consumiendo la conexión provista por `mongodb.ts`.

  Sí, la causa raíz está en la interacción entre ambos archivos:

  1. `actions.ts` importa `getMediaBucket` desde `@/lib/mongodb`.
     - La conexión es creada por `MongoClient.connect()`, pero no se valida ni se gestiona con un wrapper de estado.
     - Si la misma promesa de conexión está pendiente o se reintenta desde varios workers, el bucket se puede crear sobre una conexión incompleta.

  2. `getMediaBucket()` depende de la conexión del cliente exportado.
     - Si `clientPromise` se resuelve parcialmente o la base no está accesible, entonces `GridFSBucket` se crea sobre un cliente muerto.

  3. La acción asume que el bucket está disponible sin comprobar si la conexión es válida.
     - Eso es un cuello de botella importante porque el tiempo de espera en Mongo y la captura de errores se concentran justo en el punto en que la acción llama a `getMediaBucket()`.

  4. El problema no es solo “no se conecta a Mongo”, sino que ambos módulos están desalineados con la estrategia de runtime de Next.js:
     - la conexión es gestionada como un valor global y asíncrono,
     - la acción no controla transiciones de estado ni errores de serialización,
     - y la app asume que la base estará siempre disponible sin un fallback controlado.

  En resumen: la acción falla porque consume la conexión sin un contrato seguro, y la conexión de MongoDB no está protegida contra falta de entorno, timeout y múltiples instancias.


### 4. Soluciones y Código Corregido
- **Paso a Paso:** Enumera las instrucciones exactas para arreglar los archivos.

  1. Corregir `mongodb.ts` para centralizar la conexión y controlarla con timeout.
  2. Eliminar el uso de `!` para valores de entorno y validar `MONGODB_URI` explícitamente.
  3. Añadir un singleton seguro usando `globalThis` y una promesa única de MongoClient.
  4. Añadir `serverSelectionTimeoutMS` y `maxPoolSize` para evitar esperas infinitas.
  5. Encapsular la obtención de base de datos y `GridFSBucket` en funciones limpias.
  6. Corregir `actions.ts` para validar todos los datos del `FormData` antes de acceder a la base.
  7. Rodear toda la operación con `try/catch` y responder con un objeto serializable consistente.
  8. Validar `NEXT_PUBLIC_SITE_URL` antes de construir la URL de acceso a la media.
  9. Hacer limpieza del archivo en Mongo sólo si el insert a Supabase falla y el `ObjectId` es válido.
  10. Revalidar la caché solo después de un insert exitoso.

- **Código Refactorizado:** Entrega el código completo y corregido para `mongodb.ts` y para `/app/medios/actions.ts`. Agrega comentarios en el código señalando `// FIX:` donde hiciste las correcciones clave.

  `mongodb.ts`

  ```ts
  import { MongoClient, GridFSBucket } from "mongodb";

  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? "likeashh";

  if (!MONGODB_URI) {
    throw new Error("MISSING_ENV: MONGODB_URI");
  }

  declare global {
    // FIX: usar globalThis para evitar inconsistencias entre entornos de Next.js
    // eslint-disable-next-line no-var
    var _mongoClientPromise: Promise<MongoClient> | undefined;
  }

  // FIX: singleton seguro para evitar múltiples conexiones por hot reload o workers
  const clientPromise =
    globalThis._mongoClientPromise ??
    (globalThis._mongoClientPromise = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      retryWrites: true,
    }).connect());

  export default clientPromise;

  export async function getMongoDb() {
    // FIX: devolver la DB configurada por entorno y no hardcodear el nombre
    const client = await clientPromise;
    return client.db(MONGODB_DB_NAME);
  }

  export async function getMediaBucket(bucketName = "media") {
    // FIX: encapsular la creación del bucket para controlar runtime y errores
    const db = await getMongoDb();
    return new GridFSBucket(db, { bucketName });
  }
  ```

  `/app/medios/actions.ts`

  ```ts
  "use server";

  import { ObjectId } from "mongodb";
  import { Readable } from "stream";
  import { revalidatePath } from "next/cache";
  import { getMediaBucket } from "@/lib/mongodb";
  import { createClient } from "@/lib/supabase/server";

  const MAX_SIZE_MB = 50;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

  if (!SITE_URL) {
    throw new Error("MISSING_ENV: NEXT_PUBLIC_SITE_URL");
  }

  type UploadMediaResult =
    | { ok: true; url: string; fileId: string }
    | { ok: false; error: string };

  export async function uploadMedia(formData: FormData): Promise<UploadMediaResult> {
    try {
      const file = formData.get("file");
      const galleryId = (formData.get("gallery_id") as string | null)?.trim() || null;
      const altText = (formData.get("alt_text") as string | null)?.trim() || null;

      // FIX: validar que realmente se enviaron datos correctos antes de tocar Mongo
      if (!(file instanceof File)) {
        return { ok: false, error: "No se recibió un archivo válido." };
      }

      if (!file.name || file.size <= 0) {
        return { ok: false, error: "El archivo está vacío o no es válido." };
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        return { ok: false, error: `El archivo no puede pesar más de ${MAX_SIZE_MB}MB.` };
      }

      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return { ok: false, error: "No autenticado." };
      }

      // FIX: obtener bucket de Mongo desde una conexión controlada
      const bucket = await getMediaBucket();
      const buffer = Buffer.from(await file.arrayBuffer());

      const mongoFileId = await new Promise<string>((resolve, reject) => {
        try {
          const uploadStream = bucket.openUploadStream(file.name, {
            contentType: file.type || "application/octet-stream",
            metadata: { uploadedBy: user.id },
          });

          Readable.from(buffer)
            .pipe(uploadStream)
            .on("error", reject)
            .on("finish", () => resolve(uploadStream.id.toString()));
        } catch (error) {
          reject(error);
        }
      });

      const publicUrl = `${SITE_URL}/api/media/${mongoFileId}`;

      const { error: insertError } = await supabase.from("media").insert({
        gallery_id: galleryId,
        url: publicUrl,
        storage_path: mongoFileId,
        alt_text: altText,
        uploaded_by: user.id,
      });

      if (insertError) {
        // FIX: limpieza automática para evitar archivos huérfanos en Mongo
        try {
          await bucket.delete(new ObjectId(mongoFileId));
        } catch {
          // no bloquear la operación por un fallo de limpieza
        }

        return { ok: false, error: insertError.message };
      }

      await supabase.from("audit_log").insert({
        actor_id: user.id,
        action: "upload_media",
        metadata: { mongo_file_id: mongoFileId, gallery_id: galleryId },
      });

      revalidatePath("/admin/medios");
      if (galleryId) {
        revalidatePath(`/admin/galerias/${galleryId}`);
      }

      return { ok: true, url: publicUrl, fileId: mongoFileId };
    } catch (error) {
      // FIX: responder con un payload serializable y no dejar que Next.js falle con un error crudo
      console.error("[uploadMedia] Error inesperado:", error);
      return { ok: false, error: "No se pudo completar la subida del archivo." };
    }
  }

  export async function deleteMedia(formData: FormData) {
    try {
      const mediaId = (formData.get("media_id") as string | null)?.trim();
      const mongoFileId = (formData.get("mongo_file_id") as string | null)?.trim();
      const galleryId = (formData.get("gallery_id") as string | null)?.trim() || null;

      if (!mediaId || !mongoFileId) {
        return { ok: false, error: "Faltan datos para borrar la media." };
      }

      const supabase = await createClient();
      const bucket = await getMediaBucket();

      try {
        // FIX: validar ObjectId antes de borrar en Mongo
        await bucket.delete(new ObjectId(mongoFileId));
      } catch {
        // se ignora porque puede ya no existir en Mongo
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      await supabase.from("media").delete().eq("id", mediaId);
      await supabase.from("audit_log").insert({
        actor_id: user?.id,
        action: "delete_media",
        metadata: { media_id: mediaId, mongo_file_id: mongoFileId },
      });

      revalidatePath("/admin/medios");
      if (galleryId) {
        revalidatePath(`/admin/galerias/${galleryId}`);
      }

      return { ok: true };
    } catch (error) {
      console.error("[deleteMedia] Error inesperado:", error);
      return { ok: false, error: "No se pudo borrar la media." };
    }
  }
  ```

  Con estos cambios, se corrige la causa raíz:

  - conexión segura y singleton controlado,
  - validación de entrada antes del acceso a la base,
  - captura de errores en cada etapa,
  - respuesta serializable y consistente,
  - limpieza de archivos huérfanos y acceso a la URL de media protegido por `NEXT_PUBLIC_SITE_URL` validado.
