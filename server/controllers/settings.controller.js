/**
 * Settings Controller — GET/PUT for site settings (singleton)
 * ═══════════════════════════════════════════════════════════
 * Public:  GET settings (for landing page)
 * Admin:   PUT settings (update any section)
 */

const Settings = require('../models/Settings')

/**
 * GET /api/settings
 * Public — Returns site settings for the landing page.
 */
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getInstance()
    res.json({ success: true, data: settings })
  } catch (error) {
    console.error('Error al obtener settings:', error)
    res.status(500).json({ success: false, message: 'Error interno.' })
  }
}

/**
 * PUT /api/settings
 * Admin — Update site settings (partial update).
 * Body can include any combination of: email, aboutUs, instructor, socials
 */
const updateSettings = async (req, res) => {
  try {
    const settings = await Settings.getInstance()
    const { email, aboutUs, instructor, socials } = req.body

    if (email !== undefined) settings.email = email
    if (aboutUs !== undefined) {
      if (aboutUs.title !== undefined) settings.aboutUs.title = aboutUs.title
      if (aboutUs.content !== undefined) settings.aboutUs.content = aboutUs.content
    }
    if (instructor !== undefined) {
      if (instructor.name !== undefined) settings.instructor.name = instructor.name
      if (instructor.subtitle !== undefined) settings.instructor.subtitle = instructor.subtitle
      if (instructor.bio !== undefined) settings.instructor.bio = instructor.bio
      if (instructor.bio2 !== undefined) settings.instructor.bio2 = instructor.bio2
      if (instructor.quote !== undefined) settings.instructor.quote = instructor.quote
      if (instructor.stats !== undefined) settings.instructor.stats = instructor.stats
    }
    if (socials !== undefined) settings.socials = socials

    await settings.save()

    res.json({
      success: true,
      message: 'Configuración actualizada.',
      data: settings,
    })
  } catch (error) {
    console.error('Error al actualizar settings:', error)
    res.status(500).json({ success: false, message: 'Error interno.' })
  }
}

module.exports = { getSettings, updateSettings }
