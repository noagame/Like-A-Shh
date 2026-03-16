/**
 * Settings Model — Singleton document for site-wide configuration.
 * ═══════════════════════════════════════════════════════════════
 * Stores: contact email, aboutUs, instructor info, social networks.
 * Only ONE document exists — use Settings.getInstance() to get/create it.
 */

const mongoose = require('mongoose')

const socialSchema = new mongoose.Schema({
  network: {
    type: String,
    enum: ['Instagram', 'Facebook', 'Telegram', 'X', 'WhatsApp'],
    required: true,
  },
  tag: { type: String, required: true, trim: true },
  url: { type: String, trim: true, default: '' },
})

const settingsSchema = new mongoose.Schema(
  {
    // ── Contact ──
    email: {
      type: String,
      default: 'academialikeashh@gmail.com',
      trim: true,
    },

    // ── About Us (Quiénes Somos) ──
    aboutUs: {
      title: { type: String, default: 'Nuestra Filosofía', trim: true },
      content: {
        type: String,
        default:
          'LIKE A SHH es más que una academia de Pole Dance. Es un espacio donde la fuerza, la elegancia y la confianza se fusionan. Nuestro objetivo es empoderar a cada alumno a través del movimiento, sin importar su nivel de experiencia.',
        trim: true,
      },
    },

    // ── Instructor ──
    instructor: {
      name: { type: String, default: 'Maximiliano Velásquez', trim: true },
      subtitle: { type: String, default: 'Instructor de Pole Dance', trim: true },
      bio: {
        type: String,
        default:
          'Maximiliano Velásquez es más que un instructor de Pole Dance: es un artista del movimiento que ha dedicado más de una década a perfeccionar la fusión entre la fuerza atlética y la expresión artística.',
        trim: true,
      },
      bio2: {
        type: String,
        default:
          'Su método, desarrollado a través de años de competencia a nivel nacional e internacional, combina técnica progresiva, entrenamiento funcional y un enfoque profundo en la conexión mente-cuerpo.',
        trim: true,
      },
      quote: {
        type: String,
        default:
          'El Pole Dance no es solo fuerza ni solo danza; es el arte de confiar en tu cuerpo y desafiar la gravedad.',
        trim: true,
      },
      stats: [
        {
          value: { type: String, required: true },
          label: { type: String, required: true },
        },
      ],
    },

    // ── Social Networks ──
    socials: [socialSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v
        return ret
      },
    },
  }
)

/**
 * Static: Get or create the singleton settings document.
 */
settingsSchema.statics.getInstance = async function () {
  let settings = await this.findOne()
  if (!settings) {
    settings = await this.create({
      instructor: {
        stats: [
          { value: '10+', label: 'Años de experiencia' },
          { value: '500+', label: 'Alumnos formados' },
          { value: '15+', label: 'Competencias' },
        ],
      },
      socials: [
        { network: 'Instagram', tag: '@_likeashh_', url: 'https://www.instagram.com/_likeashh_/' },
        { network: 'Telegram', tag: 'Grupo LIKE A SHH', url: 'https://t.me/+2cRTAMSxppYzOWZh' },
      ],
    })
  }
  return settings
}

const Settings = mongoose.model('Settings', settingsSchema)

module.exports = Settings
