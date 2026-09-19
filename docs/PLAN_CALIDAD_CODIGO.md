# Plan de limpieza y calidad de código

## Prioridad alta

1. Definir tipos generados de Supabase y eliminar `any` de `lib/application` e `lib/infrastructure`.
2. Añadir pruebas unitarias para clasificación de cursos y notificaciones de inscripción.
3. Validar las variables de entorno al arrancar con un esquema Zod, sin revelar secretos en errores.

## Prioridad media

1. Extraer componentes repetidos de tarjetas, botones y diálogos del panel admin.
2. Reemplazar los SVG extensos del footer por un componente de iconos consistente.
3. Centralizar textos de la interfaz y URLs externas en módulos de configuración.
4. Añadir estados de carga, vacío y error homogéneos para consultas Supabase.

## Prioridad continua

1. Ejecutar `typecheck`, lint y pruebas antes de cada merge.
2. Revisar accesibilidad: teclado, foco, contraste, nombres accesibles y movimiento reducido.
3. Medir el peso de imágenes y Core Web Vitals antes de publicar cambios visuales.
4. Mantener migraciones pequeñas, reversibles y revisadas antes de aplicarlas a producción.
