import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

/**
 * RegisterPage — Registro con nombre, apellido, email, contraseña y aceptación de términos.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Nombre y apellido son obligatorios')
      return
    }

    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (!form.acceptedTerms) {
      setError('Debes aceptar los términos y condiciones')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          acceptedTerms: form.acceptedTerms,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Error al registrar')
        setLoading(false)
        return
      }

      // Guardar token y datos
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))

      // Redirigir al panel del usuario
      navigate('/panel')
    } catch (err) {
      setError('Error de conexión con el servidor')
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl bg-brand-dark border border-brand-gray/30 text-white text-sm placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-all'

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
              Crear Cuenta
            </h1>
            <p className="text-brand-muted text-sm">
              Únete a la comunidad LIKE A SHH
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
            {/* Name fields in a row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1.5">Nombre</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1.5">Apellido</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Tu apellido"
                  className={inputClass}
                  required
                />
              </div>
            </div>

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
                className={inputClass}
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
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1.5">
                Confirmar contraseña
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                className={inputClass}
                required
              />
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="acceptedTerms"
                checked={form.acceptedTerms}
                onChange={handleChange}
                id="terms-checkbox"
                className="mt-1 w-4 h-4 rounded border-brand-gray/30 bg-brand-dark text-brand-gold focus:ring-brand-gold/20 cursor-pointer"
              />
              <label htmlFor="terms-checkbox" className="text-brand-muted text-sm leading-relaxed cursor-pointer">
                Acepto los{' '}
                <Link
                  to="/terminos"
                  target="_blank"
                  className="text-brand-gold hover:underline"
                >
                  Términos y Condiciones
                </Link>{' '}
                y la Política de Privacidad
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-shimmer py-3.5 rounded-xl text-brand-black font-heading font-bold text-sm tracking-wide hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-brand-muted text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="text-brand-gold font-semibold hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
