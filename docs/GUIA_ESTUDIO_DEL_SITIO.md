# Guía de estudio: Like a Shh

## 1. Cómo está organizado

- `app/`: rutas, páginas y componentes de Next.js.
- `app/components/`: secciones reutilizables de la landing.
- `app/admin/`: herramientas del administrador.
- `app/mi-cuenta/`: experiencia de la alumna autenticada.
- `lib/`: reglas y servicios compartidos.
- `supabase/migrations/`: estructura y seguridad de la base de datos.
- `tests/` y `e2e/`: pruebas automáticas.

## 2. Flujo de una inscripción

1. La alumna abre `Mi cuenta > Explorar`.
2. `AttendButton` llama a `attendEvent`.
3. La acción de servidor ejecuta `reserve_event` en Supabase.
4. La base de datos valida que el evento esté publicado, sea futuro y tenga cupos.
5. Si la reserva es nueva, el servidor envía una alerta al administrador/profesor por Telegram.

## 3. Landing y base de datos

`CoursesSection` consulta `courses` publicados para cursos y ofertas permanentes. También consulta `events` publicados y futuros para sesiones puntuales. Actualmente, las palabras “Online” y “Presencial” del título dirigen cada curso al carrusel adecuado.

## 4. Comandos cotidianos

```bash
npm run dev
npm run typecheck
npm run lint -- --max-warnings 0
npm run test:run
npm run build
```

Ejecuta los cuatro últimos antes de publicar un cambio. Si uno falla, corrige el error antes de continuar.

## 5. Configurar Telegram

1. Crea un bot mediante `@BotFather` en Telegram y guarda el token en secreto.
2. Envía un mensaje al bot desde el chat que recibirá alertas.
3. Obtén el chat ID y configura `TELEGRAM_ADMIN_CHAT_ID`.
4. Opcionalmente configura `TELEGRAM_PROFESSOR_CHAT_ID` para avisar a otra persona.
5. Carga esas variables en el entorno de despliegue y realiza una inscripción de prueba.

Nunca subas `.env.local` ni pegues el token en el código o en un chat público.
