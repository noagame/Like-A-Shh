# Validación de Supabase antes de publicar en main

Fecha: 22 de octubre de 2026.

El usuario autorizó aplicar las configuraciones faltantes de Supabase y actualizar `main` después de verificarlas. El proyecto utilizado por la aplicación es `ssgcrrblxmmqurjlwope`.

## Estado actual

Las tres configuraciones faltantes quedaron aplicadas al proyecto remoto desde el SQL Editor, después de que el usuario completó el inicio de sesión administrativo. No se copiaron contraseñas ni claves administrativas al repositorio o al chat.

Los cambios se ejecutaron en una sola transacción y se registraron en `supabase_migrations.schema_migrations` con sus fuentes SQL. No se borraron archivos ni se crearon cursos, publicaciones, cuentas o reacciones de prueba en producción. Los seis commits de código publicados primero en `dev`, hasta `ed697fd`, se conservan en la promoción autorizada a `main`.

## Comprobación remota previa de solo lectura

Se consultó la API pública sin recuperar registros de usuarios: consultas `SELECT` con `limit=0` y la función de totales con un arreglo vacío.

| Objeto | Resultado |
| --- | --- |
| `courses` | Disponible |
| `courses.link_label` | Falta; error PostgreSQL `42703` |
| `events.image_url` | Disponible |
| `events.purchase_url` | Disponible |
| `blog_posts` | Disponible |
| `community_posts`, incluidas columnas de moderación | Disponible |
| `community_comments` | Disponible |
| `get_blog_reaction_counts` | Falta en la caché de API; error `PGRST202` |

Estos resultados comprueban compatibilidad de lectura de la API pública. No certifican las políticas administrativas, la configuración de Storage ni los permisos de escritura, que requieren inspección administrativa del esquema real.

Esta tabla refleja el estado anterior a aplicar las migraciones. Las ausencias quedaron resueltas y verificadas en la comprobación posterior.

Evidencia: [public-preflight.json](evidence/2026-10-22-supabase/public-preflight.json).

## Ejecución local de las migraciones

Se aplicaron los archivos exactos `202610220001_course_link_label.sql` y `202610220002_blog_post_reactions.sql` a un PostgreSQL 16.15 desechable, con datos ficticios y políticas representativas. Se utilizó exclusivamente un socket local, sin escucha TCP. El cluster fue detenido y su directorio de datos eliminado al terminar.

Las **39 comprobaciones aprobaron**: conservación y edición de cursos, idempotencia de etiquetas, permisos por alumno y artículo publicado, prohibición de suplantar o modificar reacciones ajenas, restricciones de visitantes y administradores, privacidad de identidades, totales públicos, unicidad, `ON CONFLICT DO NOTHING` y eliminación en cascada.

Evidencia: [migration-tests.json](evidence/2026-10-22-supabase/migration-tests.json).

Esta validación se realizó antes de aplicar cambios remotos y se complementó con la revisión administrativa del esquema real.

## Configuración aplicada

| Versión | Cambio |
| --- | --- |
| `202610220001` | Columna opcional `courses.link_label` |
| `202610220002` | Tabla de reacciones, políticas de alumno y función pública de totales |
| `202610220003` | Permiso de eliminar archivos limitado a administradores autenticados en `eventos/flyers` |

La inspección confirmó las tablas anteriores de Blog y Comunidad, sus claves foráneas, permisos y políticas, la función `is_admin()` y los buckets públicos `blog`, `eventos` y `galerias`. No se reejecutaron migraciones históricas completas ni se alteraron autenticación, correos o credenciales.

El bucket de eventos tenía permisos de lectura y carga, además de una política restrictiva para administradores, pero le faltaba una política permisiva de eliminación. La migración adicional corrige ese caso conservando todas las políticas anteriores. Esta migración pasó **27 comprobaciones adicionales en PostgreSQL temporal**, incluida su doble ejecución, separación por rol, bucket y carpeta, y conservación de objetos existentes al aplicarla.

Evidencia: [storage-tests.json](evidence/2026-10-22-supabase/storage-tests.json).

## Verificación remota posterior

Las **14 comprobaciones de esquema y permisos** aprobaron en el SQL Editor: columna opcional, RLS, clave compuesta, referencias con cascada, políticas de reacciones, privilegios restringidos, función pública con `search_path` fijo y filtro de publicados, permiso limitado de Storage, conservación de las once políticas anteriores y registro de las tres migraciones.

Las **seis comprobaciones de la API pública** también aprobaron. Cursos, imágenes de eventos, Blog, Comunidad y función de totales respondieron HTTP 200. La lectura anónima de identidades de reacciones respondió HTTP 401, como corresponde a sus permisos.

- [schema-postflight.json](evidence/2026-10-22-supabase/schema-postflight.json)
- [public-postflight.json](evidence/2026-10-22-supabase/public-postflight.json)
- [Captura del SQL Editor](evidence/2026-10-22-supabase/supabase-verificacion.jpg)

Las verificaciones remotas fueron de metadatos y lectura. Las mutaciones y los casos de otros usuarios se probaron con datos ficticios en PostgreSQL temporal; no se usaron alumnos reales para comprobar escrituras o borrados.

## Publicación y revisión de dependencias

La entrega funcional y la configuración de Supabase se publicaron primero en `dev` (`c2f7b60`) y después en `main` mediante el merge `6727f11`. En GitHub, [QA de esa publicación](https://github.com/noagame/Like-A-Shh/actions/runs/39830758140) aprobó el trabajo de base de datos, pero el trabajo de aplicación se detuvo en `npm audit --audit-level=moderate`. [React Doctor](https://github.com/noagame/Like-A-Shh/actions/runs/39830758108) aprobó.

Se actualizaron las versiones resueltas de `package-lock.json` dentro de los rangos existentes de `package.json`, mediante `npm audit fix` sin `--force`. Next.js y su configuración de ESLint quedaron en **16.4.2**, Vitest en **4.1.12**, Vite en **8.3.5** y sharp en **0.35.5**, además de correcciones transitivas. La actualización de Next.js/sharp incluye la corrección descrita en el [aviso oficial de Next.js](https://github.com/advisories/GHSA-2464-fhr4-w9xw).

| Validación con las dependencias actualizadas | Resultado |
| --- | --- |
| ESLint, sin advertencias | Aprobado |
| TypeScript | Aprobado |
| Vitest | 199 pruebas aprobadas en 24 archivos |
| Compilación de producción con Next.js 16.4.2 | Aprobada; 40 páginas generadas |
| `npm audit --omit=dev` | Cero vulnerabilidades |
| Auditoría completa | Cinco paquetes señalados por una misma dependencia de desarrollo pendiente |

La compilación interrumpida por el apagado se volvió a ejecutar y terminó con código de salida 0. Utilizó las variables ficticias de CI indicadas en el informe de correcciones.

La alerta restante corresponde a `braces@3.0.3`, en la cadena `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`. El [aviso oficial](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) no ofrece una versión corregida a la fecha de esta revisión. La alternativa automática de npm propone retroceder ESLint de Next a la versión 14.2.35; no se aplicó ese cambio de versión mayor. Se mantiene la auditoría completa y su umbral, por lo que el trabajo de aplicación de GitHub seguirá bloqueado en ese paso mientras persista la alerta. Las comprobaciones locales aprobadas no equivalen a una ejecución completa aprobada de ese workflow.

Evidencias: [auditoría inicial](evidence/2026-10-22-supabase/dependencies-audit-before.json) y [auditoría posterior](evidence/2026-10-22-supabase/dependencies-audit-after.json).
