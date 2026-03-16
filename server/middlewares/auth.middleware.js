/**
 * Middlewares de Autenticación y Autorización (RBAC)
 * ═══════════════════════════════════════════════════
 *  verifyToken  → Valida que el request tenga un JWT válido
 *  isAdmin      → Verifica que el usuario autenticado tenga rol 'admin'
 *
 * ISO 27001 — A.9.4: Control de acceso basado en roles
 */

const jwt = require('jsonwebtoken')
const User = require('../models/User')

/**
 * verifyToken — Middleware de autenticación.
 *
 * Extrae el JWT del header Authorization (formato: "Bearer <token>"),
 * lo verifica, y adjunta el usuario al objeto request.
 */
const verifyToken = async (req, res, next) => {
  try {
    // 1. Extraer token del header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. No se proporcionó un token de autenticación.',
      })
    }

    const token = authHeader.split(' ')[1]

    // 2. Verificar token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'El token ha expirado. Por favor, inicia sesión de nuevo.',
        })
      }
      return res.status(401).json({
        success: false,
        message: 'Token inválido.',
      })
    }

    // 3. Verificar que el usuario aún exista y esté activo
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'El usuario asociado a este token ya no existe.',
      })
    }

    // 4. Adjuntar usuario al request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
    }

    next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error interno de autenticación.',
    })
  }
}

/**
 * isAdmin — Middleware de autorización.
 *
 * DEBE usarse DESPUÉS de verifyToken.
 * Verifica que req.user.role === 'admin'.
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren privilegios de administrador.',
    })
  }
  next()
}

module.exports = { verifyToken, isAdmin }
