# Auditoría y refactorización UI/UX

## Sistema transversal

Conservar una superficie oscura no basta para producir jerarquía. Usar `bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl` como base y reservar los colores de marca para significado: dorado para acción primaria/selección, celeste para ayuda y estado informativo, magenta para comunidad o énfasis editorial, y borgoña para riesgo no destructivo. Para acciones irreversibles, usar rojo semántico separado del color de marca.

Todos los botones interactivos nuevos deben usar `whileTap={{ scale: 0.98 }}` y mantener un foco visible, por ejemplo `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#48CAE4]`. El contenido no debe depender solo del color: añadir texto, icono y `aria-label` cuando corresponda.

## Landing (`/`)

### Diagnóstico y propuesta

El Hero debe expresar una promesa, un CTA principal y un CTA secundario por encima del pliegue; los enlaces de navegación compiten menos si el CTA primario usa `bg-[#D4AF37] text-black hover:bg-[#f4d57a]`. Limitar el texto a `max-w-xl text-pretty`, mantener título `text-4xl sm:text-5xl lg:text-7xl` y evitar altura fija que recorte móviles pequeños. Para imágenes, usar gradiente de legibilidad: `before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/80 before:to-transparent`.

En carruseles, cada tarjeta necesita fecha, modalidad y CTA consistente. Reemplazar targets táctiles pequeños por `min-h-11 px-4`, usar `snap-x snap-mandatory overflow-x-auto` como fallback móvil y anunciar estado con `aria-live="polite"`. Mostrar un badge de categoría con texto y borde de alto contraste, no solo un fondo translúcido.

## Panel de alumna (`/mi-cuenta`)

### Estados de reserva

Normalizar los estados visibles con un componente de badge:

```tsx
const stateClass = {
  registered: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  full: "border-red-400/30 bg-red-400/10 text-red-200",
  completed: "border-white/15 bg-white/5 text-white/60",
} as const;
```

El copy debe decir “Inscrita”, “Cupo lleno” y “Finalizada”; nunca dejar que la alumna infiera el estado desde un botón deshabilitado. Incluir `aria-live="polite"` para confirmaciones de reserva/cancelación y explicar la política de cancelación antes de la acción.

### Móvil y accesibilidad

Usar `grid-cols-1 sm:grid-cols-2` y evitar anchuras mínimas superiores a 343 px. El navbar debe conservar Comunidad, Mis Clases y Perfil dentro del menú móvil, con objetivos táctiles de al menos 44 px. Las tablas deben contar con alternativa de tarjetas en móvil; `overflow-x-auto` es una contingencia, no la interfaz principal.

El panel ARCO debe separar rectificación, ocultación y eliminación: título, consecuencia, reversibilidad y confirmación. Para eliminación, `border-red-500/30 bg-red-500/5`; para ocultación, `border-[#D4AF37]/30 bg-[#D4AF37]/10`. Incluir enlaces a política de privacidad y canal de contacto, lenguaje directo y fechas de vigencia.

## Administración (`/admin`)

La navegación lateral debe agrupar “Contenido” (Blog, Galería, Cursos) y “Comunidad” (Moderación), en vez de añadir enlaces visualmente equivalentes sin orden. El nuevo enlace de Moderación permite resolver `pending`, `flagged`, `hidden`, `rejected` y `approved` con filtros visibles y acciones de un clic.

Los modales de creación deben seguir este contenedor: `fixed inset-0 overflow-y-auto p-3 sm:p-6`, panel `w-full max-w-xl max-h-[90dvh] overflow-y-auto`, pie con acciones `sticky bottom-0 border-t border-white/10 bg-[#0d0d10]/95`. Durante una acción Server Action usar `useTransition`, `disabled={isPending}`, label “Guardando…” y mensaje `role="status"`; un error usa `role="alert"`. Esto evita dobles envíos, desbordes por teclado móvil y cambios de contexto.
