import { useState, useEffect } from 'react'

/**
 * AdminSettings — Full CRUD for site settings (instructor, aboutUs, socials).
 * Connected to GET/PUT /api/settings.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const AdminSettings = () => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('instructor')

  // Editable copies
  const [contactEmail, setContactEmail] = useState('')
  const [aboutUs, setAboutUs] = useState({ title: '', content: '' })
  const [instructor, setInstructor] = useState({
    name: '', subtitle: '', bio: '', bio2: '', quote: '', stats: [],
  })
  const [socials, setSocials] = useState([])
  const [newSocial, setNewSocial] = useState({ platform: '', url: '' })

  const token = localStorage.getItem('token')

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings`)
      const data = await res.json()
      if (data.success) {
        const s = data.data
        setSettings(s)
        setContactEmail(s.contactEmail || '')
        setAboutUs(s.aboutUs || { title: '', content: '' })
        setInstructor(s.instructor || { name: '', subtitle: '', bio: '', bio2: '', quote: '', stats: [] })
        setSocials(s.socialMedia || [])
      }
    } catch {
      setError('Error al cargar configuración.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSettings() }, [])

  const showMessage = (msg, type = 'success') => {
    if (type === 'error') { setError(msg); setSuccess('') }
    else { setSuccess(msg); setError('') }
    setTimeout(() => { setError(''); setSuccess('') }, 3000)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          contactEmail,
          aboutUs,
          instructor,
          socialMedia: socials,
        }),
      })
      const data = await res.json()
      if (data.success) showMessage('Configuración guardada.')
      else showMessage(data.message, 'error')
    } catch {
      showMessage('Error al guardar.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Stats handlers
  const addStat = () => {
    setInstructor({ ...instructor, stats: [...instructor.stats, { value: '', label: '' }] })
  }
  const updateStat = (index, field, value) => {
    const newStats = [...instructor.stats]
    newStats[index] = { ...newStats[index], [field]: value }
    setInstructor({ ...instructor, stats: newStats })
  }
  const removeStat = (index) => {
    setInstructor({ ...instructor, stats: instructor.stats.filter((_, i) => i !== index) })
  }

  // Social handlers
  const addSocial = () => {
    if (!newSocial.platform || !newSocial.url) return
    setSocials([...socials, { ...newSocial }])
    setNewSocial({ platform: '', url: '' })
  }
  const removeSocial = (index) => {
    setSocials(socials.filter((_, i) => i !== index))
  }

  const tabs = [
    { id: 'instructor', label: 'Instructor' },
    { id: 'aboutUs', label: 'Quiénes Somos' },
    { id: 'contact', label: 'Contacto & Redes' },
  ]

  const inputClass = 'w-full px-3 py-2 rounded-lg bg-brand-carbon border border-brand-gray/30 text-white text-sm focus:border-brand-gold/50 focus:outline-none transition-colors'

  if (loading) return <div className="text-brand-muted text-sm text-center py-12">Cargando configuración...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl text-white">Configuración del Sitio</h2>
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2 rounded-lg btn-shimmer text-brand-black text-sm font-heading font-bold hover:scale-105 transition-transform disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar Todo'}
        </button>
      </div>

      {success && <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">{success}</div>}
      {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-1 bg-brand-dark rounded-lg p-1 border border-brand-gray/20">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-xs font-medium transition-all ${
              activeTab === tab.id ? 'bg-brand-carbon text-brand-gold' : 'text-brand-muted hover:text-white'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-xl bg-brand-dark border border-brand-gray/20 p-6 space-y-5">

        {/* ── Instructor Tab ── */}
        {activeTab === 'instructor' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">Nombre completo</label>
                <input value={instructor.name} onChange={(e) => setInstructor({ ...instructor, name: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">Subtítulo</label>
                <input value={instructor.subtitle} onChange={(e) => setInstructor({ ...instructor, subtitle: e.target.value })}
                  className={inputClass} placeholder="Ej: Tu instructor de Pole Dance" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Biografía (párrafo 1)</label>
              <textarea value={instructor.bio} onChange={(e) => setInstructor({ ...instructor, bio: e.target.value })}
                rows={4} className={`${inputClass} resize-none`} />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Biografía (párrafo 2)</label>
              <textarea value={instructor.bio2} onChange={(e) => setInstructor({ ...instructor, bio2: e.target.value })}
                rows={3} className={`${inputClass} resize-none`} />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Frase / Cita</label>
              <input value={instructor.quote} onChange={(e) => setInstructor({ ...instructor, quote: e.target.value })}
                className={inputClass} placeholder="Ej: El Pole Dance es arte, fuerza y libertad" />
            </div>

            {/* Stats */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-brand-muted">Estadísticas</label>
                <button onClick={addStat} className="text-xs text-brand-gold hover:underline">+ Agregar stat</button>
              </div>
              <div className="space-y-2">
                {instructor.stats.map((stat, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={stat.value} placeholder="Valor (ej: 500+)"
                      onChange={(e) => updateStat(i, 'value', e.target.value)}
                      className={`${inputClass} w-28`} />
                    <input value={stat.label} placeholder="Label (ej: Alumnas)"
                      onChange={(e) => updateStat(i, 'label', e.target.value)}
                      className={inputClass} />
                    <button onClick={() => removeStat(i)}
                      className="text-red-400/60 hover:text-red-400 flex-shrink-0 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── About Us Tab ── */}
        {activeTab === 'aboutUs' && (
          <>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Título</label>
              <input value={aboutUs.title}
                onChange={(e) => setAboutUs({ ...aboutUs, title: e.target.value })}
                className={inputClass} placeholder="Ej: LIKE A SHH — Arte en movimiento" />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Contenido</label>
              <textarea value={aboutUs.content}
                onChange={(e) => setAboutUs({ ...aboutUs, content: e.target.value })}
                rows={6} className={`${inputClass} resize-none`}
                placeholder="Describe qué es la marca Like a Shh..." />
            </div>
          </>
        )}

        {/* ── Contact & Socials Tab ── */}
        {activeTab === 'contact' && (
          <>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Email de contacto</label>
              <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                className={inputClass} placeholder="contacto@likeashh.com" />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-muted mb-2">Redes Sociales</label>
              <div className="space-y-2 mb-3">
                {socials.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-brand-gold w-24 truncate">{s.platform}</span>
                    <span className="text-brand-muted flex-1 truncate">{s.url}</span>
                    <button onClick={() => removeSocial(i)}
                      className="text-red-400/60 hover:text-red-400 transition-colors flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newSocial.platform}
                  onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
                  placeholder="Plataforma" className={`${inputClass} w-32`} />
                <input value={newSocial.url}
                  onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
                  placeholder="URL" className={inputClass} />
                <button onClick={addSocial}
                  className="px-4 py-2 rounded-lg border border-brand-gold/30 text-brand-gold text-xs font-medium hover:bg-brand-gold/10 transition-colors flex-shrink-0">
                  Agregar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminSettings
