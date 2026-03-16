/**
 * Comment Controller — CRUD para Feedback de alumnos
 * ═══════════════════════════════════════════════════
 * Student:  POST (enviar comentario — estado Pendiente por defecto)
 * Admin:    GET all, PATCH status (Aprobar/Rechazar), DELETE
 */

const Comment = require('../models/Comment')

/**
 * POST /api/comments
 * Protegido por verifyToken.
 * Body: { course, text }
 */
const createComment = async (req, res) => {
  try {
    const { course, text } = req.body

    const comment = await Comment.create({
      user: req.user.id,
      course,
      text,
      status: 'Pendiente', // Siempre comienza como Pendiente
    })

    res.status(201).json({
      success: true,
      message: 'Comentario enviado. Será revisado por el equipo.',
      data: comment,
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message)
      return res.status(400).json({
        success: false,
        message: messages.join('. '),
      })
    }

    console.error('Error al crear comentario:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno al enviar el comentario.',
    })
  }
}

/**
 * GET /api/comments
 * Protegido por verifyToken + isAdmin.
 * Soporta filtros: ?status=Pendiente
 */
const getAllComments = async (req, res) => {
  try {
    const filter = {}

    if (req.query.status) {
      filter.status = req.query.status
    }

    const comments = await Comment.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'email')

    res.json({
      success: true,
      count: comments.length,
      data: comments,
    })
  } catch (error) {
    console.error('Error al obtener comentarios:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno al obtener los comentarios.',
    })
  }
}

/**
 * GET /api/comments/approved
 * Público (o protegido) — Devuelve solo los comentarios aprobados
 * para mostrar en la landing page.
 */
const getApprovedComments = async (req, res) => {
  try {
    const comments = await Comment.find({ status: 'Aprobado' })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('user', 'email')

    res.json({
      success: true,
      count: comments.length,
      data: comments,
    })
  } catch (error) {
    console.error('Error al obtener comentarios aprobados:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno.',
    })
  }
}

/**
 * PATCH /api/comments/:id/status
 * Protegido por verifyToken + isAdmin.
 * Body: { status: 'Aprobado' | 'Rechazado', adminReply? }
 */
const updateCommentStatus = async (req, res) => {
  try {
    const { status, adminReply } = req.body

    if (!['Aprobado', 'Rechazado'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'El estado debe ser "Aprobado" o "Rechazado".',
      })
    }

    const updateData = { status }
    if (adminReply !== undefined) {
      updateData.adminReply = adminReply
    }

    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'email')

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado.',
      })
    }

    res.json({
      success: true,
      message: `Comentario ${status.toLowerCase()} exitosamente.`,
      data: comment,
    })
  } catch (error) {
    console.error('Error al actualizar comentario:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno al actualizar el comentario.',
    })
  }
}

/**
 * DELETE /api/comments/:id
 * Protegido por verifyToken + isAdmin.
 */
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id)

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado.',
      })
    }

    res.json({
      success: true,
      message: 'Comentario eliminado exitosamente.',
    })
  } catch (error) {
    console.error('Error al eliminar comentario:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno al eliminar el comentario.',
    })
  }
}

module.exports = {
  createComment,
  getAllComments,
  getApprovedComments,
  updateCommentStatus,
  deleteComment,
}
