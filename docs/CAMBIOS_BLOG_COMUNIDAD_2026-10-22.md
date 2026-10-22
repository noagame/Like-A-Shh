# Blog público, reacciones de alumnos y conversaciones de comunidad

Fecha: 22 de octubre de 2026.

## Acceso al Blog desde las distintas vistas

Se agregó el enlace al Blog en la navegación pública, el pie de página de inicio y los menús de alumnos y administración, incluyendo las versiones móviles.

Las páginas públicas secundarias —Blog, artículos, login, registro, recuperación de acceso y textos legales— reciben la navegación pública mediante `PublicNavigation`. El componente deja espacio bajo la barra fija para evitar que cubra el contenido. En inicio, administración y cuenta se conservan sus propios menús sin duplicarlos.

Los enlaces a secciones de inicio usan `/#sección`, por lo que también funcionan desde otras páginas. En administración se distingue entre **Administrar blog** (`/admin/blog`) y **Blog público** (`/blog`).

El listado y los artículos publicados siguen disponibles sin iniciar sesión. Los borradores y artículos archivados no se muestran en las rutas públicas.

## Reacciones únicamente para alumnos

Se añadió **Me gusta** en las tarjetas del listado y al final de cada artículo publicado. Una cuenta de alumno puede activar o quitar su reacción; cada cuenta tiene como máximo una por artículo. El usuario se identifica por la sesión del servidor, nunca por un campo enviado desde el navegador.

En el modelo actual, un alumno es una cuenta con `profiles.role = 'user'`, según la autorización dada para esta funcionalidad. Los visitantes y administradores pueden leer el Blog y consultar los totales, pero sus botones de reacción permanecen deshabilitados. Los visitantes reciben un enlace para iniciar sesión.

La acción del servidor vuelve a comprobar sesión, rol y publicación del artículo. Guardar el estado deseado de la reacción permite reintentar sin duplicar ni invertir un Me gusta. Si falla el guardado, se conserva la representación anterior y se muestra un error recuperable.

### Migración aplicada y verificada

Archivo: `supabase/migrations/202610220002_blog_post_reactions.sql`.

La migración prepara:

- La tabla `blog_post_reactions`, con clave única por artículo y alumno.
- Eliminación en cascada de reacciones al eliminar el artículo o el perfil.
- Políticas RLS para que solo un alumno pueda agregar o quitar su propia reacción sobre un artículo publicado.
- Lectura de registros individuales limitada a su propietario.
- La función `get_blog_reaction_counts`, que entrega totales públicos de artículos publicados sin exponer las identidades de quienes reaccionaron.

**Aplicada el 22 de octubre de 2026** al proyecto `ssgcrrblxmmqurjlwope`, con autorización posterior del usuario para configurar Supabase antes de publicar en `main`. Quedó registrada en el historial de migraciones. La API confirmó que la función pública de totales responde HTTP 200 y que las identidades de reacciones permanecen inaccesibles para visitantes, con HTTP 401.

Las dos migraciones iniciales pasaron 39 comprobaciones reales en PostgreSQL temporal; el permiso adicional de Storage pasó otras 27. En Supabase se verificaron 14 condiciones de esquema y permisos, todas correctas, sin crear publicaciones ni reacciones de prueba en producción. La migración de reacciones utiliza el historial normal de migraciones y debe aplicarse una sola vez.

Archivos principales: `app/blog/actions.ts`, `app/blog/BlogReactionButton.tsx`, `lib/blog-reactions.ts`, `app/blog/page.tsx` y `app/blog/[slug]/page.tsx`.

## El administrador puede iniciar conversaciones

En `/admin/comunidad` se agregó **Nueva conversación**, con título de 5 a 140 caracteres y mensaje de 10 a 5.000 caracteres. La acción comprueba el rol administrativo y toma la autoría desde la sesión. Las conversaciones se publican para los alumnos en `/mi-cuenta/comunidad`.

No se necesita una migración adicional para esta parte. La política existente exige crear publicaciones en estado `pending`; el servidor crea la conversación y después la aprueba con los permisos de moderación del administrador. Si falla la aprobación, avisa que la conversación ya existe pendiente y que debe aprobarse desde la lista. Si solo falla la auditoría, informa que ya está publicada. Estos avisos evitan indicar que hay que crearla nuevamente.

La página explica la diferencia entre el Blog público de la academia y la Comunidad de alumnos, dónde se ven las conversaciones, qué significa cada estado y qué ocurre al aprobar, rechazar, ocultar o eliminar una publicación. Los filtros y estados se muestran en español. También se amplió únicamente la descripción de Comunidad en la tarjeta de inicio del administrador, conservando las tarjetas que ya se habían agregado allí.

Archivos principales: `app/admin/comunidad/CommunityPostForm.tsx`, `actions.ts` y `page.tsx`.

## Avisos de React corregidos en el editor

En `app/admin/blog/BlogEditor.tsx`:

1. Se eliminó `encType` del formulario con una función como `action`. React configura el envío automáticamente, incluida la portada adjunta.
2. Se eliminaron `name` y `value` del botón que usa una función en `formAction`. Guardar y eliminar reciben un único `id` desde el campo oculto del formulario.

El botón de eliminar utiliza `formNoValidate`, de modo que un título o contenido que se haya vaciado durante una edición no impida borrar el artículo. Ambos botones quedan bloqueados durante una operación. Los campos controlados conservan el texto tras un fallo y se reinician correctamente al cambiar de artículo o crear uno nuevo. El panel incluye un enlace **Nuevo artículo** al editar uno existente.

Las pruebas montan el editor con React y comprueban que las operaciones de guardar y eliminar no emiten ninguno de los avisos informados.

## Validación

Se añadieron pruebas de navegación pública y privada, menús móviles, reacciones, autorización, publicación de conversaciones, errores recuperables y funcionamiento del editor de Blog.

| Comprobación local | Resultado |
| --- | --- |
| `npm run test:run` | 199 pruebas aprobadas en 24 archivos, incluidas las regresiones de la entrega anterior |
| `npm run lint -- --max-warnings 0` | Aprobado, sin errores ni advertencias |
| `npm run typecheck` | Aprobado |
| `npm run build` | Aprobado; compilación de producción y generación de las 40 páginas completadas |
| `git diff --check` | Aprobado |

La compilación se ejecutó con URL de Supabase, clave pública y origen ficticios de prueba. La aplicación posterior de las migraciones fue autorizada expresamente y su resultado está documentado en [VALIDACION_SUPABASE_2026-10-22.md](VALIDACION_SUPABASE_2026-10-22.md).

Las pruebas de acciones utilizan servicios simulados. No se crearon artículos, conversaciones, cuentas ni reacciones de prueba en Supabase. Se aplicaron únicamente las tres migraciones de configuración de esta entrega y sus registros de historial.

El usuario autorizó crear y subir los commits primero a `dev`, y después configurar Supabase y promoverlos a `main`. Los cambios se organizan por punto: acceso y reacciones del Blog, creación de conversaciones y correcciones del editor. Las migraciones SQL quedaron aplicadas antes de preparar la promoción a `main`.

### Comprobación manual al desplegar

1. Abrir `/blog` sin sesión desde inicio, login y un artículo. Confirmar lectura pública y que reaccionar requiere una cuenta de alumno.
2. Tras autorizar y aplicar la migración, iniciar sesión como alumno, dar y quitar Me gusta y comprobar que listado y detalle reflejen el cambio al volver a cargarlos. Repetir con otra cuenta y confirmar que no se pueden modificar sus reacciones.
3. Iniciar sesión como administrador: leer el Blog sin poder reaccionar; volver a **Administrar blog** y guardar/eliminar sin avisos de React.
4. Crear una conversación desde `/admin/comunidad`, revisarla en la lista y en la Comunidad de alumnos. Comprobar filtros y explicación de estados.
5. Repetir la navegación en móvil y verificar que cada menú cierre al seleccionar Blog.

## Trabajo anterior

Se conservaron los arreglos de carruseles, enlaces de cursos e imágenes de eventos y su informe `docs/CORRECCIONES_BUGS_2026-10-22.md`. La migración de `courses.link_label` también quedó aplicada. `docs/PLAN_DEMOSTRACION_DUENO.md` permanece fuera de esta entrega y no se modificó.
