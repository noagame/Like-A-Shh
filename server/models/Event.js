/**
 * Event Model — Mongoose Schema
 * ═══════════════════════════════════════════
 * Modelo para el Calendario de Clases.
 * Tipos: Clase, Competencia, Workshop
 */

const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título del evento es obligatorio'],
      trim: true,
      maxlength: [100, 'El título no puede exceder 100 caracteres'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
      default: '',
    },

    date: {
      type: Date,
      required: [true, 'La fecha del evento es obligatoria'],
    },

    time: {
      type: String,
      required: [true, 'La hora del evento es obligatoria'],
      trim: true,
    },

    location: {
      type: String,
      trim: true,
      default: 'Online',
    },

    type: {
      type: String,
      enum: {
        values: ['Clase', 'Competencia', 'Workshop'],
        message: 'El tipo debe ser: Clase, Competencia o Workshop',
      },
      required: [true, 'El tipo de evento es obligatorio'],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

// Índice para consultas por fecha (rendimiento)
eventSchema.index({ date: 1 })

const Event = mongoose.model('Event', eventSchema)

module.exports = Event
