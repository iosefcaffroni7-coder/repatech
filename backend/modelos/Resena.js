// Modelo de Mongoose para las reseñas de los técnicos.

const mongoose = require('mongoose');
const NEGOCIO = require('../negocio');

const resenaSchema = new mongoose.Schema({
  tecnico: {
    type: String,
    required: [true, 'Elige un técnico de la lista.'],
    enum: { values: NEGOCIO.tecnicos.map(t => t.nombre), message: 'Elige un técnico de la lista.' }
  },
  nombre: {
    type: String,
    required: [true, 'Escribe tu nombre.'],
    trim: true,
    minlength: [2, 'El nombre debe tener mínimo 2 letras.'],
    maxlength: [40, 'El nombre es muy largo.']
  },
  comentario: {
    type: String,
    required: [true, 'Escribe un comentario.'],
    trim: true,
    minlength: [5, 'El comentario debe tener entre 5 y 300 letras.'],
    maxlength: [300, 'El comentario debe tener entre 5 y 300 letras.']
  },
  calificacion: {
    type: Number,
    required: [true, 'Elige de 1 a 5 estrellas.'],
    min: [1, 'Elige de 1 a 5 estrellas.'],
    max: [5, 'Elige de 1 a 5 estrellas.']
  }
}, { timestamps: true });

module.exports = mongoose.model('Resena', resenaSchema, 'resenas');
