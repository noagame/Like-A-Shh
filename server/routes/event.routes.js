/**
 * Event Routes — /api/events
 * ═══════════════════════════════════════════
 * GET    /              → Todos los usuarios autenticados ven el calendario
 * GET    /:id           → Detalle de un evento
 * POST   /              → Solo admin: crear evento
 * PUT    /:id           → Solo admin: actualizar evento
 * DELETE /:id           → Solo admin: eliminar evento
 */

const express = require('express')
const router = express.Router()
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/event.controller')
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware')

// Todas las rutas de eventos requieren autenticación
router.use(verifyToken)

// Rutas de lectura (cualquier usuario autenticado)
router.get('/', getEvents)
router.get('/:id', getEventById)

// Rutas de escritura (solo administrador)
router.post('/', isAdmin, createEvent)
router.put('/:id', isAdmin, updateEvent)
router.delete('/:id', isAdmin, deleteEvent)

module.exports = router
