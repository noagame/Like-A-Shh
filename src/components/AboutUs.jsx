import { useState, useEffect, useRef } from 'react'

/**
 * AboutUs — "¿Quiénes somos?" section.
 * Content fetched dynamically from /api/settings (aboutUs field).
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const AboutUs = () => {
  const [aboutUs, setAboutUs] = useState(null)
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings`)
        const data = await res.json()
        if (data.success) setAboutUs(data.data.aboutUs)
      } catch (error) {
        console.error('Error fetching aboutUs:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

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

  return (
    <section
      id="about-us"
      ref={sectionRef}
      className="relative py-24 sm:py-32 bg-brand-black overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_bottom,_rgba(212,175,55,0.1)_0%,_transparent_70%)]" />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8">
        <div className="reveal text-center">
          <span className="text-brand-gold text-xs font-heading font-semibold tracking-[0.2em] uppercase">
            Nuestra marca
          </span>
          <h2 className="mt-3 font-heading font-black text-3xl sm:text-4xl md:text-5xl text-white">
            {loading ? (
              <span className="inline-block h-10 w-64 bg-brand-gray/20 rounded animate-pulse" />
            ) : (
              <>¿Quiénes <span className="text-gradient-gold">Somos</span>?</>
            )}
          </h2>
        </div>

        <div className="reveal mt-10">
          {loading ? (
            <div className="space-y-4 animate-pulse max-w-2xl mx-auto">
              <div className="h-4 bg-brand-gray/20 rounded w-full" />
              <div className="h-4 bg-brand-gray/20 rounded w-5/6" />
              <div className="h-4 bg-brand-gray/20 rounded w-full" />
              <div className="h-4 bg-brand-gray/20 rounded w-4/6" />
            </div>
          ) : aboutUs ? (
            <div className="relative p-8 sm:p-12 rounded-2xl bg-brand-carbon/50 border border-brand-gray/20 backdrop-blur-sm">
              {/* Decorative quote marks */}
              <svg className="absolute top-6 left-6 w-10 h-10 text-brand-gold/10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
              </svg>

              {aboutUs.title && (
                <h3 className="font-heading font-bold text-xl sm:text-2xl text-gradient-gold mb-6 text-center">
                  {aboutUs.title}
                </h3>
              )}
              <p className="text-brand-muted text-base sm:text-lg leading-relaxed text-center max-w-2xl mx-auto">
                {aboutUs.content}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default AboutUs
