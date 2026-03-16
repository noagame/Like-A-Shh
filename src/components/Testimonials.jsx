import { useState, useEffect, useRef } from 'react'

/**
 * Testimonials — Sección pública de testimonios aprobados.
 * Consume GET /api/comments/approved.
 * Muestra comentarios aprobados en un layout de tarjetas con animación reveal.
 * Si el usuario está logueado, puede enviar un nuevo comentario.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Testimonials = () => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ course: '', text: '' })
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const sectionRef = useRef(null)

  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`${API_URL}/api/comments/approved`)
        const data = await res.json()
        if (data.success) setComments(data.data)
      } catch (error) {
        console.error('Error fetching comments:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchComments()
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
  }, [loading, comments])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.course.trim() || form.text.trim().length < 10) {
      setMessage({ type: 'error', text: 'Completa todos los campos (mín. 10 caracteres).' })
      return
    }
    setSending(true)
    setMessage({ type: '', text: '' })
    try {
      const res = await fetch(`${API_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: '¡Comentario enviado! Será revisado por nuestro equipo.' })
        setForm({ course: '', text: '' })
        setShowForm(false)
      } else {
        setMessage({ type: 'error', text: data.message })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error al enviar el comentario.' })
    } finally {
      setSending(false)
    }
  }

  // Get initials from name
  const getInitials = (user) => {
    if (!user) return '?'
    const first = user.firstName?.charAt(0) || ''
    const last = user.lastName?.charAt(0) || ''
    return (first + last).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'
  }

  const getDisplayName = (user) => {
    if (!user) return 'Anónimo'
    if (user.firstName) return `${user.firstName} ${user.lastName?.charAt(0) || ''}.`
    return user.email?.split('@')[0] || 'Anónimo'
  }

  // Random accent colors for avatar circles
  const avatarColors = [
    'from-brand-gold/30 to-brand-gold/10 text-brand-gold',
    'from-purple-500/30 to-purple-500/10 text-purple-400',
    'from-pink-500/30 to-pink-500/10 text-pink-400',
    'from-blue-500/30 to-blue-500/10 text-blue-400',
    'from-emerald-500/30 to-emerald-500/10 text-emerald-400',
  ]

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="relative py-24 sm:py-32 bg-brand-dark overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,175,55,0.15)_0%,_transparent_60%)]" />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="reveal text-center mb-12">
          <span className="text-brand-gold text-xs font-heading font-semibold tracking-[0.2em] uppercase">
            Testimonios
          </span>
          <h2 className="mt-3 font-heading font-black text-3xl sm:text-4xl md:text-5xl text-white">
            Lo que dicen nuestras{' '}
            <span className="text-gradient-gold">alumnas</span>
          </h2>
          <p className="mt-4 text-brand-muted text-sm sm:text-base max-w-xl mx-auto">
            Experiencias reales de quienes ya forman parte de LIKE A SHH
          </p>
        </div>

        {/* Comments grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-brand-carbon border border-brand-gray/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-gray/20" />
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-brand-gray/20 rounded" />
                    <div className="h-2 w-16 bg-brand-gray/20 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-brand-gray/20 rounded" />
                  <div className="h-3 w-5/6 bg-brand-gray/20 rounded" />
                  <div className="h-3 w-4/6 bg-brand-gray/20 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="reveal text-center py-12 text-brand-muted text-sm">
            Aún no hay testimonios publicados. ¡Sé el primero en compartir tu experiencia!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {comments.map((comment, index) => (
              <div
                key={comment._id}
                className="reveal rounded-2xl bg-brand-carbon border border-brand-gray/20 p-6 hover:border-brand-gold/15 transition-all duration-500 group"
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                {/* User info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center font-heading font-bold text-sm`}>
                    {getInitials(comment.user)}
                  </div>
                  <div>
                    <span className="font-heading font-semibold text-white text-sm block">
                      {getDisplayName(comment.user)}
                    </span>
                    <span className="text-brand-gold text-[10px] font-medium">
                      {comment.course}
                    </span>
                  </div>
                </div>

                {/* Quote mark */}
                <svg className="w-6 h-6 text-brand-gold/10 mb-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                </svg>

                {/* Text */}
                <p className="text-brand-muted text-sm leading-relaxed italic">
                  "{comment.text}"
                </p>

                {/* Admin reply if exists */}
                {comment.adminReply && (
                  <div className="mt-4 pt-3 border-t border-brand-gray/10">
                    <div className="flex items-start gap-2">
                      <span className="text-brand-gold text-[10px] font-semibold mt-0.5 shrink-0">LIKE A SHH:</span>
                      <p className="text-brand-muted/70 text-xs leading-relaxed">
                        {comment.adminReply}
                      </p>
                    </div>
                  </div>
                )}

                {/* Date */}
                <div className="mt-4 text-brand-muted/40 text-[10px]">
                  {new Date(comment.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA: Leave a comment (only if logged in) */}
        <div className="reveal mt-12 text-center">
          {message.text && (
            <div className={`mb-4 inline-block px-5 py-2 rounded-xl text-sm ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          {token ? (
            showForm ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3 text-left">
                <div>
                  <label className="block text-xs font-medium text-brand-muted mb-1">Curso</label>
                  <input
                    value={form.course}
                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                    placeholder="¿De qué curso quieres hablar?"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-carbon border border-brand-gray/30 text-white text-sm placeholder:text-brand-muted/50 focus:border-brand-gold/50 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-muted mb-1">Tu experiencia</label>
                  <textarea
                    value={form.text}
                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                    rows={3}
                    placeholder="Cuéntanos tu experiencia (mín. 10 caracteres)..."
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-carbon border border-brand-gray/30 text-white text-sm placeholder:text-brand-muted/50 focus:border-brand-gold/50 focus:outline-none transition-all resize-none"
                  />
                </div>
                <div className="flex gap-3 justify-center pt-1">
                  <button
                    type="submit"
                    disabled={sending}
                    className="btn-shimmer px-6 py-2.5 rounded-xl text-brand-black font-heading font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    {sending ? 'Enviando...' : 'Enviar Comentario'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setMessage({ type: '', text: '' }) }}
                    className="px-5 py-2.5 rounded-xl border border-brand-gray/30 text-brand-muted text-sm hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-brand-gold/30 text-brand-gold font-heading font-semibold text-sm hover:bg-brand-gold/10 hover:border-brand-gold/50 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Compartir mi experiencia
              </button>
            )
          ) : (
            <p className="text-brand-muted text-xs">
              <a href="/login" className="text-brand-gold hover:underline">Inicia sesión</a> para dejar tu testimonio.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
