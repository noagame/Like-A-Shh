# Correcciones de carruseles, enlaces e imágenes de eventos

Fecha: 22 de octubre de 2026.

## 1. Clases repetidas en los carruseles de inicio

**Causa:** `AutoplayCarousel` avanzaba una tarjeta y construía ventanas circulares de hasta cuatro elementos. Una misma clase aparecía en varias vistas y, con pocos registros, el carrusel reciclaba constantemente el mismo grupo.

**Cambio:** las tarjetas ahora se distribuyen en páginas independientes, sin solapamiento: una por página en móvil, dos en tablet y cuatro en escritorio. La última página muestra solamente los elementos restantes. Si todas las tarjetas caben, no se inicia la reproducción automática ni se muestran controles innecesarios. Se mantienen flechas, indicadores, navegación táctil y pausa al pasar el cursor.

Archivo principal: `app/components/AutoplayCarousel.tsx`.

## 2. Texto y destino editables en `/admin/cursos`

- Cada tarjeta tiene un botón **Editar**, que permite modificar título, descripción, portada, URL, texto del enlace y estado sin eliminar el curso.
- La URL admite WhatsApp, Hotmart, otra web HTTP/HTTPS o una ruta interna del sitio.
- El nuevo campo **Texto del enlace** se guarda por curso y se muestra tanto en el panel como en el botón de su tarjeta en la página principal. Si se deja vacío, se recupera el texto automático.
- Las clases online/presenciales y los enlaces de WhatsApp muestran **Enlace a WhatsApp** automáticamente. Los demás destinos externos usan **Enlace a Hotmart/Web**.
- Una clase online/presencial sin URL configurada usa el WhatsApp de agenda, incluyendo su modalidad en el mensaje. Para personalizar el mensaje de WhatsApp, editar el parámetro `text` de la URL, por ejemplo `https://wa.me/56971577711?text=Hola%2C%20quiero%20agendar`.
- Se corrigió un fallo adicional: `StandardProgramCard` ignoraba su propiedad `url` y siempre abría un WhatsApp fijo. Ahora respeta el destino configurado, incluidos Hotmart y las rutas de reserva.
- Un curso sin modalidad ni destino disponible muestra **Enlace no disponible** en inicio en lugar de abrir una pestaña con la misma página.
- Las acciones del servidor verifican el rol administrador, validan los campos antes de subir archivos y retiran una imagen recién subida si el guardado falla. Un error se muestra en el panel.

Archivos principales: `app/admin/cursos/Course.Modal.tsx`, `app/admin/cursos/actions.ts`, `app/admin/cursos/page.tsx`, `lib/course-links.ts`, `app/components/CourseCards.tsx` y `app/components/CoursesSection.tsx`.

### Migración aplicada en Supabase

La migración `supabase/migrations/202610220001_course_link_label.sql` agrega únicamente `courses.link_label`, de tipo `text` y opcional. Los registros existentes conservan `NULL` y usan el texto automático; no se modifica su URL ni se eliminan datos.

**Aplicada el 22 de octubre de 2026**, después de recibir autorización adicional del usuario para configurar Supabase. Quedó registrada en el historial del proyecto `ssgcrrblxmmqurjlwope`; la API pública confirmó la columna con respuesta HTTP 200. La nueva configuración se verificó antes de preparar la publicación en `main`.

El carrusel no necesita cambios de esquema. La edición de imágenes reutiliza `events.image_url`; la revisión remota detectó un permiso faltante de Storage, resuelto con `202610220003_event_flyer_storage_delete.sql`: solo administradores autenticados pueden retirar archivos de `eventos/flyers`.

## 3. Gestión de imágenes en `/admin/eventos/[id]/editar`

El formulario incluye una sección **Imagen del evento** que permite:

1. Ver la imagen actual y abrirla en otra pestaña.
2. Subir una imagen cuando el evento no tiene portada.
3. Seleccionar una imagen nueva y revisar su vista previa antes de guardar.
4. Cancelar la selección y conservar la imagen actual.
5. Marcar **Quitar imagen actual al guardar**, o desmarcar para conservarla.

Se aceptan PNG, JPEG y WebP de hasta 5 MiB. El servidor mantiene la validación de la firma real del archivo. Los cambios se aplican al pulsar **Guardar cambios**, conservando el mismo evento y sus registros asociados.

La imagen anterior se mantiene hasta que el cambio se guarda correctamente. Si el guardado falla, se intenta retirar únicamente el archivo nuevo. Una comprobación de concurrencia evita sobrescribir una portada que otro administrador acaba de cambiar. La limpieza posterior solo retira archivos de `eventos/flyers` del proyecto configurado que ya no estén referenciados por otro evento; no elimina URLs externas ni portadas compartidas. Si la limpieza falla después del guardado, se informa que los cambios ya fueron guardados y que debe revisarse el archivo anterior.

También se permite editar la portada de un evento pasado conservando exactamente sus fechas originales. Si se cambian las fechas, se mantiene la validación habitual del calendario.

Se actualizan las vistas de inicio, administración y cuenta después de guardar. Al quitar una portada, los componentes públicos utilizan sus imágenes predeterminadas donde corresponde.

Archivos principales: `app/admin/eventos/[id]/editar/page.tsx`, `app/admin/eventos/[id]/editar/actions.ts`, `app/admin/eventos/[id]/editar/EventImageField.tsx` y `lib/event-image.ts`.

## Validación

Se añadieron pruebas de regresión para paginación adaptable, ausencia de repeticiones, navegación, enlaces configurados, edición de cursos y gestión de imágenes con errores, permisos y concurrencia.

| Comprobación local | Resultado |
| --- | --- |
| `npm run test:run` | 125 pruebas aprobadas en 18 archivos |
| `npm run lint -- --max-warnings 0` | Aprobado, sin errores ni advertencias |
| `npm run typecheck` | Aprobado |
| `npm run build` | Aprobado; compilación de producción y generación de las 40 páginas completadas |
| `git diff --check` | Aprobado |

La compilación utilizó las variables ficticias de la CI (`https://example.supabase.co`, clave `test-placeholder` y origen `https://example.com`), sin credenciales de producción. La instalación de dependencias y la compilación necesitaron acceso fuera del sandbox para descargar paquetes/fuentes y ejecutar los procesos del compilador. Las correcciones funcionales conservaron la configuración de dependencias. Después se actualizaron versiones compatibles en `package-lock.json` para atender las alertas de auditoría detectadas en GitHub; el resultado y la alerta de desarrollo pendiente se detallan en [VALIDACION_SUPABASE_2026-10-22.md](VALIDACION_SUPABASE_2026-10-22.md).

Las pruebas de las acciones utilizan servicios simulados: no crean cursos, eventos, cuentas ni objetos de Storage en Supabase. No se realizaron pruebas con escritura en producción.

### Comprobación manual después de autorizar la migración y desplegar

1. Revisar ambos carruseles en móvil y escritorio, con menos y más tarjetas de las que caben en una página. Recorrer todas las páginas y comprobar que cada registro aparece una vez por ciclo.
2. En `/admin/cursos`, editar una clase online y otra presencial. Cambiar texto y URL, guardar y comprobarlos en el panel y en la tarjeta de inicio. Repetir con un curso de Hotmart. Vaciar el texto para recuperar el valor automático.
3. En la edición de un evento, subir una portada, reemplazarla, cancelar una selección y finalmente quitarla. Guardar cada operación y comprobar su representación en inicio. Revisar también un evento sin imagen y un evento pasado conservando sus fechas.

## Commits y publicación

El usuario autorizó crear los commits y subir los cambios primero a la rama `dev`. Esta entrega se organiza en un commit por punto:

1. `fix: evitar clases repetidas en los carruseles de inicio`
2. `fix: permitir editar texto y destino de enlaces de cursos`
3. `fix: gestionar imágenes desde la edición de eventos`

Este documento acompaña la entrega. El archivo preexistente sin seguimiento `docs/PLAN_DEMOSTRACION_DUENO.md` no forma parte de estos cambios y debe quedar fuera de los commits.

Después de publicar el código inicialmente en `dev`, el usuario autorizó configurar Supabase y promover los cambios a `main`. Las tres migraciones de esta entrega quedaron aplicadas y verificadas. Consulta el resultado y sus evidencias en [VALIDACION_SUPABASE_2026-10-22.md](VALIDACION_SUPABASE_2026-10-22.md).
