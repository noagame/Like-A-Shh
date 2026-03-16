import { useEffect, useRef } from 'react'
import instructorImg from '../assets/Foto_instructor.png'

/**
 * Instructor Section — Two-column layout showcasing Maximiliano Velásquez.
 * Left: Professional photo.  Right: Bio & credentials.
 */
const Instructor = () => {
  const sectionRef = useRef(null)

  // Simple IntersectionObserver reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.15 }
    )
    const elements = sectionRef.current?.querySelectorAll('.reveal')
    elements?.forEach((el) => observer.observe(el))
    return () => elements?.forEach((el) => observer.unobserve(el))
  }, [])

  const stats = [
    { value: '10+', label: 'Años de experiencia' },
    { value: '500+', label: 'Alumnos formados' },
    { value: '15+', label: 'Competencias' },
  ]

  return (
    <section
      id="instructor"
      ref={sectionRef}
      className="relative py-24 sm:py-32 bg-brand-carbon overflow-hidden"
    >
      {/* Subtle gold accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-[2px] bg-gradient-to-r from-transparent via-brand-gold to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section label */}
        <div className="reveal text-center mb-16">
          <span className="text-brand-gold text-xs font-heading font-semibold tracking-[0.2em] uppercase">
            Conoce a tu instructor
          </span>
          <h2 className="mt-3 font-heading font-black text-3xl sm:text-4xl md:text-5xl text-white">
            Maximiliano <span className="text-gradient-gold">Velásquez</span>
          </h2>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Photo column ── */}
          <div className="reveal flex justify-center">
            <div className="relative group">
              {/* Decorative gold border frame */}
              <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-brand-gold/20 via-transparent to-brand-gold/10 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Photo */}
              <div className="relative w-72 h-96 sm:w-80 sm:h-[28rem] rounded-2xl bg-brand-dark overflow-hidden">
                <img
                  src={instructorImg}
                  alt="Maximiliano Velásquez — Instructor de Pole Dance"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>

          {/* ── Bio column ── */}
          <div className="reveal space-y-6">
            <p className="text-brand-muted leading-relaxed text-base sm:text-lg">
              Maximiliano Velásquez es más que un instructor de Pole Dance: es un artista
              del movimiento que ha dedicado más de una década a perfeccionar la fusión entre
              la fuerza atlética y la expresión artística.
            </p>
            <p className="text-brand-muted leading-relaxed text-base sm:text-lg">
              Su método, desarrollado a través de años de competencia a nivel nacional e
              internacional, combina técnica progresiva, entrenamiento funcional y un enfoque
              profundo en la conexión mente-cuerpo. Cada clase está diseñada para que descubras
              tu máximo potencial, sin importar tu nivel de experiencia.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-4 rounded-xl bg-brand-dark/60 border border-brand-gray/40"
                >
                  <span className="block text-2xl sm:text-3xl font-heading font-bold text-gradient-gold">
                    {stat.value}
                  </span>
                  <span className="block text-xs text-brand-muted mt-1">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Quote */}
            <blockquote className="border-l-2 border-brand-gold/50 pl-4 italic text-brand-muted/80 text-sm">
              "El Pole Dance no es solo fuerza ni solo danza; es el arte de confiar en tu cuerpo
              y desafiar la gravedad."
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Instructor
