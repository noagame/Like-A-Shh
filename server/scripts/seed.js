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
 *  4. Crea cursos de ejemplo
 *  5. Crea eventos de ejemplo para el calendario
 *  6. Crea comentarios de ejemplo en distintos estados
 *  7. Crea la configuración del sitio (Settings singleton)
 */

require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')
const Event = require('../models/Event')
const Comment = require('../models/Comment')
const Course = require('../models/Course')
const Settings = require('../models/Settings')
const Gallery = require('../models/Gallery')
const Rating = require('../models/Rating')
const connectDB = require('../config/db')

// ─── Datos Iniciales ─────────────────────────────────────────

const ADMIN_DATA = {
  firstName: 'Maximiliano',
  lastName: 'Velásquez',
  email: 'admin@likeashh.com',
  password: 'Admin2024!',
  role: 'admin',
  acceptedTerms: true,
  emailConfirmed: true,
}

const STUDENT_DATA = {
  firstName: 'Valentina',
  lastName: 'Rodríguez',
  email: 'alumno@likeashh.com',
  password: 'Alumno2024!',
  role: 'user',
  acceptedTerms: true,
  emailConfirmed: true,
}

const COURSES_DATA = [
  {
    name: 'Pole Dance Inicial',
    level: 'Inicial',
    description:
      'Descubre el mundo del Pole Dance desde cero. Este curso te guiará paso a paso a través de los fundamentos esenciales: calentamiento adecuado, agarre seguro, giros básicos como Fireman y Chair Spin, y las primeras figuras de inversión. Ideal para quienes nunca han tocado un pole.',
    link: 'https://hotmart.com/es/marketplace',
    access: '30 días',
    certificate: true,
    icon: '🔥',
    duration: '8 semanas',
    version: 1,
  },
  {
    name: 'Figuras & Transiciones',
    level: 'Intermedio',
    description:
      'Lleva tu Pole Dance al siguiente nivel dominando figuras intermedias y el arte de las transiciones fluidas. Aprenderás combos dinámicos, figuras de fuerza como Shoulder Mount y Aysha, además de transiciones elegantes.',
    link: 'https://hotmart.com/es/marketplace',
    access: '45 días',
    certificate: true,
    icon: '⭐',
    duration: '10 semanas',
    version: 1,
  },
  {
    name: 'Flexibilidad & Expresión',
    level: 'Todos los niveles',
    description:
      'Un programa complementario centrado en la flexibilidad profunda y la expresión corporal. Incluye splits progresivos, back bends, apertura de caderas, y técnicas de movimiento contemporáneo aplicadas al Pole Dance.',
    link: 'https://hotmart.com/es/marketplace',
    access: '30 días',
    certificate: false,
    icon: '🧘',
    duration: '6 semanas',
    version: 1,
  },
]

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
    await Course.deleteMany({})
    await Gallery.deleteMany({})
    await Rating.deleteMany({})
    // Don't delete settings — let getInstance handle it
    await mongoose.connection.collection('settings').drop().catch(() => {})
    console.log('     ✓ Colecciones limpiadas\n')

    // 2. Crear usuarios
    console.log('  👤 Creando usuarios...')
    const admin = await User.create(ADMIN_DATA)
    console.log(`     ✓ Admin:   ${admin.email} (${admin.role})`)

    const student = await User.create(STUDENT_DATA)
    console.log(`     ✓ Alumno:  ${student.email} (${student.role})\n`)

    // 3. Crear cursos
    console.log('  📚 Creando cursos...')
    const courses = await Course.insertMany(COURSES_DATA)
    courses.forEach((c) => {
      console.log(`     ✓ ${c.icon} ${c.name} — ${c.level} (${c.duration})`)
    })
    console.log('')

    // 4. Vincular cursos al alumno (simulación Hotmart)
    student.purchasedCourses = [courses[0]._id, courses[2]._id]
    await student.save()
    console.log('  🔗 Cursos vinculados al alumno: Pole Dance Inicial, Flexibilidad & Expresión\n')

    // 5. Crear eventos (asignar createdBy al admin)
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

    // 6. Crear comentarios (asignar user al alumno)
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
    console.log('')

    // 7. Crear Settings (singleton)
    console.log('  ⚙️  Creando configuración del sitio...')
    await Settings.getInstance()
    console.log('     ✓ Settings singleton creado')

    // 8. Crear calificaciones de ejemplo
    console.log('\n  ⭐ Creando calificaciones de ejemplo...')
    await Rating.create({
      user: student._id,
      course: courses[0]._id,
      stars: 5,
      comment: 'Excelente curso, aprendí muchísimo desde el primer día. Maximiliano explica con una paciencia increíble.',
      courseVersion: 1,
    })
    console.log('     ✓ Rating: Pole Dance Inicial — 5 estrellas')

    // Resumen
    console.log('\n═══════════════════════════════════════════')
    console.log('  ✅ Base de datos inicializada')
    console.log('═══════════════════════════════════════════')
    console.log(`  Base de datos:  likeashh`)
    console.log(`  Usuarios:       ${2} (1 admin + 1 alumno)`)
    console.log(`  Cursos:         ${courses.length}`)
    console.log(`  Eventos:        ${events.length}`)
    console.log(`  Comentarios:    ${comments.length}`)
    console.log(`  Calificaciones: 1`)
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
