/**
 * Caja de contexto que va arriba de cada panel de admin, explicando en
 * lenguaje simple qué hace esa sección. Es un Server Component (sin
 * "use client") porque no tiene interactividad — solo texto estático.
 *
 * Uso:
 * <PanelInfo
 *   title="Categorías"
 *   description="Organiza tus eventos por tipo (Workshop, Sesión, etc.)..."
 * />
 */
export default function PanelInfo({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 rounded-lg border border-gold/20 bg-gold/5 p-4">
      <div className="flex items-start gap-3">
        <span className="text-gold text-lg leading-none mt-0.5" aria-hidden="true">
          ℹ️
        </span>
        <div>
          <p className="text-sm font-semibold text-gold mb-1">{title}</p>
          <p className="text-sm text-white/60 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
