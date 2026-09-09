# Despliegue de las correcciones de QA

La migración `migrations/202609090001_security.sql` está probada con PostgreSQL 16 y el esquema desechable de `tests/database/fixture.sql`. **No se ha aplicado al Supabase remoto.** El fixture representa las tablas utilizadas por la aplicación, no es un export del esquema real.

## Orden de despliegue

1. Obtener un respaldo y un entorno de staging con el esquema real. Comparar columnas, claves foráneas, triggers y políticas existentes con la migración. No ejecutar el fixture en Supabase.
2. Aplicar la migración en staging con un rol propietario autorizado. Requiere tablas de la aplicación, `auth.users`, `auth.uid()`, `auth.jwt()` y `storage.objects.owner_id`. Si falta una tabla/columna o hay inscripciones duplicadas, la transacción aborta; resolver datos y esquema, no omitir la protección.
3. Comprobar registro con confirmación de correo. El trigger `zz_capture_signup_consent` captura consentimiento en la transacción de creación de Auth. Verificar orden y compatibilidad con cualquier trigger existente de creación de perfil.
4. Configurar `NEXT_PUBLIC_SITE_URL` con el origen HTTPS real, las claves públicas de Supabase, Upstash y Formspree. Autorizar en Supabase la URL de callback de recuperación `${NEXT_PUBLIC_SITE_URL}/auth/callback?next=/auth/actualizar-password`. Usar allowlist específica por entorno. Verificar plantilla de email PKCE de extremo a extremo.
5. Configurar `TRUSTED_CLIENT_IP_HEADER` solo si el proxy sobrescribe esa cabecera con una única IP validada. No usar una cabecera que el visitante pueda controlar. Sin ella se aplica límite conservador compartido más límite por cuenta; un despliegue concurrido debe configurar correctamente su ingress.
6. Desplegar el código junto con la migración. Las funciones de reserva, lista de invitados, ocultación de perfil y eliminación llaman RPCs nuevas: sin la migración devolverán error de manera segura.
7. Ejecutar los casos con anónimo, usuario A, usuario B y administrador: permisos vía aplicación y API directa, reserva concurrente, recuperación de correo, contacto, upload/delete, consentimiento y eliminación de cuenta desechable.

## Decisiones y límites

- Las políticas restrictivas se combinan con las existentes para impedir que un permiso legado amplio permita escrituras administrativas. Se permiten lecturas autenticadas de contenido y se limita la lectura de datos personales al propietario/admin. Revisar cualquier vista y bucket adicional no cubierto.
- Borrar cuenta elimina registros asociados conocidos y Auth en una transacción. Una FK desconocida revierte todo. Si la cuenta posee objetos de Storage, la operación se bloquea sin borrar datos: transferirlos o eliminarlos mediante la API de Storage antes de reintentar. Nunca borrar metadata de Storage directamente por SQL.
- La eliminación propia requiere autenticación reciente por contraseña. Cuentas exclusivamente OAuth necesitan un flujo de reautenticación específico antes de habilitar esa modalidad; el producto actual usa email/contraseña.
- La opción del perfil es **ocultación de datos opcionales**, no anonimización. Conserva correo, fecha de nacimiento, identidad y registros asociados necesarios para el acceso y validación de edad.
- Las RPCs usan `SECURITY DEFINER` con `search_path` fijo y revisan identidad/rol dentro de la función. No conceder ejecución a `anon` o `PUBLIC` en operaciones mutantes.
- No revertir únicamente la migración manteniendo este código: ambos forman una unidad de despliegue. Ante incidencia, revertir aplicación a su versión compatible y restaurar el esquema mediante un plan revisado con el respaldo. No se incluye rollback destructivo automático.

## Repetir QA local

```bash
npm ci
npm run qa
npm audit
```

La CI define PostgreSQL 16 temporal en puerto 55439. Para repetir SQL, usar una base nueva exclusivamente de pruebas:

```bash
export QA_DATABASE_URL='postgresql://USUARIO:CLAVE@127.0.0.1:55439/BASE_DE_PRUEBAS'
psql "$QA_DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f tests/database/fixture.sql \
  -f supabase/migrations/202609090001_security.sql
python3 tests/database/run.py
```

No usar datos reales: el runner crea y elimina cuentas ficticias. El script exige localhost y puerto 55439 como barrera adicional. La CI está configurada en `.github/workflows/qa.yml`; aún no se ha ejecutado en GitHub durante esta tarea.
