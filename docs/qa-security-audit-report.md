# 📋 INFORME FINAL DE ASEGURAMIENTO DE CALIDAD (QA) Y CIBERSEGURIDAD
**Proyecto:** Like a Shh  
**Fecha de Auditoría:** 2026-09-01  
**Auditor:** Senior QA & Security Engineer  
**Dictamen General:** 🟢 APROBADO CON OBSERVACIONES  
**Puntuación Global:** 8.8 / 10

---

## 1. Resumen Ejecutivo

La auditoría de código, compilación y pruebas automatizadas confirma que la base del proyecto está en un estado sólido para continuar con una entrega controlada. Se validó lo siguiente:

- Compilación TypeScript correcta.
- Build de producción de Next.js completado sin errores.
- Suite de pruebas automatizadas ejecutada con resultados positivos.
- Implementación de hardening HTTP en la configuración de Next.js con headers de seguridad.
- Protección de rutas privadas a través de middleware y validación de sesión.
- Rate limiting para login con fallback seguro en producción cuando no hay Upstash configurado.

No obstante, hay una observación importante: la auditoría de políticas RLS y Storage en Supabase no puede verificarse plenamente desde el repositorio porque no existen migraciones SQL visibles ni definiciones de políticas en el workspace. El código de la aplicación usa validaciones de sesión adecuadas, pero la defensa definitiva debe reforzarse en la capa de base de datos.

Resumen métrico:
- Rutas evaluadas: 36 (según salida del build)
- Componentes y acciones auditadas: 20+ nodos relevantes
- Tablas de dominio detectadas en uso: profiles, consent_logs, audit_log, events, categories, attendances, course_likes, event_reviews, event_invitations, media_likes

---

## 2. Matriz de Pruebas Funcionales y de Integración

| Módulo / Funcionalidad | Componente / Server Action | Estado (Pass / Fail) | Severidad | Observaciones Técnicas |
| :--- | :--- | :---: | :---: | :--- |
| Autenticación y Rate Limit | `app/login/actions.ts` | Pass | Medium | Validación Zod aplicada; rate limit implementado con fallback fail-closed en producción. |
| Landing Page & Filtro Eventos | `app/components/EventsSection.tsx`, `lib/application/controllers/EventController.ts` | Pass | Low | Se filtran eventos publicados y futuros; no se mezclan clases presenciales ni online en el front público. |
| Asistencias & Ciclo Re-inscripción | `app/mi-cuenta/actions.ts` | Pass | Medium | La lógica de inscripción evita duplicados y conflictos en la clave compuesta. |
| Whitelist & Invitaciones | `app/admin/eventos/whitelist-actions.ts` | Pass | Low | Maneja perfiles ya registrados e invitados pendientes; uso de upsert con conflicto event_id,email. |
| Galería & Reseñas Alumnas | `app/mi-cuenta/reviews-actions.ts`, `app/mi-cuenta/page.tsx` | Pass | Low | Validaciones de puntuación 1–5 y restricciones de participación / finalización. |
| Panel Admin & CRUDs | `app/admin/eventos/actions.tsx`, `app/admin/categorias/actions.tsx`, `app/admin/layout.tsx` | Pass | Medium | Acceso admin verificado por perfil y revalidación de rutas. |
| Ley 21.719 (ARCO / Privacidad) | `app/mi-cuenta/perfil/actions.ts` | Pass | Medium | Se implementan anonimización y registro de consentimiento; falta validación real de cascada en base de datos. |
| Seguridad de Sesión / Middleware | `middleware.ts`, `lib/supabase/server.ts` | Pass | Medium | Protección para rutas privadas y manejo de entorno. |
| Hardening HTTP / Headers | `next.config.ts` | Pass | Low | CSP, X-Frame-Options, nosniff, Referrer-Policy y Permissions-Policy presentes. |

---

## 3. Matriz de Auditoría de Ciberseguridad

### 3.1 Hardening HTTP (CSP, Clickjacking, Permissions)
**Evaluación: ✅ Adecuado**

Se verificaron en `next.config.ts`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` desactivando cámara, micrófono y geolocalización
- `Content-Security-Policy` activo con restricciones a scripts, imágenes y conexiones

Observación:
- La advertencia de Next sobre deprecación de middleware no es un hallazgo de seguridad, pero sí un indicador de deuda técnica y compatibilidad de la convención actual.

### 3.2 Políticas RLS en Base de Datos y Storage
**Evaluación: 🟡 Verificación parcial**

No se encontraron archivos SQL de migración ni políticas RLS dentro del repositorio. Eso impide validar con certeza:

- `profiles`
- `events`
- `attendances`
- `course_likes`
- `media_likes`
- `event_reviews`
- buckets de Storage para eventos y galerías

Sí se evidencia una lógica de aplicación saludable:
- Restricción de acceso por sesión en layouts y Server Actions
- Uso de `auth.getUser()`
- Filtrado por `user_id` en acciones sensibles
- Trazabilidad con `consent_logs` y `audit_log`

Recomendación:
- Ejecutar una auditoría SQL real en Supabase para verificar que no existan políticas públicas con `true` en tablas sensibles.

### 3.3 Control de Inyecciones y Validación Zod
**Evaluación: ✅ Sólido**

Se observan validaciones estrictas con Zod en:

- `app/login/actions.ts`
- `app/mi-cuenta/perfil/actions.ts`
- `app/mi-cuenta/reviews-actions.ts`

La aplicación valida:
- email válido
- contraseñas mínimas
- campos obligatorios
- rango de valoración 1–5
- consentimiento de privacidad

No se detectan signos claros de SQL injection por concatenación directa de strings; se usan queries de Supabase tipadas.

---

## 4. Hallazgos, Vulnerabilidades y Deuda Técnica Detectada

### P3 (Bajo / Mejora Operativa)
1. Advertencia de deprecación de middleware
   - Evidencia: salida de `next build`
   - Relevancia: no bloquea producción, pero debe migrarse a la convención recomendada.
   - Archivo afectado: `middleware.ts`
   - Recomendación: migrar a la estrategia actual recomendada por Next.js.

2. Falta de evidencia directa de políticas RLS en repositorio
   - Evidencia: ausencia de SQL o migraciones visibles
   - Relevancia: la capa de base de datos no puede validarse determinísticamente solo desde código.
   - Recomendación: ejecutar auditoría SQL real en Supabase.

### P2 (Medio / Deuda Técnica)
3. Dependencia de `auth.getUser()` sin control de rol explícito en la base de datos
   - Evidencia: `app/admin/layout.tsx` y diversas acciones administrativas
   - Relevancia: la validación se realiza a nivel de perfil, pero la defensa final debe reforzarse con RLS real.
   - Recomendación: asegurar políticas RLS para tablas administrativas con `auth.uid()` y validación de `profiles.role = 'admin'`.

4. Consent logs con ausencia de control de duplicación o normalización fuerte
   - Evidencia: `app/login/actions.ts`, `app/mi-cuenta/perfil/actions.ts`
   - Relevancia: útil para trazabilidad, pero requiere revisar unique constraints y normalización.
   - Recomendación: definir reglas de unicidad y limpieza de eventos repetidos.

### P1 (Alto Riesgo)
5. Sin validación real de RLS en Storage y tablas de contenido
   - Evidencia: ausencia de migraciones y políticas visibles en el repo
   - Relevancia: si la base de datos desplegada no tiene RLS reforzado, existe riesgo de exposición de información sensible.
   - Recomendación: auditoría SQL real y pruebas de autorización con usuarios de prueba.

### P0 (Crítico / Bloqueante)
- No se detectaron fallos críticos evidentes en la aplicación auditada en este repositorio.
- No se detectó evidencia de bypass de autenticación, inyección o fallo funcional crítico en el build o la suite existente.

---

## 5. Plan de Remediación con Parches de Código

### 5.1 Migración de middleware a la convención actual de Next.js
No es un fallo funcional, pero sí una deuda de compatibilidad y mantenibilidad.

Parches recomendados:
- Eliminar la dependencia deshabilitada del enfoque antiguo de `middleware.ts`.
- Migrar a la estrategia recomendada por Next.js 16 para proteger rutas y sesiones.

Ejemplo de refactor sugerido:

```ts
// app/proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/mi-cuenta")) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = NextResponse.next();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}
```

### 5.2 Reforzar RLS recomendado en Supabase
Ejemplo de política recomendada:

```sql
alter table public.profiles enable row level security;
create policy "profiles_owner_only"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

alter table public.attendances enable row level security;
create policy "attendances_user_only"
on public.attendances
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

alter table public.event_reviews enable row level security;
create policy "event_reviews_owner_only"
on public.event_reviews
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

alter table public.course_likes enable row level security;
create policy "course_likes_owner_only"
on public.course_likes
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

### 5.3 Reforzar trazabilidad de consentimiento
Se recomienda añadir un identificador único y garantizar que las consent logs no se dupliquen por error del cliente:

```sql
create unique index if not exists consent_logs_unique
on public.consent_logs(user_id, consent_type, policy_version, created_at);
```

---

## Evidencia de Verificación Ejecutada

Se corrieron estas comprobaciones reales en el repositorio:

- `npx tsc --noEmit`
- `npm run build`
- `npm run test:run`

Resultado verificado:
- TypeScript: sin errores
- Next build: éxito
- Vitest: 8 archivos de prueba aprobados, 15 pruebas aprobadas

---

## Conclusión

El proyecto se encuentra en una situación de calidad y seguridad aceptable para la fase actual, con un buen nivel de validación de aplicación, autenticación y UX. El principal riesgo real no es un bug funcional visible sino la ausencia de comprobación directa de las políticas RLS y Storage en la infraestructura de Supabase. Eso debe cerrarse con una auditoría SQL real en la base de producción antes del lanzamiento final.
