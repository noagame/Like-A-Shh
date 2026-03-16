import { useState, useEffect } from 'react'

/**
 * AdminComments — CRUD manager for student feedback.
 * Connected to /api/comments with JWT auth.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const statusConfig = {
  Pendiente: { label: 'Pendiente', bg: 'bg-yellow-400/10', text: 'text-yellow-400', border: 'border-yellow-400/20' },
  Aprobado: { label: 'Aprobado', bg: 'bg-green-400/10', text: 'text-green-400', border: 'border-green-400/20' },
  Rechazado: { label: 'Rechazado', bg: 'bg-red-400/10', text: 'text-red-400', border: 'border-red-400/20' },
}

const AdminComments = () => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyingId, setReplyingId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchComments = async () => {
    try {
      const url = filter === 'all'
        ? `${API_URL}/api/comments`
        : `${API_URL}/api/comments?status=${filter}`
      const res = await fetch(url, { headers })
      const data = await res.json()
      if (data.success) setComments(data.data)
    } catch {
      setError('Error al cargar comentarios.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchComments() }, [filter])

  const showMessage = (msg, type = 'success') => {
    if (type === 'error') { setError(msg); setSuccess('') }
    else { setSuccess(msg); setError('') }
    setTimeout(() => { setError(''); setSuccess('') }, 3000)
  }

  const handleStatusChange = async (id, newStatus, adminReply) => {
    try {
      const body = { status: newStatus }
      if (adminReply !== undefined) body.adminReply = adminReply

      const res = await fetch(`${API_URL}/api/comments/${id}/status`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        showMessage(`Comentario ${newStatus.toLowerCase()}.`)
        fetchComments()
      } else {
        showMessage(data.message, 'error')
      }
    } catch {
      showMessage('Error al actualizar.', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este comentario?')) return
    try {
      const res = await fetch(`${API_URL}/api/comments/${id}`, {
        method: 'DELETE',
        headers,
      })
      const data = await res.json()
      if (data.success) {
        showMessage('Comentario eliminado.')
        fetchComments()
      }
    } catch {
      showMessage('Error al eliminar.', 'error')
    }
  }

  const startReply = (comment) => {
    setReplyingId(comment._id)
    setReplyText(comment.adminReply || '')
  }

  const saveReply = async (id) => {
    await handleStatusChange(id, 'Aprobado', replyText)
    setReplyingId(null)
    setReplyText('')
  }

  const getDisplayName = (user) => {
    if (!user) return 'Desconocido'
    if (user.firstName) return `${user.firstName} ${user.lastName || ''}`
    return user.email
  }

  const counts = {
    all: comments.length,
    Pendiente: comments.filter((c) => c.status === 'Pendiente').length,
    Aprobado: comments.filter((c) => c.status === 'Aprobado').length,
  }

  const filtered = filter === 'all' ? comments : comments.filter((c) => c.status === filter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl text-white">Comentarios</h1>
        <p className="text-brand-muted text-sm mt-1">Gestiona el feedback de los alumnos</p>
      </div>

      {/* Messages */}
      {success && <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">{success}</div>}
      {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: `Todos (${counts.all})` },
          { key: 'Pendiente', label: `Pendientes (${counts.Pendiente})` },
          { key: 'Aprobado', label: `Aprobados (${counts.Aprobado})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              filter === tab.key
                ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'
                : 'text-brand-muted hover:text-white border border-brand-gray/20 hover:border-brand-gray/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="text-brand-muted text-sm text-center py-12">Cargando comentarios...</div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl bg-brand-carbon border border-brand-gray/20 px-6 py-12 text-center text-brand-muted text-sm">
              No hay comentarios en esta categoría.
            </div>
          ) : (
            filtered.map((comment) => {
              const status = statusConfig[comment.status] || statusConfig.Pendiente
              return (
                <div
                  key={comment._id}
                  className="rounded-2xl bg-brand-carbon border border-brand-gray/20 p-5 hover:border-brand-gray/30 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-dark border border-brand-gray/30 flex items-center justify-center">
                        <span className="text-brand-gold text-xs font-bold">
                          {(comment.user?.firstName?.charAt(0) || comment.user?.email?.charAt(0) || '?').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="font-heading font-semibold text-white text-sm">
                          {getDisplayName(comment.user)}
                        </span>
                        <span className="text-brand-muted text-xs ml-2">
                          {new Date(comment.createdAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.text} ${status.border} uppercase tracking-wider`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Course */}
                  <p className="text-brand-gold/70 text-xs font-medium mb-1">
                    Curso: {comment.course}
                  </p>

                  {/* Text */}
                  <p className="text-brand-muted text-sm leading-relaxed mb-3">
                    "{comment.text}"
                  </p>

                  {/* Reply display */}
                  {comment.adminReply && replyingId !== comment._id && (
                    <div className="mb-3 ml-6 pl-4 border-l-2 border-brand-gold/20">
                      <p className="text-xs text-brand-muted/70">
                        <span className="text-brand-gold font-medium">Tu respuesta: </span>
                        {comment.adminReply}
                      </p>
                    </div>
                  )}

                  {/* Reply form */}
                  {replyingId === comment._id && (
                    <div className="mb-3 ml-6">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={2}
                        placeholder="Escribe tu respuesta..."
                        className="w-full px-4 py-2.5 rounded-xl bg-brand-dark border border-brand-gold/30 text-white text-sm placeholder:text-brand-muted/50 focus:outline-none focus:ring-1 focus:ring-brand-gold/20 transition-all resize-none"
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => saveReply(comment._id)}
                          className="px-4 py-1.5 rounded-lg btn-shimmer text-brand-black text-xs font-bold">
                          Aprobar y Responder
                        </button>
                        <button onClick={() => setReplyingId(null)}
                          className="px-4 py-1.5 rounded-lg border border-brand-gray/30 text-brand-muted text-xs hover:text-white transition-colors">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-gray/10">
                    {comment.status === 'Pendiente' && (
                      <>
                        <button onClick={() => handleStatusChange(comment._id, 'Aprobado')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-green-400 hover:bg-green-400/10 transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          Aprobar
                        </button>
                        <button onClick={() => handleStatusChange(comment._id, 'Rechazado')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-400/10 transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Rechazar
                        </button>
                      </>
                    )}
                    <button onClick={() => startReply(comment)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brand-muted hover:text-blue-400 hover:bg-blue-400/10 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                      </svg>
                      Responder
                    </button>
                    <button onClick={() => handleDelete(comment._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brand-muted hover:text-red-400 hover:bg-red-400/10 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default AdminComments
