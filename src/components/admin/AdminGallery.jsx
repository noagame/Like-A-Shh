import { useState, useEffect } from 'react'

/**
 * AdminGallery — Full CRUD connected to /api/galleries.
 * Supports image upload via FormData + multer.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const AdminGallery = () => {
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ name: '', description: '' })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [preview, setPreview] = useState([])

  const token = localStorage.getItem('token')

  const fetchGalleries = async () => {
    try {
      const res = await fetch(`${API_URL}/api/galleries/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setGalleries(data.data)
    } catch {
      setError('Error al cargar galerías.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGalleries() }, [])

  const showMessage = (msg, type = 'success') => {
    if (type === 'error') { setError(msg); setSuccess('') }
    else { setSuccess(msg); setError('') }
    setTimeout(() => { setError(''); setSuccess('') }, 3000)
  }

  const resetForm = () => {
    setForm({ name: '', description: '' })
    setEditingId(null)
    setShowForm(false)
    setSelectedFiles([])
    setPreview([])
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
    // Create preview URLs
    const previews = files.map((f) => URL.createObjectURL(f))
    setPreview(previews)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        // Update metadata only
        const res = await fetch(`${API_URL}/api/galleries/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(form),
        })
        const data = await res.json()
        if (data.success) {
          // If new files selected, add images
          if (selectedFiles.length > 0) {
            const fd = new FormData()
            selectedFiles.forEach((f) => fd.append('images', f))
            await fetch(`${API_URL}/api/galleries/${editingId}/images`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: fd,
            })
          }
          showMessage('Galería actualizada.')
        } else {
          showMessage(data.message, 'error')
        }
      } else {
        // Create new gallery with images
        const fd = new FormData()
        fd.append('name', form.name)
        fd.append('description', form.description)
        selectedFiles.forEach((f) => fd.append('images', f))

        const res = await fetch(`${API_URL}/api/galleries`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        })
        const data = await res.json()
        if (data.success) showMessage('Galería creada.')
        else showMessage(data.message, 'error')
      }
      resetForm()
      fetchGalleries()
    } catch {
      showMessage('Error al guardar galería.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (gallery) => {
    setForm({ name: gallery.name, description: gallery.description || '' })
    setEditingId(gallery._id)
    setShowForm(true)
    setSelectedFiles([])
    setPreview([])
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta galería y todas sus imágenes?')) return
    try {
      const res = await fetch(`${API_URL}/api/galleries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        showMessage('Galería eliminada.')
        fetchGalleries()
      }
    } catch {
      showMessage('Error al eliminar.', 'error')
    }
  }

  const handleRemoveImage = async (galleryId, imageId) => {
    if (!window.confirm('¿Eliminar esta imagen?')) return
    try {
      const res = await fetch(`${API_URL}/api/galleries/${galleryId}/images/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        showMessage('Imagen eliminada.')
        fetchGalleries()
      }
    } catch {
      showMessage('Error al eliminar imagen.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl text-white">Gestión de Galerías</h2>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm) }}
          className="px-4 py-2 rounded-lg btn-shimmer text-brand-black text-sm font-heading font-bold hover:scale-105 transition-transform"
        >
          {showForm ? 'Cancelar' : '+ Nueva Galería'}
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
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full px-3 py-2 rounded-lg bg-brand-carbon border border-brand-gray/30 text-white text-sm focus:border-brand-gold/50 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">Descripción</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-brand-carbon border border-brand-gray/30 text-white text-sm focus:border-brand-gold/50 focus:outline-none" />
            </div>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-xs font-medium text-brand-muted mb-1">Imágenes</label>
            <label className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-brand-gray/30 hover:border-brand-gold/30 cursor-pointer transition-colors bg-brand-carbon/50">
              <svg className="w-8 h-8 text-brand-muted/50 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-xs text-brand-muted">Clic para seleccionar imágenes</span>
              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {preview.map((src, i) => (
                <img key={i} src={src} alt={`Preview ${i}`}
                  className="w-16 h-16 rounded-lg object-cover border border-brand-gray/20" />
              ))}
            </div>
          )}

          <button type="submit" disabled={saving}
            className="btn-shimmer px-6 py-2.5 rounded-lg text-brand-black font-heading font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50">
            {saving ? 'Guardando...' : editingId ? 'Actualizar Galería' : 'Crear Galería'}
          </button>
        </form>
      )}

      {/* Galleries list */}
      {loading ? (
        <div className="text-brand-muted text-sm text-center py-12">Cargando galerías...</div>
      ) : galleries.length === 0 ? (
        <div className="text-brand-muted text-sm text-center py-12">No hay galerías registradas.</div>
      ) : (
        <div className="space-y-6">
          {galleries.map((gallery) => (
            <div key={gallery._id} className="rounded-xl bg-brand-dark border border-brand-gray/20 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-heading font-semibold text-white text-sm">{gallery.name}</h3>
                  <span className="text-xs text-brand-muted">{gallery.images.length} imágenes</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(gallery)}
                    className="px-3 py-1 rounded-md text-xs border border-brand-gray/30 text-brand-muted hover:text-brand-gold hover:border-brand-gold/30 transition-all">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(gallery._id)}
                    className="px-3 py-1 rounded-md text-xs border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-all">
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Image grid */}
              {gallery.images.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {gallery.images.map((img) => (
                    <div key={img._id} className="group relative aspect-square rounded-lg overflow-hidden bg-brand-carbon">
                      <img
                        src={`${API_URL}${img.url}`}
                        alt={img.label || 'Gallery image'}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemoveImage(gallery._id, img._id)}
                        className="absolute inset-0 bg-red-500/0 hover:bg-red-500/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg className="w-5 h-5 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminGallery
