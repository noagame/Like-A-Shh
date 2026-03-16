/**
 * Gallery Routes — /api/galleries
 * ═══════════════════════════════════════════
 * GET    /               → Public: active galleries
 * GET    /all            → Admin: all galleries
 * GET    /:id            → Public: gallery detail
 * POST   /               → Admin: create gallery (with image upload)
 * PUT    /:id            → Admin: update gallery info
 * DELETE /:id            → Admin: delete gallery
 * POST   /:id/images     → Admin: add images to gallery
 * DELETE /:id/images/:imageId → Admin: remove image
 */

const express = require('express')
const router = express.Router()
const upload = require('../config/multer.config')
const {
  getGalleries,
  getAllGalleries,
  getGalleryById,
  createGallery,
  updateGallery,
  addImages,
  removeImage,
  deleteGallery,
} = require('../controllers/gallery.controller')
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware')

// Public routes
router.get('/', getGalleries)

// Admin routes (must come before /:id to avoid 'all' being treated as an ID)
router.get('/all', verifyToken, isAdmin, getAllGalleries)
router.post('/', verifyToken, isAdmin, upload.array('images', 20), createGallery)
router.get('/:id', getGalleryById)
router.put('/:id', verifyToken, isAdmin, updateGallery)
router.delete('/:id', verifyToken, isAdmin, deleteGallery)
router.post('/:id/images', verifyToken, isAdmin, upload.array('images', 20), addImages)
router.delete('/:id/images/:imageId', verifyToken, isAdmin, removeImage)

module.exports = router
