/**
 * Gallery Model — Mongoose Schema
 * ═══════════════════════════════════════════
 * Modelo para galerías de fotos.
 * Cada galería contiene un array de imágenes con url y label.
 */

const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'La URL de la imagen es obligatoria'],
    trim: true,
  },
  label: {
    type: String,
    trim: true,
    default: '',
  },
})

const gallerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la galería es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
      default: '',
    },
    images: [imageSchema],
    active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

const Gallery = mongoose.model('Gallery', gallerySchema)

module.exports = Gallery
