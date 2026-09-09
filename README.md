# Like a SHH

Aplicación web para un estudio de pole dance, danza exotic y clases online/presenciales. Combina una página pública, una zona de alumnas y un panel de administración para gestionar actividades, cursos, galerías y usuarios.

El proyecto utiliza **Next.js App Router** para la interfaz y la lógica de servidor. Supabase proporciona autenticación, PostgreSQL y almacenamiento de archivos; no hay un backend Express ni un segundo servidor API que levantar por separado.

> **Estado del proyecto:** las correcciones de QA están implementadas y probadas localmente. La migración de seguridad debe aplicarse y verificarse en Supabase antes de desplegar esta versión. El repositorio incluye una migración sobre un esquema existente, no una instalación completa de la base de datos desde cero.

## Índice

- [Funcionalidades y arquitectura](#funcionalidades-y-arquitectura)
- [Requisitos](#requisitos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Puertos y conexiones](#puertos-y-conexiones)
- [Variables de entorno](#variables-de-entorno)
- [Rutas de la aplicación](#rutas-de-la-aplicación)
- [Endpoints HTTP](#endpoints-http)
- [Server Actions](#server-actions)
- [Base de datos y Storage](#base-de-datos-y-storage)
- [Autenticación y permisos](#autenticación-y-permisos)
- [Pruebas y CI](#pruebas-y-ci)
- [Despliegue](#despliegue)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Solución de problemas](#solución-de-problemas)

## Funcionalidades y arquitectura

| Área | Funcionalidades |
| --- | --- |
| Sitio público | Presentación del estudio, actividades, cursos, galería, contacto, términos y privacidad |
| Autenticación | Registro, confirmación de correo, login, recuperación y actualización de contraseña |
| Mi cuenta | Perfil, exploración de actividades, inscripción/cancelación, calendario, historial, reseñas y likes |
| Administración | Eventos, clases online/presenciales, cursos, categorías, galerías, usuarios, dashboard y ajustes |
| Privacidad | Edición y ocultación de datos opcionales; eliminación de cuenta con confirmación de contraseña |

**Stack del repositorio:** Next.js 16.3.4, React 19.2.4, TypeScript, Tailwind CSS 4, Supabase JS/SSR, Zod, React Hook Form, Framer Motion, FullCalendar, Recharts, Vitest y Testing Library. Las versiones resueltas se encuentran en [package-lock.json](package-lock.json).

```text
Navegador
  ├─ Next.js: páginas, Route Handlers y Server Actions
  │    ├─ Supabase: Auth, PostgreSQL, RPCs y Storage
  │    ├─ Upstash Redis: límites de solicitudes
  │    └─ Nominatim: búsqueda de direcciones desde /api/maps
  ├─ Supabase Auth: operaciones del cliente, como actualizar contraseña
  └─ Formspree: envío del formulario de contacto
```

La protección de navegación vive en [proxy.ts](proxy.ts). Las acciones administrativas vuelven a comprobar identidad y rol con [requireAdmin](lib/auth/authorize.ts). Las políticas RLS y las funciones SQL completan el control de acceso a los datos.

## Requisitos

- **Node.js 24 y npm 11** para replicar el entorno utilizado en QA: Node 24.14.1 y npm 11.11.0. La CI usa Node 24.
- Un proyecto **Supabase** con el esquema de la aplicación, Auth y buckets de Storage configurados.
- **Upstash Redis** para los flujos limitados en producción.
- Un endpoint **Formspree** para enviar mensajes desde el formulario de contacto.
- Para pruebas SQL: **PostgreSQL 16**, cliente `psql` y **Python 3**. Son independientes de las pruebas Vitest.
- Acceso de red durante instalación y build: `next/font/google` descarga Inter, Montserrat y Playfair Display.

El archivo [tests/database/fixture.sql](tests/database/fixture.sql) crea un esquema reducido para pruebas. **No debe usarse como esquema de producción.** Para un proyecto Supabase nuevo se necesita además el esquema real y sus datos/configuración iniciales.

## Instalación y ejecución

Desde la raíz del repositorio:

```bash
npm ci
```

En una instalación nueva, crear el archivo local de configuración:

```bash
cp .env.example .env.local
```

Si `.env.local` ya existe, editarlo conservando sus valores; no reemplazarlo por la plantilla. Completar las variables descritas abajo y preparar Supabase según [su guía de despliegue](supabase/README.md).

### Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). Para fijar otra interfaz y puerto:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3100
```

Si se usa ese origen, configurar `NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3100` y autorizar sus callbacks de desarrollo en Supabase. La variable de URL canónica **no cambia** el puerto de escucha del servidor.

Si Turbopack presenta restricciones de ejecución en el entorno local, está disponible el modo de desarrollo con Webpack:

```bash
npm run dev -- --webpack --hostname 127.0.0.1 --port 3100
```

### Compilación y servidor de producción

```bash
npm run build
npm run start -- --hostname 127.0.0.1 --port 3000
```

`build` ejecuta `next build --webpack`. `start` sirve el contenido compilado de `.next`; no recompila los cambios. Para una instalación publicada, colocar el servidor detrás del proxy/hosting HTTPS y configurar el origen público real en `NEXT_PUBLIC_SITE_URL`.

Aunque `next start` se pruebe en localhost, las acciones de registro y recuperación exigen una URL canónica **HTTPS** cuando `NODE_ENV=production`. Usar `next dev` para los flujos de autenticación locales sobre HTTP.

### Comandos disponibles

| Comando | Uso |
| --- | --- |
| `npm ci` | Instalar las versiones exactas del lockfile |
| `npm run dev` | Desarrollo con recarga automática |
| `npm run build` | Compilar producción con Webpack |
| `npm run start` | Iniciar el servidor de producción ya compilado |
| `npm run lint` | Ejecutar ESLint |
| `npm run typecheck` | Validar TypeScript sin emitir archivos |
| `npm run test:run` | Ejecutar Vitest una vez |
| `npm run qa` | Lint sin advertencias → tipos → Vitest → build |
| `npm audit` | Consultar vulnerabilidades de dependencias; requiere red |
| `npm run doctor` | Análisis complementario con `react-doctor@latest`; requiere red y no forma parte de `qa` |

## Puertos y conexiones

| Servicio | Puerto | Contexto |
| --- | --- | --- |
| Next.js | `3000` por defecto | Páginas, endpoints y Server Actions en el mismo servidor |
| Next.js de QA | `3100` | Puerto alternativo usado en verificaciones locales; no está fijado en el código |
| PostgreSQL de pruebas | `55439` en localhost | Puerto exigido por `tests/database/run.py` |
| PostgreSQL en el contenedor de CI | `5432` interno | La CI publica `55439:5432` |
| Supabase Auth/REST/Storage | `443` HTTPS | Conexiones al origen de `NEXT_PUBLIC_SUPABASE_URL` |
| Upstash y Formspree | `443` HTTPS | Servicios remotos; no requieren servidores locales adicionales |
| Nominatim | `443` HTTPS | Consulta desde el servidor a `nominatim.openstreetmap.org` |
| Google Fonts | `443` HTTPS | Descarga de fuentes durante compilación |

La aplicación utiliza Supabase por HTTP mediante su SDK. La conexión PostgreSQL directa se usa para migraciones y pruebas, no requiere exponer un puerto de base de datos al navegador. Para el Supabase remoto, utilizar la cadena de conexión proporcionada por ese proyecto; `55439` es exclusivamente de pruebas locales.

## Variables de entorno

Plantilla: [.env.example](.env.example). Valores locales: `.env.local`, excluido de Git.

| Variable | Cuándo se necesita | Descripción |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Aplicación y build | Origen HTTPS del proyecto Supabase; también delimita las imágenes remotas permitidas |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Cliente y servidor | Clave pública del proyecto. El navegador la utiliza; la protección de datos depende de RLS |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Compatibilidad del servidor/proxy | Alternativa a la publishable key en esos módulos. **No sustituye** la publishable key que requiere el cliente del navegador |
| `NEXT_PUBLIC_SITE_URL` | Registro/recuperación; obligatoria en producción | Origen canónico, sin rutas. HTTPS en producción; debe coincidir con las URLs autorizadas en Supabase |
| `NEXT_PUBLIC_FORMSPREE_URL` | Formulario de contacto | Endpoint completo del formulario, por ejemplo `https://formspree.io/f/tu-formulario` |
| `UPSTASH_REDIS_REST_URL` | Producción | URL REST de Redis |
| `UPSTASH_REDIS_REST_TOKEN` | Producción | Token privado de Redis, solo servidor |
| `TRUSTED_CLIENT_IP_HEADER` | Despliegues detrás de proxy | Nombre de una cabecera que el proxy **sobrescribe** con una sola IP validada. No aceptar una cabecera controlada por visitantes |
| `QA_DATABASE_URL` | Runner SQL | URL de una base desechable en `localhost:55439`; no es una variable del runtime web |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo si se utiliza `lib/supabase/admin.ts` | Clave privada de privilegios elevados. Ese cliente auxiliar no está importado por los flujos actuales; no hace falta para las nuevas RPCs |

Las variables `NEXT_PUBLIC_*` son públicas y pueden quedar incorporadas en los recursos del navegador durante el build. No colocar allí tokens de Redis ni claves service role. Si cambian valores públicos de un despliegue, reconstruir la aplicación.

El limitador usa ventanas de **5 solicitudes por 60 segundos por clave**. Autenticación aplica claves por acción/IP y por acción/hash de correo; mapas utiliza una clave por administrador. Sin `TRUSTED_CLIENT_IP_HEADER` válida se comparte la clave de IP `shared`. Sin Upstash, desarrollo permite solicitudes con una advertencia; producción bloquea las operaciones que dependen del limitador. Una excepción del servicio también impide continuar el login.

## Rutas de la aplicación

Estas rutas sirven páginas; no representan por sí mismas endpoints REST de creación o eliminación de datos. `[id]` es un identificador dinámico.

### Sitio público y autenticación

| Ruta | Contenido / acceso |
| --- | --- |
| `/` | Página pública del estudio |
| `/login` | Login, registro y recuperación mediante modos del formulario |
| `/registro` | Formulario de registro independiente |
| `/registro/completar-perfil` | Completar perfil y validar mayoría de edad; requiere sesión |
| `/auth/verificar-email` | Instrucciones para verificar correo |
| `/auth/confirmado` | Confirmación de registro |
| `/auth/recuperar` | Solicitar enlace de recuperación |
| `/auth/actualizar-password` | Cambiar contraseña; la operación verifica sesión |
| `/auth/error` | Mensaje de error de autenticación y reenvío de confirmación |
| `/privacidad`, `/terminos` | Documentos públicos |

### Zona de cuenta

Requiere sesión y un perfil con fecha de nacimiento válida para una persona adulta. Si falta completar el perfil, se redirige a `/registro/completar-perfil`.

| Ruta | Contenido |
| --- | --- |
| `/mi-cuenta` | Resumen, próximas clases e historial |
| `/mi-cuenta/explorar` | Actividades publicadas y futuras; filtro `?categoria=<id>` |
| `/mi-cuenta/clases` | Clases y calendario |
| `/mi-cuenta/galeria` | Galerías y likes |
| `/mi-cuenta/perfil` | Datos personales, ocultación, eliminación e historial de consentimiento |

### Administración

Requiere `profiles.role = 'admin'`. Sin sesión se redirige a login; un usuario sin rol administrativo no puede acceder al panel ni ejecutar sus acciones protegidas.

| Ruta | Contenido |
| --- | --- |
| `/admin` | Inicio del panel |
| `/admin/dashboard` | Métricas y gráficos |
| `/admin/eventos` | Gestión de actividades; filtros `?estado=...&categoria=...` |
| `/admin/eventos/nuevo` | Creación de evento |
| `/admin/eventos/[id]/editar` | Edición y lista de invitados |
| `/admin/clases-online`, `/admin/clases-online/nuevo` | Formularios de clases virtuales |
| `/admin/clases-presenciales`, `/admin/clases-presenciales/nuevo` | Formularios de clases presenciales |
| `/admin/cursos` | Gestión de cursos |
| `/admin/categorias` | Gestión de categorías |
| `/admin/galeria`, `/admin/galeria/[id]` | Galerías y archivos |
| `/admin/usuarios`, `/admin/usuarios/[id]/editar` | Gestión de usuarios y roles |
| `/admin/ajustes` | Configuración de contenido y SEO |

## Endpoints HTTP

Existen **dos Route Handlers propios** en archivos `route.ts`.

### `GET /api/maps`

Busca direcciones de Chile mediante Nominatim. Requiere cookies de una sesión administrativa; las claves públicas de Supabase por sí solas no autorizan el endpoint.

**Parámetro:** `q`, texto de búsqueda de 3 a 200 caracteres tras quitar espacios externos. Una consulta ausente o vacía devuelve `[]` después de comprobar permisos.

```text
GET /api/maps?q=Santiago%20Centro
```

| Estado | Respuesta / motivo |
| --- | --- |
| `200` | Array JSON del proveedor, hasta 5 resultados; la interfaz utiliza `place_id` y `display_name` |
| `400` | `{"error":"Consulta inválida"}` por longitud |
| `403` | `{"error":"No autorizado"}` sin permisos admin |
| `429` | `{"error":"Intenta más tarde"}` por limitación |
| `502` | `{"error":"Servicio de mapas no disponible"}` si el proveedor responde con error HTTP |
| `503` | Mismo mensaje ante timeout, excepción o respuesta que no sea un array |

Timeout de consulta: **5 segundos**. La petición al proveedor declara revalidación de caché cada **86.400 segundos**. Los parámetros se construyen con `URLSearchParams` y la búsqueda se limita a `countrycodes=cl`.

Comprobación de solo lectura sin sesión, con respuesta esperada `403`:

```bash
curl -i --get 'http://localhost:3000/api/maps' \
  --data-urlencode 'q=Santiago Centro'
```

Implementación: [app/api/maps/route.ts](app/api/maps/route.ts).

### `GET /auth/callback`

Intercambia un código de Supabase por sesión usando el contexto de cookies del navegador. Forma parte del flujo de autenticación/PKCE; no es una API de login por email y contraseña.

| Parámetro | Comportamiento |
| --- | --- |
| `code` | Código recibido de Supabase, necesario para intercambiar la sesión |
| `next` | Solo se reconoce `/auth/actualizar-password`; cualquier otro valor utiliza el destino normal |
| `error_description` | Si está presente, redirige directamente a la pantalla de error |

| Resultado | Respuesta |
| --- | --- |
| Intercambio correcto | `307` a `/auth/confirmado` |
| Intercambio correcto con destino de recuperación | `307` a `/auth/actualizar-password` |
| Código ausente/inválido o error del proveedor | `307` a `/auth/error?message=...` |

Ejemplo de URL generada para recuperación:

```text
https://tu-dominio.cl/auth/callback?next=/auth/actualizar-password
```

Supabase añade los parámetros de autenticación al volver al sitio. No probar el callback exitoso con un código inventado: se necesita el flujo completo y sus cookies.

Implementación: [app/auth/callback/route.ts](app/auth/callback/route.ts).

### Recursos generados

`GET /robots.txt` y `GET /sitemap.xml` se generan desde [app/robots.ts](app/robots.ts) y [app/sitemap.ts](app/sitemap.ts). Actualmente esos archivos contienen el dominio `https://www.likeashh.cl`; revisarlos si cambia el dominio. Los recursos de `public/` se sirven desde la raíz, por ejemplo `/assets/...`.

No hay un endpoint propio `/health` ni una API REST `/api/login`, `/api/events` o `/api/users` implementada en este repositorio.

## Server Actions

Las mutaciones principales utilizan **Server Actions de Next.js**. Sus solicitudes POST y referencias son gestionadas por Next/React y no constituyen URLs REST estables para consumidores externos. Se invocan desde los formularios/componentes del proyecto.

| Módulo | Operaciones principales | Acceso |
| --- | --- | --- |
| `app/login/actions.ts` | `signIn`, `signUp`, `resetPassword`, `signOut` | Autenticación; límites según operación |
| `app/registro/actions.ts` | Wrapper del registro común | Público, con validación y consentimiento |
| `app/auth/error/action.ts` | `reenviarConfirmacion` | Reenvío de confirmación |
| `app/registro/completar-perfil/actions.ts` | `completarPerfil` | Usuario autenticado |
| `app/mi-cuenta/actions.ts` | `attendEvent`, `cancelAttendance` | Usuario autenticado |
| `app/mi-cuenta/reviews-actions.ts` | `submitEventReview`, `toggleLikeCourse` | Usuario autenticado |
| `app/mi-cuenta/galeria/actions.ts` | `toggleLikeMedia` | Usuario autenticado |
| `app/mi-cuenta/perfil/actions.ts` | `actualizarPerfil`, `anonimizarDatos`, `eliminarCuentaTotal` | Propietario; contraseña reciente para borrado |
| `app/admin/**/actions.ts`, `actions.tsx` y acciones inline | CRUD, medios, roles, listas de invitados y ajustes | Administrador |

El nombre histórico `anonimizarDatos` se conserva en código, pero la función actual ofrece **ocultación de datos opcionales**, no anonimización de la identidad.

El registro requiere nombre, correo, contraseña de al menos 8 caracteres, confirmación coincidente y `accepted_privacy=on`. Las reseñas admiten puntuaciones enteras de 1 a 5; la regla actual permite valorar una clase terminada **o** una clase con inscripción del usuario.

## Base de datos y Storage

### Objetos utilizados

| Grupo | Tablas / vistas referenciadas por la aplicación |
| --- | --- |
| Identidad y privacidad | `auth.users`, `profiles`, `consent_logs`, `audit_log` |
| Actividades | `events`, `categories`, `attendances`, `event_invitations`, `event_reviews` |
| Cursos y galerías | `courses`, `course_likes`, `galleries`, `media`, `media_likes` |
| Contenido y analítica | `site_settings`, `testimonials`, `sponsors`, `events_log` |
| Consultas agregadas | `weekly_signups`, `event_attendance_counts`, `top_actions_last_30_days` |
| Archivos | `storage.objects`; buckets `eventos` y `galerias` |

Este inventario describe referencias del código; no sustituye las definiciones SQL del proyecto real. Los objetos de dashboard/analítica y las vistas también deben existir para obtener sus datos.

### RPCs de la migración de seguridad

| Función | Parámetros | Propósito |
| --- | --- | --- |
| `reserve_event` | `target_event_id uuid` | Reserva atómica con validación de cupos y perfil |
| `add_event_whitelist` | `target_event_id uuid`, `invited_emails text[]` | Registrar/invitar hasta 100 correos en una transacción |
| `hide_my_profile` | Sin parámetros | Ocultar datos opcionales y registrar la solicitud |
| `admin_update_profile` | `target_user_id uuid`, `new_name text`, `new_phone text`, `new_role text` | Edición administrativa con auditoría |
| `delete_account` | `target_user_id uuid` | Eliminación transaccional de Auth y registros asociados conocidos |

Estas RPCs se invocan con `supabase.rpc(...)`. La identidad se obtiene mediante `auth.uid()` en la base; no se acepta del formulario como prueba de autorización. La migración también incorpora funciones auxiliares, políticas restrictivas y triggers de consentimiento, rol y reservas.

**Aplicación de migraciones:** seguir [supabase/README.md](supabase/README.md). Código y migración deben desplegarse juntos: si faltan RPCs, las operaciones correspondientes fallan. El primer rol administrativo debe asignarse mediante un canal de administración confiable de Supabase; el registro público no concede ese rol.

### Archivos

El validador de la aplicación acepta firmas y tipos PNG, JPEG y WebP, con un máximo de **5 MiB** por archivo. También se deben revisar los límites de cuerpo de Server Actions, hosting/proxy y bucket: el límite del validador no amplía los límites de esas capas.

Las rutas de borrado se obtienen de la metadata autorizada en DB. Si un upload no logra guardar su registro, se intenta retirar el objeto creado. Si una cuenta posee objetos de Storage, su borrado se bloquea sin eliminar sus datos: transferir o eliminar los objetos con la API de Storage antes de reintentar.

## Autenticación y permisos

- Sesiones mediante Supabase SSR y cookies. `proxy.ts` protege `/admin` y `/mi-cuenta`; layouts y acciones comprueban los permisos necesarios.
- Rol administrativo en `profiles.role`; las escrituras de rol están protegidas también en SQL.
- El perfil adulto se valida con fechas civiles de `America/Santiago`. Registro completo y edición comparten el validador.
- Recuperación: solicitud de correo → callback con intercambio de código → formulario de contraseña. Configurar dominio, allowlist y plantilla de correo de Supabase para el entorno correspondiente.
- El borrado propio exige confirmar contraseña; la RPC exige autenticación reciente por contraseña. El flujo actual no implementa reautenticación de cuentas exclusivamente OAuth.
- CSP, protección contra frames y otras cabeceras se configuran en [next.config.ts](next.config.ts). `connect-src` permite el origen de Formspree y `unsafe-eval` se limita a desarrollo.

## Pruebas y CI

### Aplicación

```bash
npm run qa
npm audit
```

`qa` no ejecuta PostgreSQL ni `npm audit`; son comprobaciones separadas. Vitest cubre validaciones, handlers y acciones reales con dependencias simuladas. No envía correos ni crea cuentas en el Supabase remoto.

### Base de datos

Preparar una **base nueva y desechable** en PostgreSQL 16, accesible en localhost:55439:

```bash
export QA_DATABASE_URL='postgresql://USUARIO:CLAVE@127.0.0.1:55439/BASE_DE_PRUEBAS'
psql "$QA_DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f tests/database/fixture.sql \
  -f supabase/migrations/202609090001_security.sql
python3 tests/database/run.py
```

El runner crea cuentas ficticias, prueba RLS, reservas concurrentes y borrados. **No apuntarlo a una base real.** El fixture no es idempotente para un esquema ya cargado; utilizar una base nueva para repetir su instalación.

### Integración continua y último resultado

[.github/workflows/qa.yml](.github/workflows/qa.yml) define jobs de aplicación y PostgreSQL 16 en pushes a `main` y pull requests. Incluye instalación reproducible, auditoría npm y las pruebas SQL. [React Doctor](.github/workflows/react-doctor.yml) se mantiene como análisis complementario.

Última revisión local documentada, **9 de septiembre de 2026**:

| Comprobación | Resultado |
| --- | --- |
| Vitest | 53 pruebas aprobadas |
| PostgreSQL temporal | 21 pruebas aprobadas, incluida concurrencia de 20 reservas por un cupo |
| HTTP sobre producción local | 13 comprobaciones aprobadas |
| Lint / TypeScript / build | Sin errores; lint sin advertencias |
| npm audit | 0 vulnerabilidades en el lockfile evaluado |

[Reporte completo del retest](docs/qa-security-retest-2026-09-09.md) · [Evidencias](docs/evidence/2026-09-09-retest) · [Auditoría anterior](docs/qa-security-audit-2026-09-09.md).

Los resultados son una fotografía de esa revisión local. No certifican el esquema remoto, la entrega de correos ni el despliegue. La CI está configurada, pero no se ejecutó en GitHub durante esa revisión.

## Despliegue

1. Preparar staging con el esquema real y un respaldo. Revisar compatibilidad de la migración con tablas, FKs, triggers y políticas existentes.
2. Aplicar la migración de seguridad y validar las RPCs con cuentas de prueba.
3. Configurar variables, dominio HTTPS, redirects/plantillas de Supabase, Upstash, Formspree y proxy de IP confiable.
4. Ejecutar `npm ci`, `npm run qa` y `npm audit` con la configuración de despliegue. Las variables públicas deben estar disponibles durante el build.
5. Publicar la aplicación y servirla con el runtime Node del hosting o `npm run start` detrás del proxy HTTPS.
6. Verificar registro/recuperación por correo, contacto, permisos entre usuarios, reservas y Storage en staging antes de aprobar producción.

Revisar [la guía detallada](supabase/README.md) para los bloqueos de eliminación, requisitos SQL y coordinación entre aplicación y migración. No existe un script de despliegue automático ni una configuración de hosting específica en `package.json`.

## Estructura del repositorio

```text
app/
  api/maps/                 Endpoint de direcciones
  auth/                     Confirmación, recuperación y callback
  admin/                    Panel y acciones administrativas
  mi-cuenta/                Área de usuario, reservas y privacidad
  registro/                 Registro y perfil inicial
  components/               Componentes del sitio público
  layout.tsx                Layout, fuentes y metadatos
  page.tsx                  Inicio público
lib/
  auth/                     Autorización, URL canónica y limitación
  supabase/                 Clientes de navegador, servidor y auxiliar admin
  validation/               Validación de perfil e imágenes
  hooks/                    Estado de cliente y fecha/hora
  application/              Controladores y comandos
  domain/                   Modelos de actividad y reseñas
  infrastructure/           Queries, ensambladores y almacenamiento
supabase/
  migrations/               Migración de seguridad sobre esquema existente
  README.md                 Instrucciones de aplicación y QA SQL
tests/
  unit/                     Pruebas unitarias
  integration/              Handlers y flujos con servicios simulados
  audit/                    Regresiones de los hallazgos de QA
  database/                 Fixture SQL y runner contra PostgreSQL
public/assets/              Imágenes y recursos estáticos
docs/                      Reportes y evidencias
.github/workflows/          QA y análisis de React Doctor
proxy.ts                    Protección de navegación y refresco de cookies
next.config.ts              Cabeceras, imágenes remotas y configuración Next
.env.example                Plantilla de configuración sin credenciales reales
```

## Solución de problemas

| Problema | Qué revisar |
| --- | --- |
| Puerto 3000 ocupado | Fijar `--port 3100`; ajustar URL canónica y callbacks si se usa autenticación |
| Variables de Supabase ausentes | Completar `.env.local`, especialmente URL y publishable key; reiniciar el servidor |
| Registro o recuperación falla en producción | `NEXT_PUBLIC_SITE_URL` debe existir, usar HTTPS y coincidir con la allowlist/plantilla de Supabase |
| Login limitado para varios usuarios | Conexión a Upstash y `TRUSTED_CLIENT_IP_HEADER`; sin una IP confiable hay límite compartido |
| Reserva, whitelist o borrado devuelve error de RPC | Verificar que la migración esté aplicada y sea compatible con el esquema; no saltar la validación SQL |
| `/api/maps` devuelve 403 | Es un endpoint exclusivo de administrador; una petición curl sin cookies no tiene sesión |
| Contacto no envía | URL de Formspree y consola del navegador. Si cambia el proveedor/origen, actualizar también `connect-src` |
| Imágenes remotas no cargan | Origen Supabase de `next.config.ts`, bucket/ruta pública y permisos de Storage |
| Upload rechazado antes del validador | Límite de cuerpo de Next Server Actions, proxy/hosting y bucket, además del límite de 5 MiB de la aplicación |
| No se elimina una cuenta con archivos | Transferir/eliminar sus objetos por Storage; la transacción no borra parcialmente la cuenta |
| Build falla descargando fuentes | Permitir acceso a Google Fonts o adaptar las fuentes a archivos locales; no es una instalación de Geist |
| Error de Turbopack por permisos del entorno | Desarrollo admite `--webpack`; el build del proyecto ya utiliza Webpack |
| `next start` no encuentra compilación | Ejecutar `npm run build` primero |
| Dashboard vacío o con consultas fallidas | Confirmar tablas y vistas de analítica del esquema real; el fixture de QA no las aprovisiona |
