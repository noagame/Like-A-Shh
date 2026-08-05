# Plan Maestro de Implementación — likeashh.cl
### Documento único: visión de producto + implementación técnica paso a paso + cumplimiento legal, seguridad, PMBOK 7 y calidad de código

Este documento consolida todo lo trabajado hasta ahora en una sola fuente de verdad. Reemplaza a los dos archivos anteriores (`plan-implementacion-likeashh.md` y `implementacion-paso-a-paso-likeashh.md`).

**Contexto del proyecto**: `likeashh.cl`, actualmente una landing page en Next.js 16 / React 19 / Tailwind 4 (repo `noagame/Like-A-Shh`), sin backend. Se va a evolucionar a una plataforma con registro/login, panel de administrador (dashboard de analítica + gestión de eventos), panel de usuario (calendario de clases + asistencia), usando Supabase como backend, todo servido desde Vercel.

⚠️ Este documento no reemplaza asesoría legal formal. La sección de Ley 21.719 es una implementación técnica razonable, no una validación jurídica.

---

## 1. Resumen ejecutivo

Actualmente `likeashh.cl` es una landing page en Next.js 16 / React 19 desplegada en Vercel. El objetivo es evolucionarla a una plataforma con:

- Registro e inicio de sesión de usuarios.
- Panel de administrador con dashboard de analítica de interacciones y CRUD de sesiones/clases/workshops/eventos.
- Panel de usuario con calendario/tabla de clases, botón "asistir" y datos de perfil (fecha de nacimiento, género).
- Backend gestionado con Supabase (Postgres + Auth + Row Level Security + Storage), consumido desde Server Actions/API Routes de Next.js en Vercel.

✅ El proyecto ya está en Next.js (App Router), por lo que no se requiere migración desde React puro (CRA/Vite) — se puede ir directo a integrar Supabase.

---

## 2. Stack tecnológico propuesto

| Capa | Tecnología | Motivo |
|---|---|---|
| Frontend | Next.js 14+ (App Router) + TypeScript | SSR/SSG, API routes, óptimo en Vercel |
| Estilos | Tailwind CSS + shadcn/ui | Velocidad de desarrollo, componentes accesibles |
| Backend/DB | Supabase (Postgres) | Auth, RLS, Storage, Realtime incluidos |
| Autenticación | Supabase Auth (email/password + magic link opcional) | Integración nativa con RLS |
| Calendario | FullCalendar o react-big-calendar | Vista de calendario para clases |
| Gráficas dashboard | Recharts o Tremor | Visualización de analítica |
| Analítica de interacciones | Tabla propia `events_log` + Vercel Analytics/PostHog (opcional) | Trazabilidad completa + benchmarking |
| Emails transaccionales | Resend o Supabase SMTP | Confirmaciones, recordatorios |
| Hosting | Vercel | Ya en uso |
| CI/CD | Vercel Git Integration + GitHub Actions (lint/test) | Despliegue automático con checks |

---

---

## 3. Vistas y funcionalidades (visión de producto)

### 5.1 Landing page (mejoras)
- Mantener diseño actual, agregar: sección de próximos eventos destacados (leídos desde `events`), CTA claro a "Regístrate" / "Inicia sesión", SEO básico (metadatos, OpenGraph), analítica de interacción (`events_log` con `page_view`).

### 5.2 Registro / Login
- `/registro`, `/login`, `/recuperar-password`.
- Formulario de registro en 2 pasos (credenciales → datos personales).
- Validación con Zod + react-hook-form.

### 5.3 Panel de administrador (`/admin`)
- **Dashboard de analítica**:
  - Usuarios activos/nuevos por período.
  - Vistas de página y CTAs más clicados.
  - Tasa de conversión registro → primera asistencia.
  - Eventos con más/menos inscripciones.
  - Gráficas de línea/barras (Recharts) filtrables por fecha.
- **Gestión de eventos** (CRUD):
  - Crear/editar sesión, clase, workshop o evento: título, descripción, categoría, fecha/hora inicio y fin, ubicación, cupo, instructor.
  - Listado filtrable por categoría/estado/fecha.
  - Ver lista de asistentes por evento y exportar (CSV).

### 5.4 Panel de usuario (`/mi-cuenta`)
- **Calendario** (vista mensual/semanal) y **tabla** con toggle entre ambas vistas.
- Botón **"Asistir"** por clase → inserta en `attendances`, respeta `capacity` (bloquea si está lleno, opción de lista de espera).
- Historial de clases asistidas.
- Edición de perfil (datos personales, foto).

---

---

## 4. Capa de API (visión general)

Con Next.js en Vercel, dos opciones (recomendado combinar):

1. **Cliente directo a Supabase** (para lecturas protegidas por RLS): usar `@supabase/supabase-js` en Server Components o Client Components con la `anon key`. RLS garantiza que cada usuario solo ve lo permitido.
2. **API Routes / Server Actions** (`/app/api/...`) para:
   - Operaciones que requieren `service_role key` (ej. reportes agregados de analítica, exportar CSV, envío de emails).
   - Lógica de negocio compleja (validar cupo antes de inscribir, enviar recordatorio).
   - Nunca exponer `service_role key` en el cliente; solo se usa en el servidor (variables de entorno de Vercel).

---

---

## 5. Mejoras adicionales identificadas (backlog de producto)

1. **Lista de espera (waitlist)**: cuando un evento alcanza su `capacity`, permitir anotarse en espera y notificar automáticamente si se libera un cupo. *(pendiente — no cubierto aún en la Parte 2)*
2. **Recordatorios automáticos**: email/WhatsApp 24h y 1h antes de la clase (cron job con Vercel Cron + Resend).
3. **Check-in con QR**: código QR por evento para marcar asistencia real (no solo "quiero ir") — mejora la calidad de la analítica.
4. **Cancelación de inscripción**: el usuario debe poder cancelar su asistencia, liberando el cupo.
5. **Rol de instructor**: instructores pueden ver/gestionar solo sus propias clases, sin acceso total de admin.
6. **Sistema de pagos/membresías** (Stripe): si algunas clases son de pago o hay membresías mensuales, esto cambia el modelo de datos (habría que agregarlo ahora para no re-arquitecturar después).
7. **Reseñas/calificación de clases**: feedback post-clase para mejorar la oferta.
8. **Notificaciones in-app**: campanita con avisos de nuevos eventos o recordatorios.
9. **Panel de reportes exportables**: CSV/Excel de asistencia y analítica para uso administrativo offline.
10. **Búsqueda y filtros avanzados** en el catálogo de eventos (por categoría, instructor, fecha, nivel).
11. *(Nota: privacidad, RLS, roles, auditoría, retención y derechos ARCO ya quedaron resueltos en la Parte 2 — Fases 1, 2 y 7. Lo que sigue abajo sigue pendiente de evaluar.)*

11. **Accesibilidad (a11y)**: etiquetas ARIA, contraste, navegación por teclado — importante si hay clases físicas/deportivas con audiencia diversa.
12. **Internacionalización (i18n)**: si hay planes de expandirse fuera de la región hispanohablante.
13. **Testing automatizado**: pruebas unitarias (Vitest) y e2e (Playwright) para flujos críticos (registro, inscripción, dashboard).
14. **Monitoreo de errores**: Sentry para capturar errores en producción.
15. **Página de estado del sistema / mantenimiento programado** para transparencia con usuarios.
16. **Onboarding gamificado**: progreso de perfil (ej. "70% completado") para incentivar completar datos.
17. **Segmentación de usuarios en analítica**: cohortes por edad (derivado de fecha de nacimiento) y género para entender mejor a la audiencia, siempre respetando privacidad (datos agregados, no individualizados en reportes).

---

---

## 6. Parte 2 — Implementación paso a paso, fase por fase

## FASE 1 — Setup de Supabase

### 1.1 Crear el proyecto
1. Entra a [supabase.com](https://supabase.com) → **New Project**.
2. Elige nombre `likeashh`, región más cercana a Chile (ej. `sa-east-1` si está disponible, o `us-east-1`).
3. Guarda la contraseña de la base de datos en un lugar seguro (la necesitarás para conexiones directas, no para la app).
4. Cuando el proyecto esté listo, ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public key`
   - `service_role key` (¡nunca la subas al repo ni la uses en cliente!)

### 1.2 Instalar dependencias en el proyecto
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 1.3 Variables de entorno
Crea `.env.local` en la raíz (ya tienes `.gitignore`, confirma que `.env*.local` esté ignorado):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...   # solo se usa en server
```
Luego, en **Vercel → tu proyecto → Settings → Environment Variables**, agrega las mismas tres (Production + Preview).

### 1.4 Helpers de cliente Supabase (patrón SSR de App Router)

Crea `lib/supabase/client.ts` (para Client Components):
```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

Crea `lib/supabase/server.ts` (para Server Components / Server Actions):
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // se llama desde un Server Component; el middleware refresca la sesión
          }
        },
      },
    }
  );
}
```

Crea `middleware.ts` en la raíz (refresca la sesión en cada request y protege rutas):
```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protege /admin y /mi-cuenta
  if (!user && (pathname.startsWith("/admin") || pathname.startsWith("/mi-cuenta"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/mi-cuenta/:path*"],
};
```

### 1.5 Esquema SQL
En Supabase → **SQL Editor**, ejecuta el esquema completo que ya definimos (tabla `profiles`, `categories`, `events`, `attendances`, `events_log`) del documento anterior (`plan-implementacion-likeashh.md`, sección 3). No lo repito aquí para evitar duplicar SQL entre documentos; cópialo tal cual desde ahí.

### 1.6 Trigger para crear perfil automáticamente al registrarse
```sql
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 1.7 Activar RLS
En **Table Editor**, para cada tabla → **Enable RLS**. Luego crea las políticas mínimas (ejemplos, ajusta a tu gusto):
```sql
-- profiles: cada usuario ve/edita solo su fila
create policy "select_own_profile" on profiles
  for select using (auth.uid() = id);
create policy "update_own_profile" on profiles
  for update using (auth.uid() = id);

-- admin ve todo (usando función helper)
create function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

create policy "admin_select_all_profiles" on profiles
  for select using (public.is_admin());

-- events: lectura pública, escritura solo admin/instructor
create policy "events_public_read" on events
  for select using (status = 'published' or public.is_admin());
create policy "events_admin_write" on events
  for all using (public.is_admin());

-- attendances: usuario gestiona las suyas
create policy "attendance_own" on attendances
  for all using (auth.uid() = user_id);
create policy "attendance_admin_read" on attendances
  for select using (public.is_admin());
```

### 1.8 Tablas adicionales para cumplimiento (Ley 21.719)
El esquema original no alcanza para demostrar cumplimiento ante una fiscalización o reclamo. Agrega estas dos tablas:

```sql
-- Registro de consentimiento explícito (evidencia, no solo un checkbox visual)
create table consent_logs (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade,
  consent_type text not null check (consent_type in ('registro','tratamiento_datos_sensibles','marketing')),
  accepted boolean not null,
  policy_version text not null,   -- ej. "privacidad-v2-2026-08"
  ip_address text,
  created_at timestamptz default now()
);
alter table consent_logs enable row level security;
create policy "consent_own_insert" on consent_logs
  for insert with check (auth.uid() = user_id);
create policy "consent_admin_read" on consent_logs
  for select using (public.is_admin());

-- Auditoría de accesos/modificaciones a datos sensibles (perfiles)
create table audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references profiles(id),      -- quién hizo la acción
  target_user_id uuid references profiles(id), -- sobre quién
  action text not null,                        -- 'view_profile','update_profile','export_data','delete_account'
  metadata jsonb,
  created_at timestamptz default now()
);
alter table audit_log enable row level security;
create policy "audit_admin_only" on audit_log
  for select using (public.is_admin());
```

Además, define **retención** desde ya en `events_log` (evita acumular tracking indefinidamente, lo que en sí mismo es una infracción al principio de proporcionalidad de la ley):
```sql
alter table events_log
  add column if not exists expires_at timestamptz default (now() + interval '12 months');
```

### 1.9 Cabeceras de seguridad HTTP
Agrega cabeceras de seguridad en `next.config.ts` (mitiga XSS, clickjacking, sniffing):

```ts
// next.config.ts
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' data: https:",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
```
Ajusta el `connect-src` si agregas otros servicios (Resend, PostHog, etc.). Prueba en `dev` que WhatsAppButton y Framer Motion no queden bloqueados por el CSP antes de subir a producción.

✅ **Checkpoint fase 1**: puedes correr `npm run dev`, importar `createClient()` en cualquier página, hacer `supabase.from('events').select('*')` sin error de conexión, y las respuestas HTTP ya incluyen las cabeceras de seguridad (verifícalo en DevTools → Network → Headers).

---

## FASE 2 — Autenticación (registro/login/recuperación)

### 2.1 Página de registro `app/registro/page.tsx`
Formulario controlado (usa `react-hook-form` + `zod` para validar en el cliente **y** repite la validación en el server, nunca confíes solo en el frontend). **Importante para la Ley 21.719**: el checkbox de aceptación de política de privacidad debe ser obligatorio (no premarcado) y quedar registrado con evidencia, no solo aceptado silenciosamente.

`app/registro/actions.ts`
```ts
"use server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  full_name: z.string().min(2),
  accepted_privacy: z.literal("on", { message: "Debes aceptar la política de privacidad" }),
});

export async function signUp(formData: FormData) {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`/registro?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }
  const { email, password, full_name } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) redirect(`/registro?error=${encodeURIComponent(error.message)}`);

  // Evidencia de consentimiento explícito (Ley 21.719)
  if (data.user) {
    const headersList = await headers();
    await supabase.from("consent_logs").insert({
      user_id: data.user.id,
      consent_type: "registro",
      accepted: true,
      policy_version: "privacidad-v1-2026-08",
      ip_address: headersList.get("x-forwarded-for") ?? "unknown",
    });
  }

  redirect("/registro/completar-perfil");
}
```
En el formulario, agrega un checkbox real (no un texto tipo "al registrarte aceptas..."):
```tsx
<label className="flex items-start gap-2 text-sm">
  <input type="checkbox" name="accepted_privacy" required />
  He leído y acepto la{" "}
  <a href="/privacidad" target="_blank" className="underline">política de privacidad</a>
</label>
```

### 2.2 Ruta de callback de confirmación `app/auth/callback/route.ts`
```ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(`${origin}/registro/completar-perfil`);
}
```

### 2.3 Login `app/login/actions.ts`
```ts
"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/mi-cuenta");
}
```

### 2.4 Completar perfil (paso 2: fecha de nacimiento, género)
`app/registro/completar-perfil/page.tsx` con Server Action que hace:
```ts
await supabase
  .from("profiles")
  .update({ birth_date, gender, phone })
  .eq("id", user.id);
```
Valida que `birth_date` corresponda a mayor de edad si es requisito del negocio (ej. clases con contenido para adultos).

### 2.5 Logout
```ts
"use server";
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
```

### 2.6 Rate limiting en login/registro (ciberseguridad)
Sin esto, `/login` queda expuesto a fuerza bruta y credential stuffing. Opción simple sin infraestructura adicional: usa Supabase (ya limita intentos de auth por IP a nivel de plataforma) **más** un límite propio a nivel de aplicación con Vercel KV o Upstash Redis:

```bash
npm install @upstash/ratelimit @upstash/redis
```
```ts
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const loginRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 intentos por minuto por IP
});
```
Úsalo al inicio de la Server Action de `signIn`, antes de llamar a Supabase:
```ts
const { success } = await loginRateLimit.limit(ip);
if (!success) redirect("/login?error=Demasiados intentos, espera un minuto");
```

### 2.7 Política de contraseñas
En Supabase → **Authentication → Policies**, sube el mínimo de caracteres a 8+ y activa "Leaked password protection" (chequea contra bases de contraseñas filtradas). Para el rol `admin`, evalúa activar **MFA** (Supabase Auth lo soporta nativamente vía `supabase.auth.mfa`), dado que ese panel accede a datos de todos los usuarios.

✅ **Checkpoint fase 2**: puedes registrarte, confirmar email, completar perfil, cerrar sesión e iniciar sesión de nuevo. El middleware ya bloquea `/admin` y `/mi-cuenta` sin sesión. Queda registro de consentimiento en `consent_logs` y el login resiste intentos repetidos.

---

## FASE 3 — CRUD de eventos (panel admin)

### 3.1 Migrar `EventsSection.tsx` de hardcodeado a datos reales
Actualmente el evento "Frosted Desire" está escrito directo en el JSX. Refactorízalo a Server Component que lee de Supabase:

```ts
// app/components/EventsSection.tsx (fragmento del fetch)
import { createClient } from "@/lib/supabase/server";

export default async function EventsSection() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*, categories(name, color)")
    .eq("status", "published")
    .order("start_time", { ascending: true })
    .limit(3);

  // Mapea `events` al mismo diseño visual (card-gold) que ya tienes,
  // usando un .map() en vez del bloque fijo actual.
}
```
Esto te permite seguir usando exactamente el mismo diseño (gold/black, framer-motion) pero con datos dinámicos desde el admin.

### 3.2 Layout protegido de administrador
`app/admin/layout.tsx`:
```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user?.id).single();

  if (profile?.role !== "admin") redirect("/");

  return <div className="admin-shell">{children}</div>;
}
```

### 3.3 Formulario crear/editar evento `app/admin/eventos/nuevo/page.tsx`
Campos: `title`, `description`, `category_id` (select), `start_time`, `end_time`, `location`, `capacity`, `status`.
Server Action de inserción:
```ts
"use server";
export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("events").insert({
    title: formData.get("title"),
    description: formData.get("description"),
    category_id: formData.get("category_id"),
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
    location: formData.get("location"),
    capacity: Number(formData.get("capacity")),
    status: formData.get("status") ?? "draft",
  });

  // Trazabilidad de acciones administrativas (recomendado, no solo para RRHH interno
  // sino porque la Ley 21.719 exige poder acreditar quién trató qué dato y cuándo)
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("audit_log").insert({
    actor_id: user?.id,
    action: "create_event",
    metadata: { title: formData.get("title") },
  });

  revalidatePath("/admin/eventos");
}
```

### 3.4 Listado admin `app/admin/eventos/page.tsx`
Tabla con acciones editar/eliminar/duplicar, filtro por categoría/estado, y botón para ver lista de asistentes por evento (`select * from attendances where event_id = ...`).

**Principio de minimización (Ley 21.719):** la vista de asistentes solo debe mostrar `full_name` y el estado de asistencia, no `birth_date`/`gender` salvo que exista una razón operativa concreta (ej. clases con clasificación por edad). Si el admin necesita ver un perfil completo, registra ese acceso en `audit_log` con `action: 'view_profile'`.

✅ **Checkpoint fase 3**: como admin puedes crear una clase/evento y verlo reflejado en la landing (`EventsSection`) sin tocar código.

---

## FASE 4 — Panel de usuario

### 4.1 Layout `/mi-cuenta`
`app/mi-cuenta/layout.tsx` con navegación: Calendario | Mis clases | Perfil.

### 4.2 Vista calendario + tabla (toggle)
Instala una librería de calendario:
```bash
npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid
```
`app/mi-cuenta/clases/page.tsx` (Client Component) recibe los eventos ya cargados desde un Server Component padre, y alterna entre `<FullCalendar events={events} />` y una tabla simple (`<table>`) con el mismo dataset — usa un `useState<"calendario"|"tabla">`.

### 4.3 Botón "Asistir"
Server Action que valida cupo antes de insertar:
```ts
"use server";
export async function attendEvent(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: event } = await supabase
    .from("events").select("capacity").eq("id", eventId).single();
  const { count } = await supabase
    .from("attendances")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "registered");

  if (event?.capacity && count && count >= event.capacity) {
    return { error: "Cupo lleno" };
  }

  const { error } = await supabase.from("attendances").insert({
    event_id: eventId,
    user_id: user.id,
  });
  return { error: error?.message ?? null };
}
```

### 4.4 Editar perfil
`app/mi-cuenta/perfil/page.tsx`: formulario que actualiza `full_name`, `birth_date`, `gender`, `phone`, `avatar_url` (usa Supabase Storage para el avatar).

**Ley 21.719 — dato sensible opcional:** haz que `gender` sea explícitamente opcional en el formulario (no lo marques `required`), con una opción "Prefiero no decir" ya contemplada en el `check` de la tabla `profiles`. Guardar un dato sensible que el usuario no quería entregar, aunque sea "solo para estadísticas", es exactamente el tipo de tratamiento que la ley busca limitar. Valida también que `birth_date` no permita fechas que impliquen menores de edad si tus clases son solo para adultos (`zod` con `.refine()` comparando contra la fecha actual).

✅ **Checkpoint fase 4**: un usuario logueado ve las clases publicadas, se inscribe, y el cupo se respeta. El campo género es opcional y queda validada la edad mínima si aplica.

---

## FASE 5 — Tracking de interacciones

### 5.1 Helper de tracking
`lib/analytics/track.ts`:
```ts
"use client";
import { createClient } from "@/lib/supabase/client";

export async function trackEvent(action: string, metadata?: Record<string, unknown>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("events_log").insert({
    user_id: user?.id ?? null,
    action,
    metadata,
  });
}
```

### 5.2 Instrumentar los CTAs que ya existen
Ya tienes `id="event-buy-btn"` en `EventsSection.tsx` — agrégale el tracking:
```tsx
<m.a
  id="event-buy-btn"
  onClick={() => trackEvent("click_cta_compra_entrada", { event_id: event.id })}
  ...
>
```
Repite el patrón en `HeroSection`, `ContactSection` (envío de formulario), `WhatsAppButton`.

### 5.3 Page views
En `app/layout.tsx` o un componente cliente global, dispara `trackEvent("page_view", { path: pathname })` usando `usePathname()` de `next/navigation`.

### 5.4 Retención y purga automática (Ley 21.719 — principio de proporcionalidad)
`events_log` no debe crecer indefinidamente ni conservar datos más tiempo del necesario para el fin (analítica). Configura un job periódico:

```sql
-- Función que borra registros vencidos
create function public.purge_expired_logs()
returns void as $$
  delete from events_log where expires_at < now();
$$ language sql security definer;
```
Prográmalo con **pg_cron** (extensión disponible en Supabase, actívala en Database → Extensions) o con un **Vercel Cron Job** que llame a un Route Handler `app/api/cron/purge-logs/route.ts` protegido con un secreto en el header:
```ts
// app/api/cron/purge-logs/route.ts
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const supabase = createAdminClient();
  await supabase.rpc("purge_expired_logs");
  return new Response("OK");
}
```
Y en `vercel.json`:
```json
{ "crons": [{ "path": "/api/cron/purge-logs", "schedule": "0 3 * * *" }] }
```

✅ **Checkpoint fase 5**: cada clic relevante y cada vista de página deja registro en `events_log`, y ese registro tiene fecha de expiración real, no indefinida.

---

## FASE 6 — Dashboard de analítica (admin)

### 6.1 Instalar librería de gráficos
```bash
npm install recharts
```

### 6.2 Queries agregadas
Ejemplo: usuarios nuevos por semana (puedes crear una vista SQL o resolverlo en el server component):
```sql
create view weekly_signups as
select date_trunc('week', created_at) as week, count(*) as total
from profiles
group by 1
order by 1;
```

### 6.3 Página `app/admin/dashboard/page.tsx`
Trae los datos vía `service_role` (en una API route, no en el cliente) para reportes agregados pesados, y renderiza con `<LineChart>` / `<BarChart>` de Recharts: usuarios nuevos, CTAs más clicados (`group by action` en `events_log`), eventos con más inscripciones, tasa de conversión registro → primera asistencia.

✅ **Checkpoint fase 6**: el admin ve gráficas reales, no mockeadas.

---

## FASE 7 — Derechos ARCO y autogestión de datos (Ley 21.719)

La ley exige poder responder solicitudes de **Acceso, Rectificación, Cancelación/Supresión y Oposición**, más **portabilidad**. La forma más segura de cumplir esto sin depender de procesos manuales lentos es dar autogestión al usuario dentro de `/mi-cuenta`.

### 7.1 Exportar mis datos (acceso + portabilidad)
`app/mi-cuenta/privacidad/actions.ts`:
```ts
"use server";
import { createClient } from "@/lib/supabase/server";

export async function exportMyData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: attendances }, { data: consents }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("attendances").select("*, events(title, start_time)").eq("user_id", user.id),
    supabase.from("consent_logs").select("*").eq("user_id", user.id),
  ]);

  await supabase.from("audit_log").insert({
    actor_id: user.id,
    target_user_id: user.id,
    action: "export_data",
  });

  return { profile, attendances, consents }; // el cliente lo descarga como JSON
}
```
En el botón "Descargar mis datos", convierte el resultado a JSON y dispara la descarga con `Blob` + `URL.createObjectURL` (sin necesidad de backend adicional).

### 7.2 Rectificación
Ya cubierta por el formulario de perfil de la Fase 4 (4.4) — el usuario edita sus propios datos directamente.

### 7.3 Eliminar mi cuenta (supresión)
```ts
"use server";
export async function deleteMyAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("audit_log").insert({
    actor_id: user.id, target_user_id: user.id, action: "delete_account",
  });

  // Requiere service_role: borrar el usuario de auth.users borra en cascada
  // profiles, attendances y consent_logs por las FK "on delete cascade".
  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(user.id);
}
```
Decide si prefieres **borrado real** o **anonimización** (mantener el registro de asistencia para estadísticas agregadas, pero reemplazar `full_name`/`email` por valores genéricos). La anonimización es preferible si necesitas conservar métricas históricas del dashboard sin retener datos identificables.

### 7.4 Oposición
Agrega un toggle en `/mi-cuenta/privacidad` para "No quiero recibir comunicaciones de marketing" que actualice un campo `marketing_opt_out boolean` en `profiles`, y respétalo en cualquier envío de email futuro.

### 7.5 Proceso para solicitudes fuera de la app
No todo se resuelve con self-service (ej. alguien que pide sus datos sin tener cuenta activa). Documenta un procedimiento simple: un correo dedicado (ej. `privacidad@likeashh.cl`), un plazo de respuesta interno de máximo 30 días, y quién internamente es responsable de ejecutar la solicitud en Supabase directamente.

✅ **Checkpoint fase 7**: un usuario puede descargar sus datos, editarlos, eliminarlos, y oponerse a comunicaciones — sin depender de que tú lo hagas manualmente por él.

---

## FASE 8 — QA, seguridad y pulido

Checklist antes de pasar a producción, organizado por ámbito:

**Seguridad técnica**
- [ ] RLS activo y probado en **las 7 tablas** (`profiles`, `categories`, `events`, `attendances`, `events_log`, `consent_logs`, `audit_log`) — intenta acceder a datos ajenos con un usuario normal y confirma que falla.
- [ ] `service_role key` solo aparece en variables de entorno del servidor, nunca en un componente `"use client"`.
- [ ] Formularios validan en cliente Y servidor con Zod (nunca confíes solo en el frontend).
- [ ] Rate limiting probado en `/login` (intenta 6 logins fallidos seguidos y confirma el bloqueo).
- [ ] Cabeceras de seguridad (CSP, X-Frame-Options) presentes en producción, no solo en `dev`.
- [ ] `npm audit` sin vulnerabilidades críticas/altas sin resolver; considera activar Dependabot en GitHub.
- [ ] MFA activo para la cuenta admin.
- [ ] Prueba con 3 roles distintos: usuario normal, instructor (si lo implementas), admin.
- [ ] Revisa que `/admin` y `/mi-cuenta` redirijan correctamente sin sesión (middleware).

**Cumplimiento Ley 21.719**
- [ ] Checkbox de consentimiento obligatorio y no premarcado, con registro en `consent_logs`.
- [ ] Campo `gender` opcional, nunca `required`.
- [ ] Política de privacidad y términos actualizados mencionando explícitamente qué datos se recolectan, para qué, y por cuánto tiempo.
- [ ] Flujo de exportar/eliminar cuenta probado de punta a punta.
- [ ] Job de purga de `events_log` corriendo (revisa logs del cron).
- [ ] Definido el correo/proceso para solicitudes ARCO externas.

**Calidad general**
- [ ] Responsive: probar el calendario y el dashboard en móvil.
- [ ] Lighthouse / Core Web Vitals no debe degradarse por las nuevas queries (usa `Suspense` + streaming si una sección tarda).

---

## FASE 9 — Despliegue final

1. Confirma las variables de entorno en **Vercel → Settings → Environment Variables** (Production y Preview): las 3 de Supabase + `CRON_SECRET` + credenciales de Upstash si implementaste rate limiting.
2. En Supabase → **Authentication → URL Configuration**, agrega `https://likeashh.cl` (o tu dominio real) como Site URL y Redirect URL (`/auth/callback`).
3. Haz push a una rama y revisa el **Preview Deployment** de Vercel antes de mergear a `main`.
4. Una vez en producción, verifica en Supabase → **Table Editor** que los datos de prueba no queden en la BD (limpia registros de testing).
5. Activa backups automáticos en Supabase (plan Pro) si el proyecto pasa a producción real con usuarios reales, y confirma que estén cifrados en reposo (Supabase lo hace por defecto en Postgres administrado).
6. **Procedimiento de notificación de brechas** (Ley 21.719, obligatorio): deja documentado — aunque sea en un doc interno simple — quién detecta, quién decide si es reportable, y el canal para notificar a la Agencia de Protección de Datos y a los titulares afectados si llegara a ocurrir un incidente. No necesitas montarlo todo el día 1, pero sí tener claro el "qué hacemos si pasa".

---

## Notas específicas de tu repo

- Como usas **Next.js 16 / React 19**, confirma que `@supabase/ssr` tenga soporte estable para esa versión al momento de instalar; si hay incompatibilidad, revisa el changelog del paquete antes de forzar la instalación.
- Ya tienes `app/privacidad` y `app/terminos` — actualiza esos textos para mencionar explícitamente que se recolectan fecha de nacimiento y género, el propósito de cada uno (gestión de clases, analítica agregada), el plazo de retención, y cómo ejercer derechos ARCO.
- El dominio real que veo en tu `layout.tsx` es `likeashh.cl`, no `likeashh.com` — ajusta esto en cualquier configuración (Supabase redirect URLs, `NEXT_PUBLIC_SITE_URL`).
- Puedes mantener el mismo sistema visual (`card-gold`, `text-gold`, Framer Motion) en todas las vistas nuevas — no hace falta rediseñar, solo alimentar los componentes existentes con datos reales.

---

## Anexo A — Mapeo a PMBOK 7 (dominios de desempeño)

El plan de 9 fases es secuencial por naturaleza técnica, pero para gestionarlo con el enfoque de PMBOK 7 (basado en principios y dominios de desempeño, no en procesos rígidos) conviene sostenerlo con estos artefactos livianos en paralelo:

| Dominio de desempeño (PMBOK 7) | Cómo se aplica aquí |
|---|---|
| Interesados (Stakeholders) | Registro simple: tú (dueño de producto), instructores, usuarias/os finales, y — por la Ley 21.719 — los titulares de datos como interesados regulatorios. |
| Equipo | Aunque seas equipo de 1, define roles explícitos: quién es el responsable técnico y quién sería el contacto de privacidad (DPO informal). |
| Enfoque de desarrollo y ciclo de vida | Este plan es predictivo por fases; puedes ejecutarlo con cadencia iterativa (una fase = un sprint de 3-5 días) sin perder el enfoque. |
| Planificación | Las 9 fases + checklists son tu plan; ajústalo si una fase toma más tiempo del estimado, no lo fuerces. |
| Trabajo del proyecto | Los checkpoints ✅ de cada fase son tus hitos de control. |
| Entrega | Cada fase entrega algo funcional y verificable (no solo código sin probar). |
| Medición | Define 2-3 métricas simples de éxito: % de checklist de seguridad cumplido, tiempo de respuesta a solicitud ARCO, uptime del sitio. |
| Incertidumbre y riesgo | Registro de riesgos mínimo: ejemplo — "riesgo: incompatibilidad de `@supabase/ssr` con Next 16 → mitigación: fijar versión en `package.json` y probar en preview antes de main". |

No hace falta implementar PMBOK como burocracia — con un documento de una página (interesados + riesgos + métricas) ya tienes una gestión trazable si algún día necesitas mostrar que el proyecto se manejó con criterio profesional.

## Anexo B — Estándar de calidad de código

Antes de escalar el proyecto más allá de este plan, cierra estos huecos típicos que hoy no tiene el repo:

### B.1 Testing
```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react
npm install -D @playwright/test
```
- Vitest para lógica pura (validaciones Zod, cálculo de cupo).
- Playwright para e2e de los flujos críticos: registro con consentimiento, login, inscripción a clase, exportar/eliminar datos.

### B.2 CI en GitHub Actions
`.github/workflows/ci.yml`:
```yaml
name: CI
on: [pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npx vitest run
      - run: npm audit --audit-level=high
```
Esto evita que un PR con errores de lint, build roto, o una dependencia vulnerable llegue a `main`.

### B.3 Pre-commit hooks
```bash
npm install -D husky lint-staged
npx husky init
```
En `package.json`:
```json
"lint-staged": { "*.{ts,tsx}": ["eslint --fix"] }
```

### B.4 Monitoreo de errores en producción
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```
Sin esto, un error en `/mi-cuenta` o en el flujo de eliminar cuenta puede pasar inadvertido hasta que un usuario se queje.

### B.5 Documentación mínima
- `README.md` actualizado con instrucciones de setup (no solo el boilerplate de `create-next-app`).
- Un `docs/decisiones-tecnicas.md` tipo ADR (Architecture Decision Record) breve por cada decisión importante — por ejemplo, "por qué Supabase y no Firebase", "por qué anonimizar en vez de borrar attendances". Esto también sirve como evidencia de diligencia debida ante cualquier auditoría legal o de seguridad futura.

✅ **Checkpoint anexo B**: `npm run build`, `npx vitest run` y `npm run lint` pasan en verde antes de cada merge a `main`, y hay al menos un test e2e cubriendo el flujo de consentimiento + eliminación de cuenta.
