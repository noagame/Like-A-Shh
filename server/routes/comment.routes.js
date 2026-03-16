/**
 * Comment Routes — /api/comments
 * ═══════════════════════════════════════════
 * GET    /approved          → Público: comentarios aprobados (para landing)
 * POST   /                  → Usuario autenticado: enviar comentario
 * GET    /                  → Solo admin: listar todos
 * PATCH  /:id/status        → Solo admin: aprobar/rechazar
 * DELETE /:id               → Solo admin: eliminar
 */

const express = require('express')
const router = express.Router()
const {
  createComment,
  getAllComments,
  getApprovedComments,
  updateCommentStatus,
  deleteComment,
} = require('../controllers/comment.controller')
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware')

// Ruta pública — comentarios aprobados para la landing page
router.get('/approved', getApprovedComments)

// Rutas protegidas — requieren autenticación
router.post('/', verifyToken, createComment)

// Rutas de admin
router.get('/', verifyToken, isAdmin, getAllComments)
router.patch('/:id/status', verifyToken, isAdmin, updateCommentStatus)
router.delete('/:id', verifyToken, isAdmin, deleteComment)

module.exports = router
