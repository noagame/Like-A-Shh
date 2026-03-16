import { useState } from 'react'

/**
 * AdminComments — CRUD manager for student comments and feedback.
 * Interactive table with Approve, Edit, Delete, and Reply actions.
 */

const initialComments = [
  {
    id: 1,
    author: 'Valentina R.',
    text: 'El método de Maxi es increíble. En 3 meses logré figuras que pensé imposibles.',
    date: '2025-01-15',
    status: 'approved',
    reply: '',
  },
  {
    id: 2,
    author: 'Camila S.',
    text: 'Nunca había hecho Pole Dance y tenía miedo. Maximiliano crea un ambiente seguro.',
    date: '2025-02-03',
    status: 'pending',
    reply: '',
  },
  {
    id: 3,
    author: 'Luciana M.',
    text: 'La calidad del curso online es impresionante. Se siente como una clase privada.',
    date: '2025-02-20',
    status: 'approved',
    reply: '¡Gracias Luciana! Nos encanta saber eso.',
  },
  {
    id: 4,
    author: 'Diego F.',
    text: 'Excelente progresión de ejercicios. Lo recomiendo para todos los niveles.',
    date: '2025-03-01',
    status: 'pending',
    reply: '',
  },
]

const statusConfig = {
  approved: { label: 'Aprobado', bg: 'bg-green-400/10', text: 'text-green-400', border: 'border-green-400/20' },
  pending: { label: 'Pendiente', bg: 'bg-yellow-400/10', text: 'text-yellow-400', border: 'border-yellow-400/20' },
  rejected: { label: 'Rechazado', bg: 'bg-red-400/10', text: 'text-red-400', border: 'border-red-400/20' },
}

const AdminComments = () => {
  const [comments, setComments] = useState(initialComments)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [replyingId, setReplyingId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [filter, setFilter] = useState('all')

  const handleApprove = (id) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'approved' } : c))
    )
  }

  const handleReject = (id) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'rejected' } : c))
    )
  }

  const handleDelete = (id) => {
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  const startEdit = (comment) => {
    setEditingId(comment.id)
    setEditText(comment.text)
    setReplyingId(null)
  }

  const saveEdit = (id) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, text: editText } : c))
    )
    setEditingId(null)
    setEditText('')
  }

  const startReply = (comment) => {
    setReplyingId(comment.id)
    setReplyText(comment.reply || '')
    setEditingId(null)
  }

  const saveReply = (id) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, reply: replyText } : c))
    )
    setReplyingId(null)
    setReplyText('')
  }

  const filtered = filter === 'all' ? comments : comments.filter((c) => c.status === filter)

  const counts = {
    all: comments.length,
    pending: comments.filter((c) => c.status === 'pending').length,
    approved: comments.filter((c) => c.status === 'approved').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl text-white">Comentarios</h1>
        <p className="text-brand-muted text-sm mt-1">Gestiona el feedback de los alumnos</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: `Todos (${counts.all})` },
          { key: 'pending', label: `Pendientes (${counts.pending})` },
          { key: 'approved', label: `Aprobados (${counts.approved})` },
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
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-brand-carbon border border-brand-gray/20 px-6 py-12 text-center text-brand-muted text-sm">
            No hay comentarios en esta categoría.
          </div>
        ) : (
          filtered.map((comment) => {
            const status = statusConfig[comment.status]
            return (
              <div
                key={comment.id}
                className="rounded-2xl bg-brand-carbon border border-brand-gray/20 p-5 hover:border-brand-gray/30 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-dark border border-brand-gray/30 flex items-center justify-center">
                      <span className="text-brand-gold text-xs font-bold">
                        {comment.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <span className="font-heading font-semibold text-white text-sm">
                        {comment.author}
                      </span>
                      <span className="text-brand-muted text-xs ml-2">{comment.date}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.text} ${status.border} uppercase tracking-wider`}>
                    {status.label}
                  </span>
                </div>

                {/* Comment text (or edit mode) */}
                {editingId === comment.id ? (
                  <div className="mb-3">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-dark border border-brand-gold/30 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold/20 transition-all resize-none"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => saveEdit(comment.id)}
                        className="px-4 py-1.5 rounded-lg btn-shimmer text-brand-black text-xs font-bold"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-1.5 rounded-lg border border-brand-gray/30 text-brand-muted text-xs hover:text-white transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-brand-muted text-sm leading-relaxed mb-3">
                    "{comment.text}"
                  </p>
                )}

                {/* Reply display */}
                {comment.reply && replyingId !== comment.id && (
                  <div className="mb-3 ml-6 pl-4 border-l-2 border-brand-gold/20">
                    <p className="text-xs text-brand-muted/70">
                      <span className="text-brand-gold font-medium">Tu respuesta: </span>
                      {comment.reply}
                    </p>
                  </div>
                )}

                {/* Reply form */}
                {replyingId === comment.id && (
                  <div className="mb-3 ml-6">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={2}
                      placeholder="Escribe tu respuesta..."
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-dark border border-brand-gold/30 text-white text-sm placeholder:text-brand-muted/50 focus:outline-none focus:ring-1 focus:ring-brand-gold/20 transition-all resize-none"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => saveReply(comment.id)}
                        className="px-4 py-1.5 rounded-lg btn-shimmer text-brand-black text-xs font-bold"
                      >
                        Responder
                      </button>
                      <button
                        onClick={() => setReplyingId(null)}
                        className="px-4 py-1.5 rounded-lg border border-brand-gray/30 text-brand-muted text-xs hover:text-white transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                {editingId !== comment.id && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-gray/10">
                    {comment.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(comment.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-green-400 hover:bg-green-400/10 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Aprobar
                      </button>
                    )}
                    {comment.status === 'pending' && (
                      <button
                        onClick={() => handleReject(comment.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Rechazar
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(comment)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brand-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => startReply(comment)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brand-muted hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                      </svg>
                      Responder
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brand-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default AdminComments
