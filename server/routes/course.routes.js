/**
 * Course Routes
 * GET    /api/courses       → Public (landing page)
 * GET    /api/courses/:id   → Public
 * POST   /api/courses       → Admin only
 * PUT    /api/courses/:id   → Admin only
 * DELETE /api/courses/:id   → Admin only
 */

const router = require('express').Router()
const { getCourses, getCourseById, createCourse, updateCourse, deleteCourse } = require('../controllers/course.controller')
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware')

router.get('/', getCourses)
router.get('/:id', getCourseById)
router.post('/', verifyToken, isAdmin, createCourse)
router.put('/:id', verifyToken, isAdmin, updateCourse)
router.delete('/:id', verifyToken, isAdmin, deleteCourse)

module.exports = router
