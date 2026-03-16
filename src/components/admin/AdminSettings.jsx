import { useState } from 'react'

/**
 * AdminSettings — Configuration for contact info, "Quiénes Somos", and social media CRUD.
 */

const SOCIAL_OPTIONS = ['Instagram', 'Facebook', 'Telegram', 'X', 'WhatsApp']

const socialIcons = {
  Instagram: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
  ),
  Facebook: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
  ),
  Telegram: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
  ),
  X: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
  ),
  WhatsApp: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
  ),
}

const AdminSettings = () => {
  // ── Contact email ──
  const [email, setEmail] = useState('academialikeashh@gmail.com')
  const [emailSaved, setEmailSaved] = useState(false)

  const saveEmail = () => {
    setEmailSaved(true)
    setTimeout(() => setEmailSaved(false), 2000)
  }

  // ── About Us ──
  const [aboutUs, setAboutUs] = useState({
    title: 'Nuestra Filosofía',
    content:
      'LIKE A SHH es más que una academia de Pole Dance. Es un espacio donde la fuerza, la elegancia y la confianza se fusionan. Nuestro objetivo es empoderar a cada alumno a través del movimiento, sin importar su nivel de experiencia. Creemos que el Pole Dance es un arte que transforma cuerpo y mente.',
  })
  const [editingAbout, setEditingAbout] = useState(false)
  const [aboutSaved, setAboutSaved] = useState(false)

  const saveAbout = () => {
    setEditingAbout(false)
    setAboutSaved(true)
    setTimeout(() => setAboutSaved(false), 2000)
  }

  // ── Social Networks CRUD ──
  const [socials, setSocials] = useState([
    { id: 1, network: 'Instagram', tag: '@_likeashh_', url: 'https://www.instagram.com/_likeashh_/' },
    { id: 2, network: 'Telegram', tag: 'Grupo LIKE A SHH', url: 'https://t.me/+2cRTAMSxppYzOWZh' },
  ])
  const [socialForm, setSocialForm] = useState({ network: 'Instagram', tag: '', url: '' })
  const [showSocialForm, setShowSocialForm] = useState(false)
  const [editingSocialId, setEditingSocialId] = useState(null)

  const handleSocialChange = (e) => {
    setSocialForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const saveSocial = (e) => {
    e.preventDefault()
    if (!socialForm.tag.trim()) return

    if (editingSocialId) {
      setSocials((prev) =>
        prev.map((s) => (s.id === editingSocialId ? { ...socialForm, id: editingSocialId } : s))
      )
      setEditingSocialId(null)
    } else {
      setSocials((prev) => [...prev, { ...socialForm, id: Date.now() }])
    }
    setSocialForm({ network: 'Instagram', tag: '', url: '' })
    setShowSocialForm(false)
  }

  const editSocial = (social) => {
    setSocialForm({ network: social.network, tag: social.tag, url: social.url || '' })
    setEditingSocialId(social.id)
    setShowSocialForm(true)
  }

  const deleteSocial = (id) => {
    setSocials((prev) => prev.filter((s) => s.id !== id))
  }

  const cancelSocial = () => {
    setSocialForm({ network: 'Instagram', tag: '', url: '' })
    setEditingSocialId(null)
    setShowSocialForm(false)
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl text-white">Configuración</h1>
        <p className="text-brand-muted text-sm mt-1">Gestiona la información de contacto y redes sociales</p>
      </div>

      {/* ══ Email ══ */}
      <div className="rounded-2xl bg-brand-carbon border border-brand-gray/20 p-6 shadow-lg">
        <h2 className="font-heading font-semibold text-white text-base mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-brand-gold/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          Correo principal
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-brand-dark border border-brand-gray/30 text-white text-sm focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-all"
          />
          <button
            onClick={saveEmail}
            className="inline-flex items-center justify-center gap-2 btn-shimmer px-5 py-2.5 rounded-xl text-brand-black font-heading font-bold text-sm hover:scale-105 transition-transform"
          >
            {emailSaved ? '✓ Guardado' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* ══ About Us ══ */}
      <div className="rounded-2xl bg-brand-carbon border border-brand-gray/20 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-white text-base flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-gold/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            Quiénes Somos
          </h2>
          {!editingAbout && (
            <button
              onClick={() => setEditingAbout(true)}
              className="p-2 rounded-lg text-brand-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            </button>
          )}
        </div>

        {editingAbout ? (
          <div className="space-y-3">
            <input
              type="text"
              value={aboutUs.title}
              onChange={(e) => setAboutUs((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-dark border border-brand-gray/30 text-white text-sm font-heading font-semibold focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-all"
            />
            <textarea
              value={aboutUs.content}
              onChange={(e) => setAboutUs((p) => ({ ...p, content: e.target.value }))}
              rows={5}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-dark border border-brand-gray/30 text-white text-sm focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-all resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={saveAbout}
                className="inline-flex items-center gap-2 btn-shimmer px-5 py-2 rounded-xl text-brand-black font-heading font-bold text-sm hover:scale-105 transition-transform"
              >
                {aboutSaved ? '✓ Guardado' : 'Guardar'}
              </button>
              <button
                onClick={() => setEditingAbout(false)}
                className="px-5 py-2 rounded-xl border border-brand-gray/30 text-brand-muted text-sm hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-brand-dark/40 border border-brand-gray/10">
            <h3 className="font-heading font-semibold text-brand-gold text-sm mb-2">
              {aboutUs.title}
            </h3>
            <p className="text-brand-muted text-sm leading-relaxed">{aboutUs.content}</p>
          </div>
        )}
      </div>

      {/* ══ Social Networks CRUD ══ */}
      <div className="rounded-2xl bg-brand-carbon border border-brand-gray/20 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-white text-base flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-gold/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-3.06a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.374" />
            </svg>
            Redes Sociales
          </h2>
          {!showSocialForm && (
            <button
              onClick={() => setShowSocialForm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-gold/30 text-brand-gold text-xs font-medium hover:bg-brand-gold/10 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Agregar Red
            </button>
          )}
        </div>

        {/* Social form */}
        {showSocialForm && (
          <form onSubmit={saveSocial} className="mb-4 p-4 rounded-xl bg-brand-dark/40 border border-brand-gray/20 space-y-3 animate-fade-in-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">Red social</label>
                <select
                  name="network"
                  value={socialForm.network}
                  onChange={handleSocialChange}
                  className="w-full px-3 py-2 rounded-lg bg-brand-dark border border-brand-gray/30 text-white text-sm focus:outline-none focus:border-brand-gold/50 transition-all appearance-none"
                >
                  {SOCIAL_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1">Nombre / Tag</label>
                <input
                  type="text"
                  name="tag"
                  value={socialForm.tag}
                  onChange={handleSocialChange}
                  placeholder="Ej: @likeashh"
                  className="w-full px-3 py-2 rounded-lg bg-brand-dark border border-brand-gray/30 text-white text-sm placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-gold/50 transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1">URL (opcional)</label>
              <input
                type="url"
                name="url"
                value={socialForm.url}
                onChange={handleSocialChange}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg bg-brand-dark border border-brand-gray/30 text-white text-sm placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-gold/50 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg btn-shimmer text-brand-black text-xs font-bold"
              >
                {editingSocialId ? 'Actualizar' : 'Agregar'}
              </button>
              <button
                type="button"
                onClick={cancelSocial}
                className="px-4 py-1.5 rounded-lg border border-brand-gray/30 text-brand-muted text-xs hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Social list */}
        <div className="space-y-2">
          {socials.length === 0 ? (
            <p className="text-brand-muted text-sm text-center py-4">No hay redes sociales configuradas.</p>
          ) : (
            socials.map((social) => (
              <div
                key={social.id}
                className="flex items-center justify-between p-3 rounded-xl bg-brand-dark/30 border border-brand-gray/10 hover:border-brand-gray/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-dark border border-brand-gray/20 text-brand-gold">
                    {socialIcons[social.network]}
                  </span>
                  <div>
                    <span className="text-white text-sm font-medium">{social.tag}</span>
                    <span className="text-brand-muted text-xs ml-2">{social.network}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => editSocial(social)}
                    className="p-1.5 rounded-lg text-brand-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteSocial(social.id)}
                    className="p-1.5 rounded-lg text-brand-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
