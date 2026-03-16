import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

/**
 * LoginPage — Inicio de sesión con diseño premium dark.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const LoginPage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Error al iniciar sesión')
        setLoading(false)
        return
      }

      // Guardar token y datos del usuario
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))

      // Redirigir según rol
      if (data.data.user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/panel')
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4 py-12 font-body">
      {/* Background glow */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.1)_0%,_transparent_70%)]" />

      <div className="relative w-full max-w-md">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-brand-muted text-sm hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </Link>

        {/* Card */}
        <div className="rounded-2xl bg-brand-carbon border border-brand-gray/20 p-8 shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white mb-2">
              Iniciar Sesión
            </h1>
            <p className="text-brand-muted text-sm">
              Accede a tu cuenta de LIKE A SHH
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-fade-in">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 rounded-xl bg-brand-dark border border-brand-gray/30 text-white text-sm placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                className="w-full px-4 py-3 rounded-xl bg-brand-dark border border-brand-gray/30 text-white text-sm placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-shimmer py-3.5 rounded-xl text-brand-black font-heading font-bold text-sm tracking-wide hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-brand-muted text-sm">
            ¿No tienes cuenta?{' '}
            <Link
              to="/registro"
              className="text-brand-gold font-semibold hover:underline"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
