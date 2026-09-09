# Reporte de QA posterior a correcciones — Like a SHH

**Fecha:** 9 de septiembre de 2026.  
**Versión evaluada:** cambios locales sobre commit `a521410bd3f10c26e4427b20f6e488ca9dfd6eed`, Next.js 16.3.4.  
**Resultado:** **QA local aprobado: sin errores en los controles ejecutados y sin vulnerabilidades reportadas por npm.**  
**Despliegue:** pendiente de aplicar y verificar la migración en Supabase real. Este reporte no certifica producción.

## Resultados finales

| Control | Resultado verificado |
| --- | --- |
| ESLint, con `--max-warnings 0` | 0 errores, 0 advertencias |
| TypeScript | Sin errores |
| Vitest | **53 pruebas aprobadas**, 11 archivos |
| PostgreSQL 16 temporal | **21 pruebas aprobadas**, 0 fallidas |
| Concurrencia | 20 reservas simultáneas por un cupo: exactamente una admitida; repetición de reserva propia idempotente |
| Build de producción | Aprobado con Webpack; 36/36 páginas generadas, sin advertencias de compilación en el último pase |
| npm audit | **0 vulnerabilidades** en dependencias de aplicación y desarrollo |
| HTTP sobre `next start` | **13/13 comprobaciones aprobadas** |
| Navegador sobre producción local | Login, recuperación y registro visibles y navegables; consola sin errores ni advertencias en esas pantallas |
| Revisión del diff | `git diff --check` sin problemas |

Evidencias: [QA completo](evidence/2026-09-09-retest/qa.txt), [SQL y aplicación de migración](evidence/2026-09-09-retest/database-migration.txt), [pruebas SQL](evidence/2026-09-09-retest/database-tests.txt), [auditoría npm](evidence/2026-09-09-retest/npm-audit.json), [HTTP de producción](evidence/2026-09-09-retest/http-production.json), [navegador](evidence/2026-09-09-retest/browser.txt).

Los tests anteriores que documentaban defectos fueron convertidos a regresiones que **exigen el comportamiento seguro**. Los tests de login y callback importan ahora las funciones reales; no se aprobaron copiando esquemas ni reemplazando lógica por aserciones triviales.

## Cierre de los hallazgos anteriores

| ID | Corrección implementada | Validación y estado |
| --- | --- | --- |
| H00 — dependencias | Next 16.3.4, sharp 0.35.4 y transitivas corregidas; jsdom 29.1.1 compatible con Node local | Cerrado localmente: npm audit sin hallazgos; build aprobado |
| H01 — permisos admin | Guardia central en acciones y páginas administrativas, incluidas acciones inline; proxy verifica rol. Migración restringe tablas/Storage y protege cambios de rol | Regresiones y RLS aprobados en DB temporal. Aplicación a Supabase pendiente |
| H02 — limitador | Fallos del limitador impiden autenticar; límites por IP confiable/configurada y por hash de cuenta; misma protección en registro, recuperación y confirmación para borrado | Casos permitido, denegado y fallo de servicio aprobados. Configuración del proxy real pendiente |
| H03 — eliminación | Reautenticación por contraseña; RPC transaccional elimina cuenta Auth y datos conocidos; errores no muestran éxito ni cierran sesión | Pruebas de éxito, fallo, usuario ajeno, autenticación reciente, FK inesperada y archivos propios aprobadas localmente |
| H04 — privacidad | Opción renombrada como ocultación de datos opcionales, con alcance explícito; identidad/correo/edad conservados. Operación y consentimiento son atómicos; edición restablece el estado visible | Tests de acción y SQL aprobados. No se anuncia anonimización total |
| H05 — recuperación | Entradas unificadas; callback intercambia código y permite solo el destino interno de cambio de contraseña; URL canónica validada; contraseña mínima y sesión verificadas | Callback válido, ausente, expirado y destino externo cubiertos. Entrega de correo real pendiente |
| H06 — reservas | RPC y trigger serializan inscripciones; validan disponibilidad, edad, cupos y unicidad. Whitelist transaccional | Cero cupos, borrador, pasado, inexistente, concurrencia, idempotencia y rollback de whitelist aprobados |
| H07 — edad | Validador común para alta/edición con fecha civil de Chile; perfil completo requerido; trigger protege escrituras directas | Fechas futuras, inválidas, menores de edad y límite del cumpleaños cubiertos; bypass vía DB rechazado |
| H08 — mapas | Parámetros codificados, endpoint restringido a admin, longitud acotada, timeout, caché, limitación y manejo de errores upstream | Tests de parámetros, denegación y error remoto aprobados; HTTP anónimo devuelve 403 |
| H09 — contacto/CSP | `connect-src` permite el origen exacto de Formspree; optimización de imágenes restringida al proyecto Supabase configurado | Configuración y cabecera real de producción verificadas. No se envió un mensaje real |
| H10 — calidad/cobertura | Corregidos tipos y patrones de render/efectos; pruebas sobre handlers reales; scripts QA y CI de aplicación/DB | Lint, tipos, 53 tests y build aprobados. CI configurada, aún no ejecutada en GitHub |
| H11 — consentimiento/medios | Consentimiento mediante trigger de Auth; validación de firma/tamaño/tipo de imágenes, compensación de uploads fallidos, paths resueltos desde DB y errores explícitos | Regresiones de archivos y consentimiento SQL aprobadas. Storage y triggers del proyecto real pendientes |

Otros defectos corregidos durante la revisión:

- El resumen usaba solo clases futuras para construir el historial de clases terminadas. Ahora separa ambas listas desde las asistencias obtenidas.
- Se migró `middleware.ts` a `proxy.ts`, eliminando la advertencia de deprecación.
- Se corrigieron wrappers de formulario de galería que no estaban declarados como Server Actions, y resultados de error que se ignoraban.
- Los modales recuperan el botón tras fallos de guardado y muestran un error.
- La puntuación de reseñas debe ser entera entre 1 y 5. Se conserva la regla de producto existente: clase terminada **o** inscripción; no se cambió unilateralmente a exigir ambas condiciones.

## Comprobaciones HTTP y de interfaz

Se ejecutó la aplicación con `next start`, sobre la compilación final, en `127.0.0.1:3100`.

| Ruta o comportamiento | Resultado |
| --- | --- |
| `/`, `/login`, `/registro`, `/privacidad`, `/terminos` | HTTP 200 |
| `/admin`, `/admin/usuarios`, `/mi-cuenta`, `/registro/completar-perfil` sin sesión | HTTP 307 a login |
| `/auth/callback` sin código | HTTP 307 a página de error |
| `/auth/recuperar`, `/auth/actualizar-password` | HTTP 200 |
| `/api/maps?q=Santiago` sin permisos | HTTP 403 |
| Cabecera CSP de login | Permite Formspree; sin `unsafe-eval` en producción |
| Navegación login → recuperar → login → registro | Correcta tras terminar las animaciones; formulario de registro con confirmación de contraseña y consentimiento |
| Consola del navegador en esos flujos | Sin errores ni advertencias capturados |

No se enviaron formularios que generaran correos, aceptaran términos o crearan usuarios en el servicio real. La inspección visual se hizo en el viewport de escritorio disponible; no sustituye una batería completa de accesibilidad, móviles o navegadores múltiples.

## Qué falta para aprobar producción

**La implementación y el QA local están terminados. La verificación del despliegue sigue pendiente por falta de acceso al esquema y cuentas de prueba de Supabase.**

1. Aplicar y validar [la migración](../supabase/migrations/202609090001_security.sql) en staging con el esquema real. El fixture utilizado aquí es representativo, no una copia de producción. Revisar compatibilidad de políticas, FKs, triggers de Auth y vistas.
2. Configurar URL canónica HTTPS, allowlist y plantilla de recuperación en Supabase, Formspree y cabecera de IP confiable del proxy. Sin cabecera configurada los usuarios comparten un límite conservador por IP, además del límite por cuenta.
3. Probar con cuentas desechables: email de recuperación, creación con consentimiento, permisos entre dos usuarios/admin, subida/borrado de archivos y eliminación de cuenta real de prueba.
4. Desplegar código y migración como una unidad. **No desplegar solo el código:** las nuevas RPCs son obligatorias para reservas, whitelist, ocultación y eliminación. Si faltan, esas operaciones devuelven error.

Si una cuenta posee archivos de Storage, su eliminación se bloquea sin borrar datos; esos archivos deben transferirse o eliminarse mediante la API de Storage antes de reintentar. Esto evita borrar únicamente metadata y dejar archivos huérfanos. Una FK no prevista también revierte la operación completa.

Instrucciones de despliegue y repetición: [guía Supabase y QA](../supabase/README.md). Configuración de ejemplo: `.env.example` en la raíz del proyecto.

## Dictamen

**Aprobado para continuar a validación de staging.** No quedan fallos en la batería local ejecutada ni vulnerabilidades declaradas por npm en el lockfile actual. Los cambios de aplicación y la migración están preparados y probados localmente. No se declara “producción limpia” hasta cerrar las cuatro verificaciones anteriores; no se modificaron datos del Supabase remoto ni se desplegó la aplicación durante esta revisión.
