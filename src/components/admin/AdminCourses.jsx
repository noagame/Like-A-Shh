import { useState, useEffect } from 'react'

/**
 * AdminCourses — Full CRUD connected to /api/courses.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const AdminCourses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    name: '',
    level: 'Inicial',
    description: '',
    link: 'https://hotmart.com/es/marketplace',
    access: '30 días',
    certificate: false,
    icon: '🔥',
    duration: '8 semanas',
  })

  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/courses`, { headers })
      const data = await res.json()
      if (data.success) setCourses(data.data)
    } catch (err) {
      setError('Error al cargar cursos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCourses() }, [])

  const showMessage = (msg, type = 'success') => {
    if (type === 'error') { setError(msg); setSuccess('') }
    else { setSuccess(msg); setError('') }
    setTimeout(() => { setError(''); setSuccess('') }, 3000)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const resetForm = () => {
    setForm({
      name: '', level: 'Inicial', description: '',
      link: 'https://hotmart.com/es/marketplace',
      access: '30 días', certificate: false, icon: '🔥', duration: '8 semanas',
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (course) => {
    setForm({
      name: course.name,
      level: course.level,
      description: course.description,
      link: course.link,
      access: course.access,
      certificate: course.certificate,
      icon: course.icon || '🔥',
      duration: course.duration || '8 semanas',
    })
    setEditingId(course._id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingId ? `${API_URL}/api/courses/${editingId}` : `${API_URL}/api/courses`
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, { method, headers, body: JSON.stringify(form) })
      const data = await res.json()

      if (data.success) {
        showMessage(editingId ? 'Curso actualizado.' : 'Curso creado.')
        resetForm()
        fetchCourses()
      } else {
        showMessage(data.message, 'error')
      }
    } catch {
      showMessage('Error al guardar curso.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este curso?')) return
    try {
      const res = await fetch(`${API_URL}/api/courses/${id}`, { method: 'DELETE', headers })
      const data = await res.json()
      if (data.success) {
        showMessage('Curso eliminado.')
        fetchCourses()
      }
    } catch {
      showMessage('Error al eliminar.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl text-white">Gestión de Cursos</h2>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm) }}
          className="px-4 py-2 rounded-lg btn-shimmer text-brand-black text-sm font-heading font-bold hover:scale-105 transition-transform"
        >
          {showForm ? 'Cancelar' : '+ Crear Curso'}
        </button>
      </div>

      {/* Messages */}
      {success && <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">{success}</div>}
      {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl bg-brand-dark border border-brand-gray/20 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Nombre</label>
              <input name="name" value={form.name} onChange={handleChange} required
                className="w-full px-3 py-2 rounded-lg bg-brand-carbon border border-brand-gray/30 text-white text-sm focus:border-brand-gold/50 focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Nivel</label>
              <select name="level" value={form.level} onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-brand-carbon border border-brand-gray/30 text-white text-sm focus:border-brand-gold/50 focus:outline-none">
                <option>Inicial</option>
                <option>Intermedio</option>
                <option>Experto</option>
                <option>Todos los niveles</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-muted mb-1">Descripción</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={3}
              className="w-full px-3 py-2 rounded-lg bg-brand-carbon border border-brand-gray/30 text-white text-sm focus:border-brand-gold/50 focus:outline-none resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Ícono (emoji)</label>
              <input name="icon" value={form.icon} onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-brand-carbon border border-brand-gray/30 text-white text-sm focus:border-brand-gold/50 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Duración</label>
              <input name="duration" value={form.duration} onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-brand-carbon border border-brand-gray/30 text-white text-sm focus:border-brand-gold/50 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Acceso</label>
              <select name="access" value={form.access} onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-brand-carbon border border-brand-gray/30 text-white text-sm focus:border-brand-gold/50 focus:outline-none">
                <option>30 días</option>
                <option>45 días</option>
                <option>60 días</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-muted mb-1">Link de Hotmart</label>
            <input name="link" value={form.link} onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-brand-carbon border border-brand-gray/30 text-white text-sm focus:border-brand-gold/50 focus:outline-none" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="certificate" checked={form.certificate} onChange={handleChange}
              className="w-4 h-4 rounded border-brand-gray/30 text-brand-gold focus:ring-brand-gold" />
            <span className="text-sm text-brand-muted">¿Incluye certificado?</span>
          </label>

          <button type="submit" disabled={saving}
            className="btn-shimmer px-6 py-2.5 rounded-lg text-brand-black font-heading font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50">
            {saving ? 'Guardando...' : editingId ? 'Actualizar Curso' : 'Crear Curso'}
          </button>
        </form>
      )}

      {/* Courses table */}
      {loading ? (
        <div className="text-brand-muted text-sm text-center py-12">Cargando cursos...</div>
      ) : courses.length === 0 ? (
        <div className="text-brand-muted text-sm text-center py-12">No hay cursos registrados.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-gray/20 text-xs text-brand-muted uppercase tracking-wider">
                <th className="pb-3 text-left">Curso</th>
                <th className="pb-3 text-left hidden sm:table-cell">Nivel</th>
                <th className="pb-3 text-left hidden md:table-cell">Duración</th>
                <th className="pb-3 text-center hidden md:table-cell">Cert.</th>
                <th className="pb-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray/10">
              {courses.map((course) => (
                <tr key={course._id} className="group hover:bg-brand-dark/30 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{course.icon}</span>
                      <span className="text-sm text-white font-medium">{course.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-brand-muted hidden sm:table-cell">{course.level}</td>
                  <td className="py-3 text-sm text-brand-muted hidden md:table-cell">{course.duration}</td>
                  <td className="py-3 text-center hidden md:table-cell">
                    {course.certificate ? (
                      <span className="text-green-400 text-xs">✓</span>
                    ) : (
                      <span className="text-brand-muted/30 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="px-3 py-1 rounded-md text-xs border border-brand-gray/30 text-brand-muted hover:text-brand-gold hover:border-brand-gold/30 transition-all"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(course._id)}
                        className="px-3 py-1 rounded-md text-xs border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-all"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminCourses
