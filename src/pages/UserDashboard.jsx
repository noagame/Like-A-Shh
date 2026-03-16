import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * UserDashboard — Panel de usuario.
 * Shows user info, purchased courses, and allows rating.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ─── Star Rating Input ───────────────────────────────────────────
const StarInput = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="focus:outline-none"
      >
        <svg
          className={`w-7 h-7 transition-colors duration-200 ${
            star <= value ? 'text-brand-gold' : 'text-brand-gray/40 hover:text-brand-gold/50'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>
    ))}
  </div>
)

// ─── Rating Modal ────────────────────────────────────────────────
const RatingModal = ({ course, isOpen, onClose, onSuccess }) => {
  const [stars, setStars] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setStars(0)
      setComment('')
      setError('')
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen || !course) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (stars === 0) return setError('Selecciona una calificación.')
    if (comment.trim().length < 10) return setError('El comentario debe tener al menos 10 caracteres.')

    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: course._id, stars, comment }),
      })
      const data = await res.json()
      if (data.success) {
        onSuccess()
        onClose()
      } else {
        setError(data.message)
      }
    } catch {
      setError('Error al enviar la calificación.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl bg-brand-carbon border border-brand-gray/30 shadow-2xl p-6 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading font-bold text-lg text-white mb-1">
          Calificar: {course.name}
        </h3>
        <p className="text-brand-muted text-xs mb-6">Tu opinión es importante para nosotros</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-muted mb-2">
              Calificación
            </label>
            <StarInput value={stars} onChange={setStars} />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-muted mb-1.5">
              Comentario
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Cuéntanos tu experiencia con el curso..."
              className="w-full px-4 py-2.5 rounded-xl bg-brand-dark border border-brand-gray/30 text-white text-sm placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-all resize-none"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-shimmer py-2.5 rounded-xl text-brand-black font-heading font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Calificación'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-brand-gray/30 text-brand-muted text-sm hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────
const UserDashboard = () => {
  const [user, setUser] = useState(null)
  const [myRatings, setMyRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [ratingCourse, setRatingCourse] = useState(null)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')

  const fetchData = async () => {
    try {
      const [userRes, ratingsRes] = await Promise.all([
        fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/ratings/me`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const userData = await userRes.json()
      const ratingsData = await ratingsRes.json()

      if (userData.success) setUser(userData.data.user)
      if (ratingsData.success) setMyRatings(ratingsData.data)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  // Check if user already rated a course for its current version
  const hasRated = (courseId, courseVersion) => {
    return myRatings.some((r) => r.course?._id === courseId && r.courseVersion === courseVersion)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-black text-white font-body">
      {/* Top bar */}
      <header className="sticky top-0 z-30 glass px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-brand-muted hover:text-white transition-colors text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al sitio
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-brand-muted text-sm hidden sm:inline">
            {user?.firstName} {user?.lastName}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-1.5 rounded-lg border border-brand-gray/30 text-brand-muted text-xs hover:text-white hover:border-brand-gray/50 transition-all"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="font-heading font-bold text-2xl sm:text-3xl">
            Hola, <span className="text-gradient-gold">{user?.firstName}</span> 👋
          </h1>
          <p className="text-brand-muted text-sm mt-1">
            Bienvenid@ a tu panel de LIKE A SHH
          </p>
        </div>

        {/* Purchased Courses */}
        <section className="mb-12">
          <h2 className="font-heading font-bold text-xl text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-gold/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Mis Cursos
          </h2>

          {!user?.purchasedCourses?.length ? (
            <div className="rounded-2xl bg-brand-carbon border border-brand-gray/20 p-8 text-center">
              <p className="text-brand-muted text-sm mb-4">No tienes cursos vinculados aún.</p>
              <a
                href="https://hotmart.com/es/marketplace"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 btn-shimmer px-6 py-2.5 rounded-xl text-brand-black font-heading font-bold text-sm"
              >
                Explorar Cursos
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.purchasedCourses.map((course) => (
                <div
                  key={course._id}
                  className="rounded-2xl bg-brand-carbon border border-brand-gray/20 p-6 hover:border-brand-gold/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{course.icon || '🔥'}</span>
                      <div>
                        <h3 className="font-heading font-semibold text-white text-sm">
                          {course.name}
                        </h3>
                        <span className="text-[10px] text-brand-gold font-semibold px-2 py-0.5 rounded-full border border-brand-gold/20 bg-brand-gold/5">
                          {course.level}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-brand-muted text-xs mt-3 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-brand-gray/10">
                    <span className="text-xs text-brand-muted">
                      {course.duration} · {course.access}
                    </span>

                    {hasRated(course._id, course.version) ? (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                        </svg>
                        Calificado
                      </span>
                    ) : (
                      <button
                        onClick={() => setRatingCourse(course)}
                        className="text-xs text-brand-gold font-medium hover:underline flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Calificar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* My ratings */}
        {myRatings.length > 0 && (
          <section>
            <h2 className="font-heading font-bold text-xl text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-gold/60" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Mis Calificaciones
            </h2>
            <div className="space-y-3">
              {myRatings.map((rating) => (
                <div
                  key={rating._id}
                  className="rounded-xl bg-brand-carbon border border-brand-gray/20 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading font-semibold text-white text-sm">
                      {rating.course?.name || 'Curso'}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= rating.stars ? 'text-brand-gold' : 'text-brand-gray/30'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-brand-muted text-xs italic">"{rating.comment}"</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Rating modal */}
      <RatingModal
        course={ratingCourse}
        isOpen={!!ratingCourse}
        onClose={() => setRatingCourse(null)}
        onSuccess={fetchData}
      />
    </div>
  )
}

export default UserDashboard
