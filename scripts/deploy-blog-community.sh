#!/usr/bin/env bash
set -euo pipefail

# Requires a PostgreSQL connection string with permission to run migrations.
# Example: SUPABASE_DB_URL='postgresql://postgres:...' npm run supabase:blog:deploy
if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "SUPABASE_DB_URL no está configurada. Usa una URL de conexión administrativa de Supabase." >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "Falta psql. Instala postgresql-client para ejecutar la verificación post-migración." >&2
  exit 1
fi

echo "Aplicando migraciones pendientes de Supabase…"
npx --yes supabase@latest db push --db-url "$SUPABASE_DB_URL"

echo "Verificando tablas, RLS, triggers y bucket…"
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f scripts/verify-blog-community.sql

echo "Despliegue y verificación finalizados correctamente."
