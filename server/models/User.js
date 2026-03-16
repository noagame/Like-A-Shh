/**
 * User Model — Mongoose Schema
 * ═══════════════════════════════════════════
 * ISO 27001: Contraseñas hasheadas con bcrypt (salt rounds: 12)
 * ISO 25010: Validaciones a nivel de modelo
 *
 * Roles: 'user' (alumno) | 'admin' (instructor/administrador)
 */

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [50, 'El nombre no puede exceder 50 caracteres'],
    },

    lastName: {
      type: String,
      required: [true, 'El apellido es obligatorio'],
      trim: true,
      maxlength: [50, 'El apellido no puede exceder 50 caracteres'],
    },

    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: 'El formato del email no es válido',
      },
    },

    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
      select: false, // No se devuelve por defecto en queries
    },

    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: 'El rol debe ser "user" o "admin"',
      },
      default: 'user',
    },

    acceptedTerms: {
      type: Boolean,
      required: [true, 'Debes aceptar los términos y condiciones'],
      validate: {
        validator: (v) => v === true,
        message: 'Debes aceptar los términos y condiciones para registrarte',
      },
    },

    // Cursos vinculados (simulación Hotmart)
    purchasedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],

    // Simulación de confirmación de email
    emailConfirmToken: {
      type: String,
      default: null,
    },

    emailConfirmed: {
      type: Boolean,
      default: false,
    },

    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      // Eliminar campos sensibles al serializar
      transform(doc, ret) {
        delete ret.password
        delete ret.__v
        delete ret.emailConfirmToken
        return ret
      },
    },
  }
)

// ─── Pre-save hook: Hashear contraseña ───────────────────────────
userSchema.pre('save', async function (next) {
  // Solo hashear si el campo fue modificado
  if (!this.isModified('password')) return next()

  // Salt rounds = 12 (balance entre seguridad y rendimiento)
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// ─── Método de instancia: Comparar contraseñas ──────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// ─── Static: Buscar usuario activo con contraseña ────────────────
userSchema.statics.findByCredentials = async function (email) {
  return this.findOne({ email, active: { $ne: false } }).select('+password')
}

const User = mongoose.model('User', userSchema)

module.exports = User
