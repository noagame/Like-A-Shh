import { useEffect, useRef } from 'react'

// ── Import real gallery images from assets ──
import gallery1 from '../assets/Galeria_Like_a_Shh_1.jpeg'
import gallery2 from '../assets/Galeria_Like_a_Shh_2.jpeg'
import gallery3 from '../assets/Galeria_Like_a_Shh_3.jpeg'
import gallery4 from '../assets/Galeria_Like_a_Shh_4.jpeg'
import gallery5 from '../assets/Galeria_Like_a_Shh_5.jpeg'
import gallery6 from '../assets/Galeria_Like_a_Shh_6.jpeg'

/**
 * Gallery Section — Social proof with testimonials and masonry-style image grid.
 * Uses real images from src/assets.
 */

const testimonials = [
  {
    name: 'Valentina R.',
    text: 'El método de Maxi es increíble. En 3 meses logré figuras que pensé imposibles. Su paciencia y dedicación hacen la diferencia.',
    rating: 5,
  },
  {
    name: 'Camila S.',
    text: 'Nunca había hecho Pole Dance y tenía miedo. Maximiliano crea un ambiente seguro donde aprendes a confiar en tu cuerpo.',
    rating: 5,
  },
  {
    name: 'Luciana M.',
    text: 'La calidad del curso online es impresionante. Los ángulos de cámara, las explicaciones... se siente como una clase privada.',
    rating: 5,
  },
]

const galleryImages = [
  { src: gallery1, h: 'h-64', label: 'Figura de inversión' },
  { src: gallery2, h: 'h-80', label: 'Spin artístico' },
  { src: gallery3, h: 'h-72', label: 'Transición fluida' },
  { src: gallery4, h: 'h-56', label: 'Pose de fuerza' },
  { src: gallery5, h: 'h-80', label: 'Expresión corporal' },
  { src: gallery6, h: 'h-64', label: 'Combo avanzado' },
]

const StarRating = ({ rating }) => (
  <div className="flex gap-1">
    {Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-brand-gold' : 'text-brand-gray'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
)

const Gallery = () => {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.1 }
    )
    const elements = sectionRef.current?.querySelectorAll('.reveal')
    elements?.forEach((el) => observer.observe(el))
    return () => elements?.forEach((el) => observer.unobserve(el))
  }, [])

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="relative py-24 sm:py-32 bg-brand-carbon overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section heading */}
        <div className="reveal text-center mb-16">
          <span className="text-brand-gold text-xs font-heading font-semibold tracking-[0.2em] uppercase">
            Comunidad
          </span>
          <h2 className="mt-3 font-heading font-black text-3xl sm:text-4xl md:text-5xl text-white">
            Lo que dicen <span className="text-gradient-gold">nuestros alumnos</span>
          </h2>
        </div>

        {/* ── Testimonials ── */}
        <div className="reveal grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-brand-dark/60 border border-brand-gray/30 hover:border-brand-gold/30 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Quote icon */}
              <svg className="w-8 h-8 text-brand-gold/30 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
              </svg>

              <p className="text-brand-muted text-sm leading-relaxed mb-4 italic">
                "{t.text}"
              </p>

              <div className="flex items-center justify-between">
                <span className="text-white font-heading font-semibold text-sm">{t.name}</span>
                <StarRating rating={t.rating} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Masonry Gallery (real images) ── */}
        <div className="reveal">
          <h3 className="text-center font-heading font-bold text-xl text-white mb-8">
            Galería <span className="text-gradient-gold">@_likeashh_</span>
          </h3>
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {galleryImages.map((img, i) => (
              <div
                key={i}
                className={`${img.h} rounded-xl bg-brand-dark border border-brand-gray/20 overflow-hidden group relative break-inside-avoid`}
              >
                {/* Real image */}
                <img
                  src={img.src}
                  alt={img.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white text-xs font-medium">{img.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Gallery
