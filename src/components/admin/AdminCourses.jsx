import { useState } from 'react'

/**
 * AdminCourses — CRUD manager for courses.
 * Uses useState to simulate full CRUD operations.
 */

const LEVELS = ['Inicial', 'Intermedio', 'Experto', 'Todos los niveles']
const ACCESS_OPTIONS = ['30 días', '45 días', '60 días']

const initialCourses = [
  {
    id: 1,
    name: 'Pole Dance Inicial',
    level: 'Inicial',
    description: 'Descubre el mundo del Pole Dance desde cero con fundamentos esenciales.',
    link: 'https://hotmart.com/es/marketplace',
    access: '30 días',
    certificate: true,
  },
  {
    id: 2,
    name: 'Figuras & Transiciones',
    level: 'Intermedio',
    description: 'Domina figuras intermedias y el arte de las transiciones fluidas.',
    link: 'https://hotmart.com/es/marketplace',
    access: '45 días',
    certificate: true,
  },
]

const emptyForm = {
  name: '',
  level: 'Inicial',
  description: '',
  link: '',
  access: '30 días',
  certificate: false,
}

const AdminCourses = () => {
  const [courses, setCourses] = useState(initialCourses)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.description.trim()) return

    if (editingId) {
      setCourses((prev) =>
        prev.map((c) => (c.id === editingId ? { ...form, id: editingId } : c))
      )
      setEditingId(null)
    } else {
      setCourses((prev) => [...prev, { ...form, id: Date.now() }])
    }
    setForm(emptyForm)
    setShowForm(false)
  }

  const handleEdit = (course) => {
    setForm({ ...course })
    setEditingId(course.id)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    setCourses((prev) => prev.filter((c) => c.id !== id))
  }

  const handleCancel = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-white">Gestión de Cursos</h1>
          <p className="text-brand-muted text-sm mt-1">Administra los cursos de la academia</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 btn-shimmer px-5 py-2.5 rounded-xl text-brand-black font-heading font-bold text-sm hover:scale-105 transition-transform"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo Curso
          </button>
        )}
      </div>

      {/* ── Form Card ── */}
      {showForm && (
        <div className="rounded-2xl bg-brand-carbon border border-brand-gray/20 p-6 shadow-lg animate-fade-in-up">
          <h2 className="font-heading font-bold text-lg text-white mb-6">
            {editingId ? 'Editar Curso' : 'Crear Nuevo Curso'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1.5">
                Nombre del curso
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej: Pole Dance Avanzado"
                className="w-full px-4 py-2.5 rounded-xl bg-brand-dark border border-brand-gray/30 text-white text-sm placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-all"
                required
              />
            </div>

            {/* Level + Access row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1.5">
                  Nivel de dificultad
                </label>
                <select
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-dark border border-brand-gray/30 text-white text-sm focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-all appearance-none"
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1.5">
                  Acceso al curso
                </label>
                <select
                  name="access"
                  value={form.access}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-dark border border-brand-gray/30 text-white text-sm focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-all appearance-none"
                >
                  {ACCESS_OPTIONS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1.5">
                Descripción del curso
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe los contenidos y beneficios del curso..."
                className="w-full px-4 py-2.5 rounded-xl bg-brand-dark border border-brand-gray/30 text-white text-sm placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-all resize-none"
                required
              />
            </div>

            {/* Link */}
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1.5">
                Link del curso (Hotmart)
              </label>
              <input
                type="url"
                name="link"
                value={form.link}
                onChange={handleChange}
                placeholder="https://hotmart.com/..."
                className="w-full px-4 py-2.5 rounded-xl bg-brand-dark border border-brand-gray/30 text-white text-sm placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-all"
              />
            </div>

            {/* Certificate toggle */}
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="certificate"
                  checked={form.certificate}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-brand-gray/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold/70" />
              </label>
              <span className="text-sm text-brand-muted">Incluye certificado</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 btn-shimmer px-6 py-2.5 rounded-xl text-brand-black font-heading font-bold text-sm hover:scale-105 transition-transform"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {editingId ? 'Actualizar' : 'Guardar Curso'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 rounded-xl border border-brand-gray/30 text-brand-muted text-sm font-medium hover:text-white hover:border-brand-gray/50 transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Courses Table / List ── */}
      <div className="rounded-2xl bg-brand-carbon border border-brand-gray/20 overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-brand-gray/20">
          <h3 className="font-heading font-semibold text-white text-sm">
            Cursos activos ({courses.length})
          </h3>
        </div>

        {courses.length === 0 ? (
          <div className="px-6 py-12 text-center text-brand-muted text-sm">
            No hay cursos registrados. Crea el primero.
          </div>
        ) : (
          <div className="divide-y divide-brand-gray/10">
            {courses.map((course) => (
              <div
                key={course.id}
                className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-brand-dark/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-semibold text-white text-sm truncate">
                    {course.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[10px] text-brand-gold font-semibold px-2 py-0.5 rounded-full border border-brand-gold/20 bg-brand-gold/5 uppercase tracking-wider">
                      {course.level}
                    </span>
                    <span className="text-xs text-brand-muted">{course.access}</span>
                    {course.certificate && (
                      <span className="text-[10px] text-green-400 font-medium px-2 py-0.5 rounded-full border border-green-400/20 bg-green-400/5">
                        Certificado
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(course)}
                    className="p-2 rounded-lg text-brand-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-all"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="p-2 rounded-lg text-brand-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
                    title="Eliminar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCourses
