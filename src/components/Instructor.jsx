import { useState, useEffect, useRef } from 'react'
import instructorImg from '../assets/Foto_instructor.png'

/**
 * Instructor Section — Dynamic content from /api/settings.
 * Bio, stats, and quote are all consumed from the database.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Instructor = () => {
  const [instructor, setInstructor] = useState(null)
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef(null)

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings`)
        const data = await res.json()
        if (data.success) setInstructor(data.data.instructor)
      } catch (error) {
        console.error('Error fetching instructor:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  // Reveal animation
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
  }, [loading])

  // Split name into first and last for gradient styling
  const nameParts = instructor?.name?.split(' ') || ['', '']
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ')

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
            {instructor?.subtitle || 'Instructor'}
          </span>
          <h2 className="mt-3 font-heading font-black text-3xl sm:text-4xl md:text-5xl text-white">
            {firstName} <span className="text-gradient-gold">{lastName}</span>
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
                  alt={instructor?.name || 'Instructor de Pole Dance'}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>

          {/* ── Bio column ── */}
          <div className="reveal space-y-6">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-brand-gray/20 rounded w-full" />
                <div className="h-4 bg-brand-gray/20 rounded w-5/6" />
                <div className="h-4 bg-brand-gray/20 rounded w-full" />
                <div className="h-4 bg-brand-gray/20 rounded w-4/6" />
              </div>
            ) : (
              <>
                <p className="text-brand-muted leading-relaxed text-base sm:text-lg">
                  {instructor?.bio || ''}
                </p>
                <p className="text-brand-muted leading-relaxed text-base sm:text-lg">
                  {instructor?.bio2 || ''}
                </p>

                {/* Stats */}
                {instructor?.stats?.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 pt-6">
                    {instructor.stats.map((stat, i) => (
                      <div
                        key={i}
                        className="text-center p-4 rounded-xl bg-brand-dark/60 border border-brand-gray/40"
                      >
                        <span className="block text-2xl sm:text-3xl font-heading font-bold text-gradient-gold">
                          {stat.value}
                        </span>
                        <span className="block text-xs text-brand-muted mt-1">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quote */}
                {instructor?.quote && (
                  <blockquote className="border-l-2 border-brand-gold/50 pl-4 italic text-brand-muted/80 text-sm">
                    "{instructor.quote}"
                  </blockquote>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Instructor
