/**
 * Event Controller — CRUD para Calendario de Clases
 * ═══════════════════════════════════════════════════
 * Student:  GET (ver calendario)
 * Admin:    CRUD completo (crear, leer, actualizar, eliminar)
 */

const Event = require('../models/Event')

/**
 * GET /api/events
 * Protegido por verifyToken.
 * Todos los usuarios autenticados pueden ver el calendario.
 * Soporta filtro por tipo: ?type=Clase
 */
const getEvents = async (req, res) => {
  try {
    const filter = {}

    // Filtro opcional por tipo
    if (req.query.type) {
      filter.type = req.query.type
    }

    // Filtro opcional por rango de fechas
    if (req.query.from || req.query.to) {
      filter.date = {}
      if (req.query.from) filter.date.$gte = new Date(req.query.from)
      if (req.query.to) filter.date.$lte = new Date(req.query.to)
    }

    const events = await Event.find(filter)
      .sort({ date: 1 })
      .populate('createdBy', 'email')

    res.json({
      success: true,
      count: events.length,
      data: events,
    })
  } catch (error) {
    console.error('Error al obtener eventos:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno al obtener los eventos.',
    })
  }
}

/**
 * GET /api/events/:id
 * Protegido por verifyToken.
 */
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'email')

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado.',
      })
    }

    res.json({ success: true, data: event })
  } catch (error) {
    console.error('Error al obtener evento:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno.',
    })
  }
}

/**
 * POST /api/events
 * Protegido por verifyToken + isAdmin.
 */
const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, type } = req.body

    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      type,
      createdBy: req.user.id,
    })

    res.status(201).json({
      success: true,
      message: 'Evento creado exitosamente.',
      data: event,
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message)
      return res.status(400).json({
        success: false,
        message: messages.join('. '),
      })
    }

    console.error('Error al crear evento:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno al crear el evento.',
    })
  }
}

/**
 * PUT /api/events/:id
 * Protegido por verifyToken + isAdmin.
 */
const updateEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, type } = req.body

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { title, description, date, time, location, type },
      { new: true, runValidators: true }
    )

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado.',
      })
    }

    res.json({
      success: true,
      message: 'Evento actualizado.',
      data: event,
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message)
      return res.status(400).json({
        success: false,
        message: messages.join('. '),
      })
    }

    console.error('Error al actualizar evento:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno al actualizar el evento.',
    })
  }
}

/**
 * DELETE /api/events/:id
 * Protegido por verifyToken + isAdmin.
 */
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id)

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado.',
      })
    }

    res.json({
      success: true,
      message: 'Evento eliminado exitosamente.',
    })
  } catch (error) {
    console.error('Error al eliminar evento:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno al eliminar el evento.',
    })
  }
}

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent }
