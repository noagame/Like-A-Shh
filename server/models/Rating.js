/**
 * Rating Model — Mongoose Schema
 * ═══════════════════════════════════════════
 * Sistema de calificaciones de cursos.
 * Un usuario puede calificar una sola vez por curso + versión.
 * Si el curso recibe una actualización (version++), puede calificar de nuevo.
 */

const mongoose = require('mongoose')

const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es obligatorio'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'El curso es obligatorio'],
    },
    stars: {
      type: Number,
      required: [true, 'La calificación es obligatoria'],
      min: [1, 'La calificación mínima es 1'],
      max: [5, 'La calificación máxima es 5'],
    },
    comment: {
      type: String,
      required: [true, 'El comentario es obligatorio'],
      trim: true,
      minlength: [10, 'El comentario debe tener al menos 10 caracteres'],
      maxlength: [500, 'El comentario no puede exceder 500 caracteres'],
    },
    courseVersion: {
      type: Number,
      required: true,
      min: 1,
    },
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

// Índice compuesto: un usuario solo puede calificar una vez por curso + versión
ratingSchema.index({ user: 1, course: 1, courseVersion: 1 }, { unique: true })

// Índice para consultas por curso
ratingSchema.index({ course: 1, createdAt: -1 })

const Rating = mongoose.model('Rating', ratingSchema)

module.exports = Rating
