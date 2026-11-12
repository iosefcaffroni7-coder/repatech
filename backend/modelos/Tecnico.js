// Modelo de Mongoose para los técnicos.
// Se agregan y se quitan desde el panel de administrador.

const mongoose = require('mongoose');
const NEGOCIO = require('../negocio');

const tecnicoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'Escribe el nombre del técnico.'],
    unique: true,
    trim: true,
    minlength: [3, 'El nombre debe tener mínimo 3 letras.'],
    maxlength: [40, 'El nombre es muy largo.']
  },
  foto: {
    type: String,
    required: [true, 'Elige una foto.'],
    enum: { values: NEGOCIO.fotosTecnico, message: 'Elige una foto de la lista.' }
  },
  // Claves de los servicios que repara (ej. ["celular", "tablet"]).
  servicios: {
    type: [String],
    validate: { validator: lista => lista.length > 0, message: 'Elige al menos un servicio que repare.' }
  },
  zona: {
    type: String,
    required: [true, 'Escribe la zona donde trabaja.'],
    trim: true,
    maxlength: [30, 'La zona es muy larga.']
  },
  experiencia: {
    type: Number,
    required: [true, 'Escribe los años de experiencia.'],
    min: [0, 'Los años de experiencia no pueden ser negativos.'],
    max: [60, 'Revisa los años de experiencia.']
  },
  calificacion: {
    type: Number,
    default: 5,
    min: [1, 'La calificación va de 1 a 5.'],
    max: [5, 'La calificación va de 1 a 5.']
  },
  reparaciones: {
    type: Number,
    default: 0,
    min: [0, 'Las reparaciones no pueden ser negativas.']
  }
}, { timestamps: true });

module.exports = mongoose.model('Tecnico', tecnicoSchema, 'tecnicos');
