/**
 * Configuración y conexión a MongoDB con Mongoose.
 * ISO 25010 — Módulo independiente de conexión a BD.
 */
const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 8+ usa estas opciones por defecto,
      // pero las declaramos explícitamente por claridad.
    })

    console.log(`  MongoDB conectado: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error(`Error de conexión a MongoDB: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
