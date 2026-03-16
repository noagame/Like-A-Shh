/**
 * Rating Routes — /api/ratings
 * ═══════════════════════════════════════════
 * POST   /               → Authenticated: create rating
 * GET    /course/:courseId → Public: ratings for a course
 * GET    /me             → Authenticated: my ratings
 */

const express = require('express')
const router = express.Router()
const { createRating, getRatingsByCourse, getMyRatings } = require('../controllers/rating.controller')
const { verifyToken } = require('../middlewares/auth.middleware')

// Public
router.get('/course/:courseId', getRatingsByCourse)

// Authenticated
router.post('/', verifyToken, createRating)
router.get('/me', verifyToken, getMyRatings)

module.exports = router
