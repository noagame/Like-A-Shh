# Like-A-Shh

## Despliegue en Vercel

1. En Vercel, conecta tu repositorio.
2. Asegúrate de tener en `Settings > Environment Variables`:
   - `VITE_API_URL` apuntando a tu backend (si lo alojas en otra parte)
   - `MONGO_URI` no necesario para frontend
3. Build command: `npm run build`
4. Output directory: `dist`

> Si usas API Node/Express completa, se recomienda desplegar el backend en otro servicio (Railway, Render, Heroku) y configurar `VITE_API_URL` en el frontend.

