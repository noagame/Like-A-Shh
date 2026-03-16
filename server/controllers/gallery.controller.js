/**
 * Gallery Controller — CRUD for image galleries
 * ═══════════════════════════════════════════════
 * Public:  GET galleries (for landing page carousel)
 * Admin:   CRUD (create with images, update, delete, add/remove images)
 */

const Gallery = require('../models/Gallery')
const fs = require('fs')
const path = require('path')

/**
 * GET /api/galleries
 * Public — Returns active galleries.
 */
const getGalleries = async (req, res) => {
  try {
    const filter = { active: true }
    const galleries = await Gallery.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, count: galleries.length, data: galleries })
  } catch (error) {
    console.error('Error al obtener galerías:', error)
    res.status(500).json({ success: false, message: 'Error interno.' })
  }
}

/**
 * GET /api/galleries/all
 * Admin — Returns ALL galleries (including inactive).
 */
const getAllGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ createdAt: -1 })
    res.json({ success: true, count: galleries.length, data: galleries })
  } catch (error) {
    console.error('Error al obtener galerías:', error)
    res.status(500).json({ success: false, message: 'Error interno.' })
  }
}

/**
 * GET /api/galleries/:id
 * Public — Gallery detail.
 */
const getGalleryById = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id)
    if (!gallery) return res.status(404).json({ success: false, message: 'Galería no encontrada.' })
    res.json({ success: true, data: gallery })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno.' })
  }
}

/**
 * POST /api/galleries
 * Admin — Create a gallery with uploaded images.
 * Uses multer middleware for file uploads.
 */
const createGallery = async (req, res) => {
  try {
    const { name, description } = req.body

    // Build images array from uploaded files
    const images = (req.files || []).map((file) => ({
      url: `/uploads/gallery/${file.filename}`,
      label: '',
    }))

    const gallery = await Gallery.create({
      name,
      description,
      images,
      createdBy: req.user.id,
    })

    res.status(201).json({ success: true, message: 'Galería creada.', data: gallery })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message)
      return res.status(400).json({ success: false, message: messages.join('. ') })
    }
    console.error('Error al crear galería:', error)
    res.status(500).json({ success: false, message: 'Error interno.' })
  }
}

/**
 * PUT /api/galleries/:id
 * Admin — Update gallery name/description.
 */
const updateGallery = async (req, res) => {
  try {
    const { name, description, active } = req.body
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (active !== undefined) updateData.active = active

    const gallery = await Gallery.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })

    if (!gallery) return res.status(404).json({ success: false, message: 'Galería no encontrada.' })
    res.json({ success: true, message: 'Galería actualizada.', data: gallery })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message)
      return res.status(400).json({ success: false, message: messages.join('. ') })
    }
    res.status(500).json({ success: false, message: 'Error interno.' })
  }
}

/**
 * POST /api/galleries/:id/images
 * Admin — Add images to an existing gallery.
 */
const addImages = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id)
    if (!gallery) return res.status(404).json({ success: false, message: 'Galería no encontrada.' })

    const newImages = (req.files || []).map((file) => ({
      url: `/uploads/gallery/${file.filename}`,
      label: '',
    }))

    gallery.images.push(...newImages)
    await gallery.save()

    res.json({ success: true, message: `${newImages.length} imagen(es) agregada(s).`, data: gallery })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno.' })
  }
}

/**
 * DELETE /api/galleries/:id/images/:imageId
 * Admin — Remove a single image from gallery.
 */
const removeImage = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id)
    if (!gallery) return res.status(404).json({ success: false, message: 'Galería no encontrada.' })

    const image = gallery.images.id(req.params.imageId)
    if (!image) return res.status(404).json({ success: false, message: 'Imagen no encontrada.' })

    // Delete file from disk
    const filePath = path.join(__dirname, '..', 'public', image.url)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

    // Remove from array
    gallery.images.pull(req.params.imageId)
    await gallery.save()

    res.json({ success: true, message: 'Imagen eliminada.', data: gallery })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno.' })
  }
}

/**
 * DELETE /api/galleries/:id
 * Admin — Delete entire gallery and its image files.
 */
const deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id)
    if (!gallery) return res.status(404).json({ success: false, message: 'Galería no encontrada.' })

    // Delete all image files from disk
    gallery.images.forEach((img) => {
      const filePath = path.join(__dirname, '..', 'public', img.url)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    })

    await Gallery.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Galería eliminada.' })
  } catch (error) {
    console.error('Error al eliminar galería:', error)
    res.status(500).json({ success: false, message: 'Error interno.' })
  }
}

module.exports = {
  getGalleries,
  getAllGalleries,
  getGalleryById,
  createGallery,
  updateGallery,
  addImages,
  removeImage,
  deleteGallery,
}
