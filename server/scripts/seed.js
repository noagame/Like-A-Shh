/**
 * ═══════════════════════════════════════════════════════════════
 *  LIKE A SHH — Script de Inicialización Completa de Base de Datos
 * ═══════════════════════════════════════════════════════════════
 *
 *  Ejecutar:  node scripts/seed.js
 *
 *  Este script:
 *  1. Limpia todas las colecciones existentes
 *  2. Crea un usuario Administrador
 *  3. Crea un usuario Alumno de prueba
 *  4. Crea eventos de ejemplo para el calendario
 *  5. Crea comentarios de ejemplo en distintos estados
 *
 *  MongoDB creará automáticamente:
 *  - La base de datos 'likeashh' (definida en MONGO_URI)
 *  - Las colecciones: users, events, comments
 */

require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')
const Event = require('../models/Event')
const Comment = require('../models/Comment')
const connectDB = require('../config/db')

// ─── Datos Iniciales ─────────────────────────────────────────

const ADMIN_DATA = {
  email: 'admin@likeashh.com',
  password: 'Admin2024!',
  role: 'admin',
  acceptedTerms: true,
  emailConfirmed: true,
}

const STUDENT_DATA = {
  email: 'alumno@likeashh.com',
  password: 'Alumno2024!',
  role: 'user',
  acceptedTerms: true,
  emailConfirmed: true,
}

const EVENTS_DATA = [
  {
    title: 'Pole Exotic — Nivel Inicial',
    description: 'Clase introductoria de Pole Exotic. Aprenderás los movimientos básicos y expresión corporal.',
    date: new Date('2026-04-01T18:00:00'),
    time: '18:00',
    location: 'Estudio Principal — Sala 1',
    type: 'Clase',
  },
  {
    title: 'Pole Sport — Intermedio',
    description: 'Entrenamiento de fuerza y técnica en el tubo. Figuras intermedias y combos.',
    date: new Date('2026-04-03T19:00:00'),
    time: '19:00',
    location: 'Estudio Principal — Sala 2',
    type: 'Clase',
  },
  {
    title: 'Floorwork Sensual',
    description: 'Trabajo de suelo con movimientos fluidos y sensuales. Ideal para conectar con tu cuerpo.',
    date: new Date('2026-04-05T17:00:00'),
    time: '17:00',
    location: 'Estudio Principal — Sala 1',
    type: 'Clase',
  },
  {
    title: 'Workshop de Flexibilidad',
    description: 'Taller intensivo de 3 horas enfocado en splits, backbends y apertura de cadera.',
    date: new Date('2026-04-10T10:00:00'),
    time: '10:00',
    location: 'Estudio Principal — Sala Grande',
    type: 'Workshop',
  },
  {
    title: 'Competencia Interna LIKE A SHH',
    description: 'Competencia amistosa entre alumnos. Categorías: Inicial, Intermedio y Avanzado.',
    date: new Date('2026-04-20T15:00:00'),
    time: '15:00',
    location: 'Centro Cultural — Auditorio',
    type: 'Competencia',
  },
  {
    title: 'Fortalecimiento Muscular',
    description: 'Clase de acondicionamiento físico para mejorar fuerza de agarre, core y piernas.',
    date: new Date('2026-04-08T20:00:00'),
    time: '20:00',
    location: 'Estudio Principal — Sala 2',
    type: 'Clase',
  },
]

const COMMENTS_DATA = [
  {
    course: 'Pole Dance Inicial',
    text: 'Increíble experiencia. Maximiliano explica todo con mucha paciencia y detalle. Súper recomendado para principiantes.',
    status: 'Aprobado',
    adminReply: '¡Gracias por tus palabras! Nos alegra que hayas disfrutado la clase.',
  },
  {
    course: 'Pole Exotic',
    text: 'Me encantó la clase de Pole Exotic. Nunca pensé que podría moverme así. La energía del grupo es espectacular.',
    status: 'Aprobado',
    adminReply: '',
  },
  {
    course: 'Flexibilidad',
    text: 'El workshop de flexibilidad fue muy intenso pero valió cada minuto. Ya noto mejoras en mis splits.',
    status: 'Aprobado',
    adminReply: '¡Qué bueno saber eso! Seguí practicando los ejercicios del taller.',
  },
  {
    course: 'Floorwork',
    text: 'La clase de floorwork me ayudó a ganar confianza en mis movimientos. El ambiente es muy seguro y acogedor.',
    status: 'Pendiente',
    adminReply: '',
  },
  {
    course: 'Pole Sport',
    text: 'Excelente nivel técnico del instructor. Las progresiones están muy bien pensadas para avanzar sin lesionarse.',
    status: 'Pendiente',
    adminReply: '',
  },
]

// ─── Función Principal ───────────────────────────────────────

const seedDatabase = async () => {
  try {
    await connectDB()

    console.log('\n═══════════════════════════════════════════')
    console.log('  LIKE A SHH — Inicialización de BD')
    console.log('═══════════════════════════════════════════\n')

    // 1. Limpiar colecciones
    console.log('  🗑️  Limpiando colecciones...')
    await User.deleteMany({})
    await Event.deleteMany({})
    await Comment.deleteMany({})
    console.log('     ✓ Colecciones limpiadas\n')

    // 2. Crear usuarios
    console.log('  👤 Creando usuarios...')
    const admin = await User.create(ADMIN_DATA)
    console.log(`     ✓ Admin:   ${admin.email} (${admin.role})`)

    const student = await User.create(STUDENT_DATA)
    console.log(`     ✓ Alumno:  ${student.email} (${student.role})\n`)

    // 3. Crear eventos (asignar createdBy al admin)
    console.log('  📅 Creando eventos del calendario...')
    const eventsWithCreator = EVENTS_DATA.map((e) => ({
      ...e,
      createdBy: admin._id,
    }))
    const events = await Event.insertMany(eventsWithCreator)
    events.forEach((e) => {
      console.log(`     ✓ [${e.type}] ${e.title} — ${e.time}`)
    })
    console.log('')

    // 4. Crear comentarios (asignar user al alumno)
    console.log('  💬 Creando comentarios de ejemplo...')
    const commentsWithUser = COMMENTS_DATA.map((c) => ({
      ...c,
      user: student._id,
    }))
    const comments = await Comment.insertMany(commentsWithUser)
    comments.forEach((c) => {
      const icon = c.status === 'Aprobado' ? '✅' : '⏳'
      console.log(`     ${icon} [${c.status}] ${c.course}: "${c.text.substring(0, 50)}..."`)
    })

    // Resumen
    console.log('\n═══════════════════════════════════════════')
    console.log('  ✅ Base de datos inicializada')
    console.log('═══════════════════════════════════════════')
    console.log(`  Base de datos:  likeashh`)
    console.log(`  Usuarios:       ${2} (1 admin + 1 alumno)`)
    console.log(`  Eventos:        ${events.length}`)
    console.log(`  Comentarios:    ${comments.length}`)
    console.log('')
    console.log('  Credenciales:')
    console.log('  ┌─────────────────────────────────────┐')
    console.log('  │ Admin:  admin@likeashh.com           │')
    console.log('  │         Admin2024!                   │')
    console.log('  │                                     │')
    console.log('  │ Alumno: alumno@likeashh.com          │')
    console.log('  │         Alumno2024!                  │')
    console.log('  └─────────────────────────────────────┘')
    console.log('═══════════════════════════════════════════\n')

    process.exit(0)
  } catch (error) {
    console.error('\n  ❌ Error al inicializar la BD:', error.message)
    if (error.errors) {
      Object.values(error.errors).forEach((e) => {
        console.error(`     → ${e.message}`)
      })
    }
    process.exit(1)
  }
}

seedDatabase()
