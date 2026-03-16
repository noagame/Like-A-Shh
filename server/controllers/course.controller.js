/**
 * Course Controller — CRUD for course catalog
 * ═══════════════════════════════════════════
 * Public:  GET courses (for landing page)
 * Admin:   CRUD (create, update, delete)
 */

const Course = require('../models/Course')

const getCourses = async (req, res) => {
  try {
    const filter = {}
    if (req.query.active !== undefined) filter.active = req.query.active === 'true'
    const courses = await Course.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, count: courses.length, data: courses })
  } catch (error) {
    console.error('Error al obtener cursos:', error)
    res.status(500).json({ success: false, message: 'Error interno.' })
  }
}

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) return res.status(404).json({ success: false, message: 'Curso no encontrado.' })
    res.json({ success: true, data: course })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno.' })
  }
}

const createCourse = async (req, res) => {
  try {
    const { name, level, description, link, access, certificate } = req.body
    const course = await Course.create({ name, level, description, link, access, certificate })
    res.status(201).json({ success: true, message: 'Curso creado.', data: course })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message)
      return res.status(400).json({ success: false, message: messages.join('. ') })
    }
    res.status(500).json({ success: false, message: 'Error interno.' })
  }
}

const updateCourse = async (req, res) => {
  try {
    const { name, level, description, link, access, certificate } = req.body
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { name, level, description, link, access, certificate },
      { new: true, runValidators: true }
    )
    if (!course) return res.status(404).json({ success: false, message: 'Curso no encontrado.' })
    res.json({ success: true, message: 'Curso actualizado.', data: course })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message)
      return res.status(400).json({ success: false, message: messages.join('. ') })
    }
    res.status(500).json({ success: false, message: 'Error interno.' })
  }
}

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id)
    if (!course) return res.status(404).json({ success: false, message: 'Curso no encontrado.' })
    res.json({ success: true, message: 'Curso eliminado.' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno.' })
  }
}

module.exports = { getCourses, getCourseById, createCourse, updateCourse, deleteCourse }
