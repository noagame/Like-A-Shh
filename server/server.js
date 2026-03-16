/**
 * ═══════════════════════════════════════════════════════════════════
 *  LIKE A SHH — API REST
 *  Server principal con configuraciones de seguridad (ISO 27001)
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Capas de seguridad implementadas:
 *  1. helmet          → Cabeceras HTTP seguras (X-Frame, CSP, HSTS...)
 *  2. cors            → Política restrictiva de origen cruzado
 *  3. express-rate-limit → Prevención de fuerza bruta / DDoS
 *  4. express-mongo-sanitize → Prevención de inyecciones NoSQL
 *  5. xss-clean       → Prevención de ataques XSS
 *  6. JSON body limit → Prevención de payloads excesivos
 */

require('dotenv').config()

const express = require('express')
const path = require('path')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const connectDB = require('./config/db')

// ─── Importar rutas ──────────────────────────────────────────────
const authRoutes = require('./routes/auth.routes')
const eventRoutes = require('./routes/event.routes')
const commentRoutes = require('./routes/comment.routes')
const courseRoutes = require('./routes/course.routes')
const settingsRoutes = require('./routes/settings.routes')
const galleryRoutes = require('./routes/gallery.routes')
const ratingRoutes = require('./routes/rating.routes')

// ─── Inicializar Express ─────────────────────────────────────────
const app = express()

// ═════════════════════════════════════════════════════════════════
//  CAPA 1 — Cabeceras HTTP seguras (ISO 27001 — A.14.1)
// ═════════════════════════════════════════════════════════════════
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

// ═════════════════════════════════════════════════════════════════
//  CAPA 2 — CORS restrictivo (ISO 27001 — A.13.1)
// ═════════════════════════════════════════════════════════════════
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // Preflight cache: 24h
}
app.use(cors(corsOptions))

// ═════════════════════════════════════════════════════════════════
//  CAPA 3 — Rate Limiting (ISO 27001 — A.14.1.2, prevención DDoS)
// ═════════════════════════════════════════════════════════════════

// Limiter global: 100 requests por ventana de 15 minutos
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP. Intenta de nuevo más tarde.',
  },
})
app.use(globalLimiter)

// Limiter estricto para auth: 15 intentos por ventana de 15 minutos
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación. Intenta en 15 minutos.',
  },
})

// ═════════════════════════════════════════════════════════════════
//  CAPA 4 — Body parser con límite de payload
// ═════════════════════════════════════════════════════════════════
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

// ═════════════════════════════════════════════════════════════════
//  CAPA 5 — Sanitización de datos (prevención NoSQL injection + XSS)
// ═════════════════════════════════════════════════════════════════
app.use(mongoSanitize())  // Remueve operadores $ de queries
app.use(xss())            // Escapa HTML malicioso de inputs

// ═════════════════════════════════════════════════════════════════
//  ARCHIVOS ESTÁTICOS (uploads)
// ═════════════════════════════════════════════════════════════════
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')))

// ═════════════════════════════════════════════════════════════════
//  RUTAS
// ═════════════════════════════════════════════════════════════════

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'LIKE A SHH API — Running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// Auth (con rate-limit estricto)
app.use('/api/auth', authLimiter, authRoutes)

// Cursos
app.use('/api/courses', courseRoutes)

// Eventos / Calendario
app.use('/api/events', eventRoutes)

// Comentarios / Feedback
app.use('/api/comments', commentRoutes)

// Settings (aboutUs, instructor, socials)
app.use('/api/settings', settingsRoutes)

// Galerías
app.use('/api/galleries', galleryRoutes)

// Calificaciones / Reseñas
app.use('/api/ratings', ratingRoutes)

// ═════════════════════════════════════════════════════════════════
//  MANEJO GLOBAL DE ERRORES (ISO 25010 — Fiabilidad)
// ═════════════════════════════════════════════════════════════════

// 404 — Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  })
})

// Error handler global
app.use((err, req, res, next) => {
  console.error('═══ ERROR ═══')
  console.error(err.stack)

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'El archivo excede el tamaño máximo de 5MB.',
    })
  }

  // No exponer detalles del error en producción
  const isDev = process.env.NODE_ENV === 'development'

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(isDev && { stack: err.stack }),
  })
})

// ═════════════════════════════════════════════════════════════════
//  INICIAR SERVIDOR
// ═════════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`\n═══════════════════════════════════════════`)
      console.log(`  LIKE A SHH API`)
      console.log(`  Puerto:    ${PORT}`)
      console.log(`  Entorno:   ${process.env.NODE_ENV}`)
      console.log(`  MongoDB:   Conectado`)
      console.log(`  Seguridad: helmet ✓ cors ✓ rate-limit ✓`)
      console.log(`             sanitize ✓ xss ✓`)
      console.log(`═══════════════════════════════════════════\n`)
    })
  } catch (error) {
    console.error('Error al iniciar el servidor:', error.message)
    process.exit(1)
  }
}

startServer()
