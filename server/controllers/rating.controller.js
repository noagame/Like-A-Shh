/**
 * Rating Controller — Reviews/Ratings for courses
 * ═══════════════════════════════════════════════════
 * User:   POST rating, GET my ratings
 * Public: GET ratings by course, GET average
 */

const Rating = require('../models/Rating')
const Course = require('../models/Course')

/**
 * POST /api/ratings
 * Authenticated user — Create a rating for a course.
 * Restriction: 1 rating per user per course per version.
 */
const createRating = async (req, res) => {
  try {
    const { courseId, stars, comment } = req.body

    // 1. Verify course exists
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ success: false, message: 'Curso no encontrado.' })
    }

    // 2. Check if user already rated this course version
    const existingRating = await Rating.findOne({
      user: req.user.id,
      course: courseId,
      courseVersion: course.version,
    })

    if (existingRating) {
      return res.status(409).json({
        success: false,
        message: 'Ya calificaste este curso en su versión actual. Podrás calificar nuevamente cuando el curso reciba una actualización.',
      })
    }

    // 3. Create rating
    const rating = await Rating.create({
      user: req.user.id,
      course: courseId,
      stars,
      comment,
      courseVersion: course.version,
    })

    // Populate user data for the response
    await rating.populate('user', 'firstName lastName email')
    await rating.populate('course', 'name')

    res.status(201).json({
      success: true,
      message: 'Calificación enviada exitosamente.',
      data: rating,
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message)
      return res.status(400).json({ success: false, message: messages.join('. ') })
    }

    // Duplicate key error (compound index)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Ya calificaste este curso en su versión actual.',
      })
    }

    console.error('Error al crear calificación:', error)
    res.status(500).json({ success: false, message: 'Error interno.' })
  }
}

/**
 * GET /api/ratings/course/:courseId
 * Public — Get all ratings for a specific course.
 */
const getRatingsByCourse = async (req, res) => {
  try {
    const ratings = await Rating.find({ course: req.params.courseId })
      .sort({ createdAt: -1 })
      .populate('user', 'firstName lastName')

    // Calculate average
    let average = 0
    if (ratings.length > 0) {
      const sum = ratings.reduce((acc, r) => acc + r.stars, 0)
      average = Math.round((sum / ratings.length) * 10) / 10
    }

    res.json({
      success: true,
      count: ratings.length,
      average,
      data: ratings,
    })
  } catch (error) {
    console.error('Error al obtener calificaciones:', error)
    res.status(500).json({ success: false, message: 'Error interno.' })
  }
}

/**
 * GET /api/ratings/me
 * Authenticated — Get ratings by the authenticated user.
 */
const getMyRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('course', 'name version')

    res.json({ success: true, count: ratings.length, data: ratings })
  } catch (error) {
    console.error('Error al obtener mis calificaciones:', error)
    res.status(500).json({ success: false, message: 'Error interno.' })
  }
}

module.exports = { createRating, getRatingsByCourse, getMyRatings }
