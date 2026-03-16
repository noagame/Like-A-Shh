import { useState, useEffect, useRef } from 'react'

/**
 * Courses Section — Dynamic course catalog from API with modal details.
 *
 * id="course-details" → smooth-scroll target from Hero CTA.
 * Fetches courses from GET /api/courses?active=true
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ─── Course Modal Component ──────────────────────────────────────
const CourseModal = ({ course, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen || !course) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />

      {/* Modal content */}
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-brand-carbon border border-brand-gray/30 shadow-2xl shadow-black/50 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-brand-dark/80 border border-brand-gray/30 text-brand-muted hover:text-white hover:border-brand-gold/40 transition-all duration-300 z-10"
          aria-label="Cerrar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-brand-gray/20">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{course.icon || '🔥'}</span>
            <div>
              <h3 className="font-heading font-bold text-xl text-white">
                {course.name}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-brand-gold font-medium px-2 py-0.5 rounded-full border border-brand-gold/30 bg-brand-gold/5">
                  {course.level}
                </span>
                <span className="text-xs text-brand-muted">
                  {course.duration || course.access}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-brand-muted text-sm leading-relaxed">
            {course.description}
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-brand-muted">
              <svg className="w-4 h-4 text-brand-gold/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Acceso: {course.access}
            </div>
            <div className="flex items-center gap-2 text-xs text-brand-muted">
              <svg className="w-4 h-4 text-brand-gold/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Soporte directo
            </div>
            <div className="flex items-center gap-2 text-xs text-brand-muted">
              <svg className="w-4 h-4 text-brand-gold/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Videos HD
            </div>
            {course.certificate && (
              <div className="flex items-center gap-2 text-xs text-brand-muted">
                <svg className="w-4 h-4 text-brand-gold/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Certificado
              </div>
            )}
          </div>
        </div>

        {/* Footer — Registrarse CTA */}
        <div className="p-6 pt-2">
          <a
            href={course.link || 'https://hotmart.com/es/marketplace'}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2 w-full btn-shimmer py-3.5 rounded-xl text-brand-black font-heading font-bold text-base tracking-wide hover:scale-[1.02] transition-transform duration-300"
          >
            Registrarse
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <p className="text-center text-brand-muted/50 text-xs mt-3">
            Serás redirigido a la plataforma de pago seguro
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Course Card Component ───────────────────────────────────────
const CourseCard = ({ course, onOpenModal }) => (
  <div className="group relative p-6 sm:p-8 rounded-2xl bg-brand-dark/50 border border-brand-gray/20 hover:border-brand-gold/30 transition-all duration-400 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-gold/5">
    {/* Level badge */}
    <span className="absolute top-4 right-4 text-[10px] text-brand-gold font-semibold px-2.5 py-1 rounded-full border border-brand-gold/20 bg-brand-gold/5 uppercase tracking-wider">
      {course.level}
    </span>

    {/* Icon */}
    <span className="text-4xl block mb-4">{course.icon || '🔥'}</span>

    {/* Name */}
    <h3 className="font-heading font-bold text-lg sm:text-xl text-white mb-2 group-hover:text-gradient-gold transition-colors duration-300">
      {course.name}
    </h3>

    {/* Duration */}
    <p className="text-brand-muted text-sm mb-6 flex items-center gap-1.5">
      <svg className="w-4 h-4 text-brand-gold/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {course.duration || course.access}
    </p>

    {/* CTA Button */}
    <button
      onClick={() => onOpenModal(course)}
      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-brand-gold/40 text-brand-gold font-heading font-semibold text-sm tracking-wide hover:bg-brand-gold/10 hover:border-brand-gold transition-all duration-300"
    >
      Comprar Ahora
      <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </button>
  </div>
)

// ─── Loading Skeleton ────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="p-6 sm:p-8 rounded-2xl bg-brand-dark/50 border border-brand-gray/20 animate-pulse">
    <div className="w-10 h-10 bg-brand-gray/20 rounded-lg mb-4" />
    <div className="h-5 bg-brand-gray/20 rounded w-3/4 mb-3" />
    <div className="h-4 bg-brand-gray/20 rounded w-1/2 mb-6" />
    <div className="h-10 bg-brand-gray/20 rounded-xl" />
  </div>
)

// ─── Main Courses Section ────────────────────────────────────────
const CourseDetails = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const sectionRef = useRef(null)

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_URL}/api/courses?active=true`)
        const data = await res.json()
        if (data.success) setCourses(data.data)
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  // Reveal animation
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
  }, [loading])

  return (
    <>
      <section
        id="course-details"
        ref={sectionRef}
        className="relative py-24 sm:py-32 bg-brand-black overflow-hidden"
      >
        {/* Background accent */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.08)_0%,_transparent_60%)]" />

        <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
          {/* Section heading */}
          <div className="reveal text-center mb-14">
            <span className="text-brand-gold text-xs font-heading font-semibold tracking-[0.2em] uppercase">
              Nuestros programas
            </span>
            <h2 className="mt-3 font-heading font-black text-3xl sm:text-4xl md:text-5xl text-white">
              Cursos <span className="text-gradient-gold">Disponibles</span>
            </h2>
            <p className="mt-4 text-brand-muted max-w-xl mx-auto text-sm sm:text-base">
              Elige el programa que mejor se adapte a tu nivel y comienza tu transformación hoy.
            </p>
          </div>

          {/* Course cards grid */}
          <div className="reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : courses.length === 0 ? (
              <div className="col-span-full text-center py-12 text-brand-muted">
                No hay cursos disponibles en este momento.
              </div>
            ) : (
              courses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onOpenModal={setSelectedCourse}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Course detail modal */}
      <CourseModal
        course={selectedCourse}
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />
    </>
  )
}

export default CourseDetails
