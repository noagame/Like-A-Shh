/**
 * Multer Configuration — File upload handling
 * ═══════════════════════════════════════════
 * Storage: local disk (server/public/uploads/gallery/)
 * Filter: images only (jpeg, png, webp, gif)
 * Limit: 5MB per file
 */

const multer = require('multer')
const path = require('path')

// ── Storage config ───────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'uploads', 'gallery'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `gallery-${uniqueSuffix}${ext}`)
  },
})

// ── File filter — only images ────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten archivos de imagen (jpeg, png, webp, gif).'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

module.exports = upload
