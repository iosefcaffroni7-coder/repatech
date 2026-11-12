// Modelo de Mongoose para los servicios (los aparatos que reparamos).
// Se agregan y se quitan desde el panel de administrador.

const mongoose = require('mongoose');
const NEGOCIO = require('../negocio');

const servicioSchema = new mongoose.Schema({
  // Identificador corto sin espacios (ej. "celular"). Lo usan el filtro de técnicos
  // y la lista de servicios de cada técnico. El backend lo crea a partir del nombre.
  clave: {
    type: String,
    required: true,
    unique: true,
    match: [/^[a-z0-9-]+$/, 'El nombre del servicio no es válido.']
  },
  nombre: {
    type: String,
    required: [true, 'Escribe el nombre del servicio.'],
    trim: true,
    minlength: [3, 'El nombre debe tener mínimo 3 letras.'],
    maxlength: [30, 'El nombre es muy largo (máximo 30 letras).']
  },
  descripcion: {
    type: String,
    required: [true, 'Escribe qué problemas reparan.'],
    trim: true,
    minlength: [5, 'La descripción debe tener mínimo 5 letras.'],
    maxlength: [80, 'La descripción es muy larga (máximo 80 letras).']
  },
  imagen: {
    type: String,
    required: [true, 'Elige una ilustración.'],
    enum: { values: NEGOCIO.imagenesServicio, message: 'Elige una ilustración de la lista.' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Servicio', servicioSchema, 'servicios');
