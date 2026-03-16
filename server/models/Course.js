/**
 * Course Model — Mongoose Schema
 * ═══════════════════════════════════════════
 * Modelo para el catálogo de cursos.
 * Incluye icon, duration y version para sistema de reseñas.
 */

const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del curso es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    level: {
      type: String,
      enum: ['Inicial', 'Intermedio', 'Experto', 'Todos los niveles'],
      default: 'Inicial',
    },
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      maxlength: [1000, 'La descripción no puede exceder 1000 caracteres'],
    },
    link: {
      type: String,
      trim: true,
      default: 'https://hotmart.com/es/marketplace',
    },
    access: {
      type: String,
      enum: ['30 días', '45 días', '60 días'],
      default: '30 días',
    },
    certificate: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      trim: true,
      default: '🔥',
    },
    duration: {
      type: String,
      trim: true,
      default: '8 semanas',
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    active: {
      type: Boolean,
      default: true,
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

const Course = mongoose.model('Course', courseSchema)

module.exports = Course
