/**
 * Auth Routes — /api/auth
 * ═══════════════════════════════════════════
 * POST /register  → Registro de usuario
 * POST /login     → Inicio de sesión
 * GET  /me        → Perfil del usuario autenticado (protegido)
 */

const express = require('express')
const router = express.Router()
const { register, login, getMe } = require('../controllers/auth.controller')
const { verifyToken } = require('../middlewares/auth.middleware')

router.post('/register', register)
router.post('/login', login)
router.get('/me', verifyToken, getMe)

module.exports = router
