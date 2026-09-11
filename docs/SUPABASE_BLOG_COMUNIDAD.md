# Guía de actualización Supabase: Blog y Comunidad

## Alcance y precondiciones

La migración `supabase/migrations/202609100001_blog_community.sql` es aditiva. Requiere que `public.profiles(id)`, `public.is_admin()` y `public.audit_log` existan, como ocurre después de las migraciones de compatibilidad y seguridad del proyecto. Aplícala primero en staging con una cuenta administradora y una alumna de prueba.

## Procedimiento ordenado

Para automatizar la aplicación y verificación completa, configura una URL administrativa temporal en tu shell (no la agregues a `.env.local`) y ejecuta:

```bash
SUPABASE_DB_URL='postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres' npm run supabase:blog:deploy
```

El script usa Supabase CLI mediante `npx`, aplica las migraciones pendientes y ejecuta la comprobación SQL. No muestra la URL ni secretos. Requiere `psql` (`postgresql-client`) para la verificación.

1. Haz respaldo lógico y registra el hash de la migración: `pg_dump --schema=public --no-owner "$DATABASE_URL" > backup-pre-blog.sql`.
2. Ejecuta la migración mediante Supabase CLI o el SQL Editor. No cortes ni dividas el `BEGIN`/`COMMIT`: el DDL, RLS, triggers y políticas de Storage deben ser atómicos.
3. Comprueba que existen `blog_posts`, `community_posts`, `community_comments`, sus índices y los tres triggers `set_*_updated_at`.
4. La migración crea o actualiza el bucket público `blog` con límite de 5 MB y MIME JPEG/PNG/WebP. Las lecturas son públicas; insertar, actualizar y borrar objetos exige `public.is_admin()`.
5. Si la plataforma no lo ha ejecutado automáticamente, recarga el esquema PostgREST:

```sql
NOTIFY pgrst, 'reload schema';
```

6. Despliega la aplicación después de ejecutar el DDL. Las acciones de administración usan `requireAdmin()` y dejan una entrada en `audit_log`.

## DDL y seguridad implementada

El DDL unificado está versionado en `supabase/migrations/202609100001_blog_community.sql`. Define restricciones de largo, estados permitidos, relaciones con `profiles`, índices de lectura/moderación y el trigger reutilizable `public.set_updated_at()`.

RLS adopta el principio de menor privilegio:

- Cualquier visitante puede leer artículos `published`.
- Una alumna autenticada solo inserta publicaciones y comentarios con su propio `auth.uid()` y estado `pending`.
- El autor puede consultar sus propios mensajes pendientes; el resto solo ve los aprobados.
- Solo un administrador puede editar, moderar u id contenido.
- Un comentario solo puede crearse en una publicación ya aprobada.

## Checklist de integridad referencial

- [ ] `SELECT id FROM public.profiles WHERE role='admin' LIMIT 1;` devuelve al menos una administradora.
- [ ] Toda fila de `profiles.id` relevante tiene usuario equivalente en `auth.users.id`.
- [ ] Intentar insertar una publicación con `user_id` distinto a `auth.uid()` falla bajo rol `authenticated`.
- [ ] Una sesión anónima lee solo `blog_posts.status='published'` y publicaciones comunitarias aprobadas.
- [ ] Una alumna no puede convertir su propio `pending` en `approved`.
- [ ] Un administrador puede cambiar estado y se genera `audit_log` por cada acción de moderación.
- [ ] El borrado de `community_posts` elimina comentarios dependientes por `ON DELETE CASCADE`; el borrado de perfiles hace lo mismo con contenido de la alumna.
- [ ] La carga a `storage.objects` con `bucket_id='blog'` falla para una alumna no administradora y funciona para administración.

## Pruebas SQL mínimas

Ejecuta con roles separados o desde el cliente Supabase correspondiente. No uses `service_role` para validar RLS: lo omite. Para inspección operativa:

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
  AND (tablename IN ('blog_posts', 'community_posts', 'community_comments') OR tablename = 'objects')
ORDER BY tablename, policyname;

SELECT conrelid::regclass AS table_name, conname
FROM pg_constraint
WHERE conrelid IN ('public.blog_posts'::regclass, 'public.community_posts'::regclass, 'public.community_comments'::regclass);
```

## Operación y rollback

No elimines tablas para revertir producción si ya contienen conversaciones. Primero despublica, exporta el contenido y revoca las rutas. Si es necesario retirar el módulo sin datos, elimina políticas antes de las tablas y retira el bucket solo tras eliminar sus objetos mediante Storage API. Mantén auditoría y backups fuera del alcance de una reversión funcional.
