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

### Migración preparada, sin aplicar

Se preparó `supabase/migrations/202610220001_course_link_label.sql` con autorización expresa del usuario para **preparar la migración sin aplicarla**. Agrega únicamente `courses.link_label`, de tipo `text` y opcional. Los registros existentes conservan `NULL` y usan el texto automático; no se modifica su URL ni se eliminan datos.

**No se ejecutó esta migración ni se modificó el Supabase remoto.** Antes de publicar la funcionalidad completa del punto 2, se debe autorizar y aplicar esta migración al entorno de destino. Crear o editar cursos con esta versión requiere que exista `link_label`. La consulta pública permite leer registros anteriores sin esa columna; no sustituye la migración necesaria para guardar el texto personalizado.

No hacen falta cambios de esquema para los puntos 1 y 3.

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

La compilación utilizó las variables ficticias de la CI (`https://example.supabase.co`, clave `test-placeholder` y origen `https://example.com`), sin credenciales de producción. La instalación de dependencias y la compilación necesitaron acceso fuera del sandbox para descargar paquetes/fuentes y ejecutar los procesos del compilador. El proyecto conserva su configuración y su archivo de dependencias sin modificaciones.

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

La autorización de publicación en GitHub no modifica el acuerdo sobre la base de datos: la migración continúa preparada, sin aplicar.
