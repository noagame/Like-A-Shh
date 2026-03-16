/**
 * Auth Controller — Registro y Login
 * ═══════════════════════════════════════════
 * ISO 27001: Hashing con bcrypt, JWT con expiración,
 *            tokens temporales de confirmación de email.
 * ISO 25010: Respuestas consistentes, validación exhaustiva.
 */

const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../models/User')

/**
 * Genera un JWT con el id y rol del usuario.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

/**
 * POST /api/auth/register
 *
 * Body: { email, password, acceptedTerms }
 * Response: { success, message, data: { user, token, emailConfirmToken } }
 */
const register = async (req, res) => {
  try {
    const { email, password, acceptedTerms } = req.body

    // 1. Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son obligatorios.',
      })
    }

    if (!acceptedTerms) {
      return res.status(400).json({
        success: false,
        message: 'Debes aceptar los términos y condiciones.',
      })
    }

    // 2. Verificar si el email ya está registrado
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Este email ya está registrado.',
      })
    }

    // 3. Generar token temporal de confirmación de email (simulado)
    const emailConfirmToken = crypto.randomBytes(32).toString('hex')

    // 4. Crear usuario (la contraseña se hashea en el pre-save hook)
    const user = await User.create({
      email,
      password,
      acceptedTerms,
      emailConfirmToken,
    })

    // 5. Generar JWT
    const token = generateToken(user)

    // 6. Responder
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente. Revisa tu email para confirmar la cuenta.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          emailConfirmed: user.emailConfirmed,
        },
        token,
        // En producción esto se envía por email, no en la respuesta
        emailConfirmToken: process.env.NODE_ENV === 'development' ? emailConfirmToken : undefined,
      },
    })
  } catch (error) {
    // Errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message)
      return res.status(400).json({
        success: false,
        message: messages.join('. '),
      })
    }

    console.error('Error en registro:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno al registrar el usuario.',
    })
  }
}

/**
 * POST /api/auth/login
 *
 * Body: { email, password }
 * Response: { success, message, data: { user, token } }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // 1. Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son obligatorios.',
      })
    }

    // 2. Buscar usuario (incluye contraseña para comparación)
    const user = await User.findByCredentials(email.toLowerCase())

    if (!user) {
      // Mensaje genérico para no revelar si el email existe
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas.',
      })
    }

    // 3. Comparar contraseña
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas.',
      })
    }

    // 4. Generar JWT
    const token = generateToken(user)

    // 5. Responder
    res.json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          emailConfirmed: user.emailConfirmed,
        },
        token,
      },
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno al iniciar sesión.',
    })
  }
}

/**
 * GET /api/auth/me
 *
 * Protegido por verifyToken.
 * Devuelve el usuario autenticado.
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.',
      })
    }

    res.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    console.error('Error en getMe:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno.',
    })
  }
}

module.exports = { register, login, getMe }
