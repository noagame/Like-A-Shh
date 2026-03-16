/**
 * Comment Model — Mongoose Schema
 * ═══════════════════════════════════════════
 * Modelo para Comentarios / Feedback de alumnos.
 * Estados: Pendiente → Aprobado | Rechazado
 */

const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es obligatorio'],
    },

    course: {
      type: String,
      trim: true,
      required: [true, 'El nombre del curso es obligatorio'],
    },

    text: {
      type: String,
      required: [true, 'El texto del comentario es obligatorio'],
      trim: true,
      minlength: [10, 'El comentario debe tener al menos 10 caracteres'],
      maxlength: [500, 'El comentario no puede exceder 500 caracteres'],
    },

    status: {
      type: String,
      enum: {
        values: ['Pendiente', 'Aprobado', 'Rechazado'],
        message: 'El estado debe ser: Pendiente, Aprobado o Rechazado',
      },
      default: 'Pendiente',
    },

    adminReply: {
      type: String,
      trim: true,
      maxlength: [500, 'La respuesta no puede exceder 500 caracteres'],
      default: '',
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

// Índice compuesto para filtrar por estado y fecha
commentSchema.index({ status: 1, createdAt: -1 })

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment
