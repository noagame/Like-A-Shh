# Reporte de pruebas, bugs y seguridad — Like a SHH

Fecha: 9 de septiembre de 2026. Commit auditado: `a521410bd3f10c26e4427b20f6e488ca9dfd6eed`. Entorno: Linux, Next.js 16.3.0, React 19.2.4, Supabase, npm.

## Resultado ejecutivo

**No recomiendo aprobar una nueva entrega hasta resolver los hallazgos prioritarios de dependencias, autorización y eliminación de cuentas.** La aplicación compila con Webpack y las pruebas existentes pasan, pero eso no garantiza la seguridad de sus acciones ni la integridad de sus operaciones.

Se identificaron 12 grupos de hallazgos y 2 riesgos pendientes de validación. La auditoría de npm informa 5 paquetes vulnerables (1 crítico, 3 altos, 1 moderado). Se agregaron 10 pruebas de caracterización que reproducen defectos en las funciones reales usando servicios simulados. No se implementaron fixes funcionales.

Los hallazgos de autorización están confirmados en la capa de aplicación. Su explotación contra datos reales depende de las políticas RLS, permisos de columnas y Storage, que no están disponibles en el repositorio. No se demostró una intrusión ni ejecución remota de código.

## Alcance y evidencia

Se revisaron autenticación, recuperación, middleware, layouts, acciones administrativas, perfil/privacidad, inscripciones, reseñas, mapas, formulario de contacto, configuración HTTP y dependencias. Las operaciones mutantes se ejecutaron exclusivamente con mocks: no se crearon usuarios, enviaron correos ni eliminaron datos reales.

| Comprobación | Resultado |
| --- | --- |
| Suite original `npm run test:run` | 8 archivos, 15 pruebas aprobadas |
| Suite ampliada `npm run test:run` | 9 archivos, 25 pruebas aprobadas |
| TypeScript `npx tsc --noEmit --incremental false` | Aprobado, también después de agregar pruebas |
| `npm run lint` | Falla: 30 errores y 4 advertencias |
| Build habitual con Turbopack | No validado: primero falló descarga de fuentes en sandbox; el reintento con acceso a red falló al abrir un puerto interno por permisos del entorno |
| `npm run build -- --webpack` | Aprobado; 36/36 páginas generadas; advertencias Edge Runtime y deprecación de middleware |
| `npm audit --json` | 5 paquetes vulnerables; consulta real del registro, no estimación |
| Navegador local | Login visible; botón de recuperación cambia correctamente al formulario de correo tras terminar la animación |
| HTTP local | 9 rutas comprobadas: `/admin`, `/admin/usuarios` y `/mi-cuenta` redirigen 307 a login; callback sin código redirige 307 a error; las otras 5 responden 200. Detalle en `evidence/2026-09-09/http.json` |

Las pruebas nuevas **pasan cuando reproducen el comportamiento defectuoso**. No deben interpretarse como controles de seguridad aprobados. Al corregir cada hallazgo, sustituir las expectativas por el comportamiento seguro y conservar casos positivos/negativos.

Evidencia reproducible: [tests](../tests/audit/security-reproductions.test.ts), [salida Vitest](evidence/2026-09-09/tests.txt), [lint JSON](evidence/2026-09-09/lint.json), [audit npm](evidence/2026-09-09/npm-audit.json), [build Webpack](evidence/2026-09-09/build-webpack.txt), [build Turbopack](evidence/2026-09-09/build-turbopack.txt).

## Hallazgos y correcciones

### H00 — Dependencias con avisos críticos y altos — P0

**Confirmado por versiones del lockfile, npm audit y advisories oficiales.**

| Paquete instalado | Severidad de npm | Corrección mínima según rango del aviso | Contexto |
| --- | --- | --- | --- |
| next 16.3.0 | Crítica | 16.3.3 | Dependencia directa de producción |
| sharp 0.35.3 | Alta | 0.35.4 | Transitiva de Next, procesamiento de imágenes |
| browserslist 4.28.2 | Alta | 4.28.7 | Marcada dev en lockfile; dos avisos |
| js-yaml 4.3.1 | Alta | 4.3.2 | Marcada dev en lockfile |
| baseline-browser-mapping 2.10.38 | Moderada | 2.11.0 | No marcada dev; comprobar alcance efectivo en build/runtime |

Next incluye un aviso de ejecución remota al optimizar AVIF mediante libheif y otro específico de servidores Windows. El segundo no aplica al Linux local; el sistema operativo del despliegue no fue verificado. El primero requiere que el optimizador procese contenido afectado: hay optimización habilitada y patrones remotos amplios para Storage de Supabase, pero no se intentó explotar el decodificador.

**Fix:** actualizar Next y resolver sharp a versiones corregidas compatibles; renovar lockfile y dependencias transitivas; no usar `audit fix --force` indiscriminadamente. Verificar `npm ls next sharp`, auditoría completa y de producción, build y carga de imágenes. Restringir imágenes remotas al proyecto/bucket necesario.

Fuentes: [Next/AVIF](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4), [Next/Windows](https://github.com/advisories/GHSA-p293-qw3h-jr36), [sharp/libheif](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c). Los otros avisos y rangos quedan en el JSON de npm.

### H01 — Acciones administrativas sin autorización por rol — P1

**Confirmado con mocks; impacto en base real condicionado a RLS.** `app/admin/usuarios/actions.ts:9` y `:46` verifican que exista usuario, pero no que sea administrador. `updateUser` acepta el ID objetivo y `role` del formulario. Las acciones de `app/admin/medios/actions.ts:57` y varias de eventos/whitelist mutan sin una validación previa de administrador.

**Reproducción:** las pruebas H01 llaman `updateUser` con usuario normal y `role=admin`: se alcanza el UPDATE sin consultar el rol; `createGallery` alcanza INSERT sin llamar `getUser`. El layout administrativo sí valida rol, pero no sustituye la autorización de cada Server Action invocable directamente. [Guía oficial Next](https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/data-security.mdx).

**Impacto:** escalada de privilegios o cambios no autorizados si la base permite la escritura; especialmente peligroso si una política permite al propietario editar cualquier columna de su perfil.

**Fix:** centralizar `requireAdmin()` y ejecutarlo antes de consultas, uploads y mutaciones en todas las acciones administrativas; validar IDs y enum de roles. En DB impedir que un usuario normal cambie `profiles.role`, incluso de su propia fila. La política genérica de propietario recomendada en el reporte anterior no resuelve el permiso por columna.

**Aceptación:** anónimo y usuario normal no causan ninguna mutación ni en acciones ni vía API directa de Supabase; administrador sí. Probar cambios de rol propio y ajeno.

### H02 — Login permite continuar si el limitador falla — P1

**Reproducido.** `app/login/actions.ts:30–42` captura cualquier excepción de Redis y continúa hacia `signInWithPassword`, también en producción. Esto contradice la protección de `lib/rate-limit.ts` cuando falta configuración.

**Reproducción:** test H02 define producción y un limitador que lanza excepción; se invoca el proveedor de login.

**Fix:** devolver error temporal y no autenticar cuando falle el limitador en producción; instrumentar disponibilidad. Definir IP desde el proxy confiable, no aceptar indiscriminadamente toda la cadena `x-forwarded-for`; combinar límites por IP y cuenta. La falsificación de IP no fue demostrada y depende del proxy desplegado.

**Aceptación:** timeout/excepción impide autenticar; sexto intento dentro de ventana se limita; comportamiento de proxy documentado y probado.

### H03 — Eliminación de cuenta comunica éxito aunque falle y no borra Auth explícitamente — P1

**Reproducido el falso éxito.** `app/mi-cuenta/perfil/actions.ts:88–109` ignora errores al borrar asistencias/perfil, cierra sesión y redirige a `cuenta_eliminada=1`. La UI promete borrar cuenta e historial. `app/admin/usuarios/actions.ts:46` también elimina perfil sin una eliminación explícita de Auth.

**Reproducción:** H03 devuelve `permission denied` en las operaciones y aun así obtiene la redirección de éxito.

El código no llama `auth.admin.deleteUser` ni una RPC de eliminación integral. No hay evidencia local de un trigger que lo complete. Una FK habitual con cascade borra perfil al borrar Auth, no Auth al borrar perfil. [Documentación Supabase](https://supabase.com/docs/guides/auth/managing-user-data).

**Fix:** proceso servidor autenticado, con reautenticación para la acción sensible, eliminación de Auth y tratamiento explícito de registros asociados/Storage. Mantener service role solo en servidor. Usar operación transaccional para datos y flujo idempotente para servicios externos; reportar fallos y permitir reintento. Revisar retención de auditoría por separado.

**Aceptación:** ante fallo no se comunica éxito; cuenta eliminada no puede iniciar sesión nuevamente; datos asociados se eliminan o retienen según política explícita. Considerar vigencia residual de JWT al diseñar revocación, no asumir que borrar Auth invalida inmediatamente todos los tokens.

### H04 — Anonimización incompleta frente a lo que anuncia la interfaz — P2

**Reproducido en payload.** `app/mi-cuenta/perfil/actions.ts:52` mantiene email e ID y agrega log asociado a usuario/IP; no modifica metadatos de Auth. H04 comprueba que el UPDATE marca `is_anonymized=true` sin modificar email. La interfaz promete ocultar información de contacto.

**Fix:** definir si el producto ofrece ocultación de perfil, seudonimización o anonimización; adaptar implementación y texto a ese alcance. Revisar vistas históricas, email y logs, y restringir acceso a datos conservados. Evitar reintroducir datos mediante edición manteniendo la marca de anonimizado.

**Aceptación:** comprobar la información visible en perfil, reportes y exportaciones con cuenta anonimizada. Es un hallazgo técnico/producto, no un dictamen legal.

### H05 — Recuperación desde login apunta a la página equivocada — P1

**Reproducido el destino; flujo de correo real no ejecutado.** `app/login/actions.ts:114` usa `/auth/recuperar`, página que pide nuevamente el email; la pantalla para cambiar contraseña es `/auth/actualizar-password`. Además, al no existir `NEXT_PUBLIC_SITE_URL` en el entorno local, esta acción usa `http://localhost:3000` aunque la app se ejecute en otro origen.

**Fix:** unificar ambos flujos de recuperación y sus URL. En SSR/PKCE intercambiar código por sesión en un callback dedicado y redirigir al formulario correcto, validando cualquier destino permitido. Configurar URL canónica y lista de redirects en Supabase.

**Aceptación:** desde ambas entradas, un enlace real con cuenta de prueba llega a cambiar contraseña; probar expirado, reutilizado y sesión ausente. No enviar otro correo como paso intermedio.

### H06 — Inscripciones con validación incompleta y reserva no atómica — P1

**Reproducidos dos defectos; concurrencia pendiente en DB.** En `app/mi-cuenta/actions.ts:17–53`, capacidad `0` se interpreta como sin límite por `if (event?.capacity ...)`; las consultas fallidas o evento inexistente no impiden llegar a INSERT. No se valida estado publicado ni fecha en la acción, aunque la pantalla sí filtra ambos. Conteo e inserción son operaciones independientes.

**Reproducción:** tests H06 aceptan evento con cero cupos y muestran intento de INSERT tras error de consulta. Una DB con FK puede rechazar el segundo caso, pero la acción debe interrumpirse antes.

**Impacto adicional condicionado:** dos reservas pueden leer el último cupo disponible simultáneamente; el conteo directo puede estar limitado por RLS y contar solo filas visibles. No se verificaron triggers o locks externos que lo eviten.

**Fix:** RPC transaccional con bloqueo del evento, estado/fecha, conteo autorizado y límite global; unicidad usuario/evento y reinscripción idempotente. Diferenciar `null` de `0`, rechazar errores y validar ID.

**Aceptación:** con un cupo y 20 solicitudes concurrentes solo una nueva inscripción; cero cupos rechaza; evento borrador/pasado/inexistente rechaza; reinscripción existente no consume cupo extra.

### H07 — Restricción de edad inconsistente — P2

**Reproducido.** `completarPerfil` exige 18 años, pero `actualizarPerfil` (`app/mi-cuenta/perfil/actions.ts:12`) acepta cualquier string de fecha. H07 envía `2099-01-01` y alcanza UPDATE exitoso. El layout de cuenta tampoco exige completar el perfil antes de usar la cuenta.

**Fix:** compartir validador de fecha/edad en alta y edición; definir guardia de perfil completo donde el negocio lo requiera. Calcular fechas civiles de forma coherente con Chile.

**Aceptación:** fecha futura, inválida y menor de 18 se rechazan en todas las entradas; validar cumpleaños y cambios de día/zona horaria.

### H08 — Búsqueda de mapas concatena parámetros y no controla servicio remoto — P2

**Reproducido.** `app/api/maps/route.ts:12` concatena `q` sin codificar: `Santiago&countrycodes=us` pasa a ser un segundo parámetro `countrycodes` y modifica el valor buscado. No es evidencia de SSRF: el host está fijo. No hay timeout explícito, validación de estado HTTP, caché ni limitador en la ruta.

**Fix:** construir URL con `URLSearchParams`, limitar longitud de consulta, timeout y manejo de 429/5xx; caché y control de uso acordes al proveedor.

**Aceptación:** `&`, `#`, tildes y Unicode se mantienen dentro de `q`; respuesta controlada en timeout/error sin devolver éxito engañoso.

### H09 — CSP bloquea el formulario de contacto — P1

**Confirmado por configuración y cabecera HTTP; no se envió un mensaje real.** `app/components/ContactSection.tsx:73` hace fetch a un endpoint cuyo origen configurado es `https://formspree.io`. `next.config.ts:28` permite conexiones solo a self, Supabase y Google APIs. El origen Formspree no está permitido en `connect-src`, tanto en desarrollo como en producción.

**Fix:** permitir exactamente el origen requerido o implementar envío servidor con validación y control de abuso. Mantener política restrictiva para otros orígenes.

**Aceptación:** envío autorizado a un buzón de prueba funciona sin violación CSP; fallo remoto presenta mensaje y permite reintentar. No se probó entrega de correo.

### H10 — Calidad: lint bloqueado y pruebas de integración que no ejercitan aplicación — P2

**Confirmado.** 30 errores y 4 advertencias: `any`, impureza en render y actualizaciones de estado en efectos. No todos representan un bug visible; no se atribuyen fallos de hidratación sin reproducción.

`tests/integration/login.test.ts` valida un esquema duplicado, sin importar `signIn`. `tests/integration/auth-callback.test.ts` comprueba `URL.searchParams` sin ejecutar el handler. Por tanto pueden pasar aunque se rompan login/callback.

**Fix:** resolver errores por categoría, sustituir contratos duplicados por pruebas sobre módulos reales y agregar integración con Supabase aislado. Añadir lint, typecheck, tests y build al CI con fallo bloqueante.

**Aceptación:** lint sin errores, casos negativos de autenticación/autorización y pruebas que fallen si se elimina la protección del handler real.

### H11 — Errores de consentimiento y operaciones de medios se pierden — P2

**Confirmado por lectura de código; no validado contra Storage real.** El registro de consentimiento en ambos signUp espera INSERT sin revisar `{ error }`: Supabase puede devolver error sin lanzar excepción, haciendo inefectivo el catch. Con confirmación de email puede no existir sesión para una política de inserción autenticada.

`app/admin/medios/actions.ts:43` ignora errores de Storage/DB y acepta `storage_path` del formulario separado del ID; el upload no elimina el objeto si falla insertar metadata. Puede haber falsa eliminación o archivos huérfanos.

**Fix:** manejar resultados de cada operación; registrar consentimiento de manera confiable y auditable; resolver ruta del archivo desde su registro autorizado, validar tipo/tamaño/contenido, y compensar uploads fallidos. No se confirmó XSS mediante archivos ni acceso arbitrario a Storage.

**Aceptación:** fallos inducidos no comunican éxito; metadata y objeto permanecen coherentes; path manipulado no borra otro recurso; consentimiento es verificable tras confirmación de correo.

## Riesgos pendientes, sin explotación confirmada

1. **RLS, grants y Storage:** faltan migraciones/políticas locales. Auditar profiles (especialmente role), attendances, reviews, likes, media, galleries, consent_logs, audit_log, invitations y vistas agregadas. Probar anónimo, usuario A, usuario B y admin contra API directa. Ausencia de SQL no demuestra ausencia de protección en producción.
2. **Reglas de reseñas y privacidad de registro:** `submitEventReview` permite reseñar una clase terminada sin inscripción, o una futura con inscripción, y acepta ratings fraccionarios. El comentario y mensaje sugieren una regla OR deliberada, por lo que requiere definición de producto antes de llamarlo bug. `checkEmailAvailable` y errores de registro distinguen existencia de correo; determinar necesidad de ese comportamiento, normalizar respuestas y controles de abuso según política de privacidad. No se intentó enumerar cuentas reales.

## Plan de fixeo priorizado

Estimaciones orientativas para un desarrollador, sujetas a acceso al entorno de pruebas y complejidad real de DB.

| Orden | Trabajo | Responsable sugerido | Esfuerzo | Criterio de salida |
| --- | --- | --- | --- | --- |
| 1 — inmediato | H00: actualizar dependencias de runtime y lockfile | Full stack/DevOps | 0,5–1 día | Sin avisos críticos/altos aplicables al runtime; build e imágenes verificados |
| 2 — antes de release | H01: guardias admin y auditoría RLS/grants/Storage | Backend/DB | 1–2 días | Matriz A/B/admin/anónimo aprobada; role inmutable para usuario |
| 3 — antes de release | H02 y H03: limitador ante fallos y eliminación integral | Backend | 1–2 días | Fallos controlados; eliminación idempotente comprobada con cuenta desechable |
| 4 — siguiente | H05 y H09: recuperación y contacto | Full stack | 0,5–1 día | Ambos flujos verificados de extremo a extremo |
| 5 — siguiente | H06: inscripción transaccional | Backend/DB | 1–2 días | Prueba concurrente sin sobrecupo y errores controlados |
| 6 — siguiente | H04, H07, H08 y H11 | Full stack/Producto | 1–2 días | Privacidad coherente, edad consistente, mapas robustos y sin archivos huérfanos |
| 7 — continuo | H10: calidad y cobertura real en CI | Desarrollo/QA | 1–2 días | Pipeline obligatorio verde y regresiones por hallazgo |

Cada fix debe incluir un caso que falla antes y pasa después. Convertir las pruebas de caracterización H01–H08 a expectativas seguras al implementar el cambio. Agregar E2E para login, recovery, contacto, reserva, cancelación y acciones administrativas con cuentas y datos desechables.

## Límites de esta auditoría

No se contó con usuarios de prueba, acceso a las políticas SQL ni confirmación de configuración del despliegue. No se ejecutaron pruebas de carga contra producción, explotación RCE, mutaciones reales, recuperación por correo ni borrado real. No se certifican accesibilidad, responsive completo, entrega de emails, RLS ni cumplimiento legal. Las comprobaciones HTTP se hicieron en servidor de desarrollo; el build Webpack verifica compilación de producción, no equivalencia total con el despliegue.

El reporte anterior `docs/qa-security-audit-report.md` se conservó como histórico. Su aprobación no cubre estos hallazgos actuales ni las limitaciones de las pruebas originales.
