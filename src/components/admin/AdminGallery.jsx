import { useState } from 'react'

/**
 * AdminGallery — CRUD manager for gallery/carousels.
 * Drag & drop zone mockup for adding images.
 */

const initialGalleries = [
  {
    id: 1,
    name: 'Sesión Pole Exotic 2024',
    description: 'Fotos profesionales de la sesión de pole exotic.',
    photos: 6,
    createdAt: '2024-12-01',
  },
]

const AdminGallery = () => {
  const [galleries, setGalleries] = useState(initialGalleries)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [editingId, setEditingId] = useState(null)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = [...e.dataTransfer.files].filter((f) => f.type.startsWith('image/'))
    setSelectedFiles((prev) => [...prev, ...files.map((f) => f.name)])
  }

  const handleFileInput = (e) => {
    const files = [...e.target.files]
    setSelectedFiles((prev) => [...prev, ...files.map((f) => f.name)])
  }

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return

    if (editingId) {
      setGalleries((prev) =>
        prev.map((g) =>
          g.id === editingId
            ? { ...g, name: form.name, description: form.description, photos: g.photos + selectedFiles.length }
            : g
        )
      )
      setEditingId(null)
    } else {
      setGalleries((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: form.name,
          description: form.description,
          photos: selectedFiles.length,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ])
    }
    setForm({ name: '', description: '' })
    setSelectedFiles([])
    setShowForm(false)
  }

  const handleEdit = (gallery) => {
    setForm({ name: gallery.name, description: gallery.description })
    setEditingId(gallery.id)
    setSelectedFiles([])
    setShowForm(true)
  }

  const handleDelete = (id) => {
    setGalleries((prev) => prev.filter((g) => g.id !== id))
  }

  const handleCancel = () => {
    setForm({ name: '', description: '' })
    setSelectedFiles([])
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-white">Galería Like A Shh</h1>
          <p className="text-brand-muted text-sm mt-1">Gestiona las galerías de fotos</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 btn-shimmer px-5 py-2.5 rounded-xl text-brand-black font-heading font-bold text-sm hover:scale-105 transition-transform"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva Galería
          </button>
        )}
      </div>

      {/* ── Form Card ── */}
      {showForm && (
        <div className="rounded-2xl bg-brand-carbon border border-brand-gray/20 p-6 shadow-lg animate-fade-in-up">
          <h2 className="font-heading font-bold text-lg text-white mb-6">
            {editingId ? 'Editar Galería' : 'Crear Nueva Galería'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Gallery name */}
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1.5">
                Nombre de la galería
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej: Sesión Floorwork Marzo"
                className="w-full px-4 py-2.5 rounded-xl bg-brand-dark border border-brand-gray/30 text-white text-sm placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-all"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1.5">
                Descripción / Propósito
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe el propósito de esta galería..."
                className="w-full px-4 py-2.5 rounded-xl bg-brand-dark border border-brand-gray/30 text-white text-sm placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-all resize-none"
              />
            </div>

            {/* Drag & Drop zone */}
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1.5">
                Fotos
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-brand-gold bg-brand-gold/5'
                    : 'border-brand-gray/30 hover:border-brand-gold/30'
                }`}
              >
                <svg className="w-10 h-10 mx-auto text-brand-muted/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-brand-muted text-sm mb-1">
                  Arrastra y suelta tus imágenes aquí
                </p>
                <p className="text-brand-muted/50 text-xs mb-4">o</p>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-gold/30 text-brand-gold text-xs font-medium cursor-pointer hover:bg-brand-gold/10 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Seleccionar archivos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Selected files preview */}
              {selectedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {selectedFiles.map((name, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-brand-dark/60 border border-brand-gray/20"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <svg className="w-4 h-4 text-brand-gold/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z" />
                        </svg>
                        <span className="text-xs text-brand-muted truncate">{name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-brand-muted hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 btn-shimmer px-6 py-2.5 rounded-xl text-brand-black font-heading font-bold text-sm hover:scale-105 transition-transform"
              >
                {editingId ? 'Actualizar' : 'Guardar Galería'}
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

      {/* ── Galleries grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {galleries.map((gallery) => (
          <div
            key={gallery.id}
            className="rounded-2xl bg-brand-carbon border border-brand-gray/20 overflow-hidden hover:border-brand-gold/20 transition-all group"
          >
            {/* Image placeholder */}
            <div className="h-36 bg-gradient-to-br from-brand-dark to-brand-gray/20 flex items-center justify-center">
              <svg className="w-12 h-12 text-brand-gold/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z" />
              </svg>
            </div>

            <div className="p-4">
              <h3 className="font-heading font-semibold text-white text-sm">{gallery.name}</h3>
              <p className="text-brand-muted text-xs mt-1 line-clamp-2">{gallery.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-brand-muted">
                  {gallery.photos} fotos · {gallery.createdAt}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(gallery)}
                    className="p-1.5 rounded-lg text-brand-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(gallery.id)}
                    className="p-1.5 rounded-lg text-brand-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminGallery
