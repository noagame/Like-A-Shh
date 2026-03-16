/**
 * Hero Section — Full-screen dark hero with discipline showcase.
 *
 * Title: 'Like A Shh "Libera Tu Cuerpo"'
 * Features a dynamic discipline list and dual CTA buttons.
 */
const Hero = () => {
  const scrollToCourse = () => {
    const el = document.getElementById('course-details')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const disciplines = [
    { name: 'Pole Exotic', icon: '🔥' },
    { name: 'Pole Sport', icon: '💪' },
    { name: 'Floorwork', icon: '🌀' },
    { name: 'Flexibilidad', icon: '🧘' },
    { name: 'Fortalecimiento Muscular', icon: '⚡' },
  ]

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* ── Background layers ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-brand-carbon to-brand-black" />

      {/* Subtle radial glow */}
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.15)_0%,_transparent_70%)]" />

      {/* Diagonal decorative accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-5">
        <div className="absolute inset-0 bg-gradient-to-bl from-brand-gold/20 to-transparent" />
      </div>

      {/* Floating particles */}
      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-brand-gold/40 rounded-full animate-pulse" />
      <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-brand-gold/30 rounded-full animate-pulse delay-700" />
      <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-brand-gold/20 rounded-full animate-pulse delay-1000" />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Tag */}
        <div className="animate-fade-in-down mb-6">
          <span className="inline-block px-4 py-1.5 rounded-full border border-brand-gold/30 text-brand-gold text-xs font-heading font-semibold tracking-[0.2em] uppercase">
            Academia de Pole Dance
          </span>
        </div>

        {/* Título principal */}
        <h1 className="animate-fade-in font-heading font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-3">
          Like A Shh
        </h1>
        <p className="animate-fade-in font-heading font-bold text-xl sm:text-2xl md:text-3xl text-gradient-gold mb-10 tracking-wide">
          "Libera Tu Cuerpo"
        </p>

        {/* ── Disciplines list ── */}
        <div className="animate-fade-in-up mb-12">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-2xl mx-auto">
            {disciplines.map((d, i) => (
              <div
                key={d.name}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-dark/60 border border-brand-gray/30 hover:border-brand-gold/40 hover:bg-brand-gold/5 transition-all duration-300 hover:-translate-y-0.5"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="text-lg">{d.icon}</span>
                <span className="text-sm font-medium text-brand-muted group-hover:text-white transition-colors duration-300">
                  {d.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Dual CTA Buttons ── */}
        <div className="animate-fade-in-up flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Botón Primario — Comprar Ahora (Hotmart) */}
          <a
            href="https://hotmart.com/es/marketplace"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-2 btn-shimmer px-8 py-3.5 rounded-full text-brand-black font-heading font-bold text-sm sm:text-base tracking-wide animate-pulse-glow hover:scale-105 transition-transform duration-300"
          >
            Comprar Ahora
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>

          {/* Botón Secundario — Ver descripción del curso */}
          <button
            onClick={scrollToCourse}
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-brand-gold/40 text-brand-gold font-heading font-semibold text-sm sm:text-base tracking-wide hover:bg-brand-gold/10 hover:border-brand-gold transition-all duration-300"
          >
            Ver nuestros cursos
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>

        {/* ── Scroll indicator ── */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-brand-gold/30 flex items-start justify-center pt-2">
            <div className="w-1 h-2.5 bg-brand-gold/60 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
