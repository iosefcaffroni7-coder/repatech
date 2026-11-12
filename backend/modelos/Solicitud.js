// Modelo de Mongoose para las solicitudes de visita (formulario "Pide tu visita").
// El esquema dice qué campos tiene cada solicitud y las reglas que deben cumplir.
// Si una regla no se cumple, Mongoose no guarda nada y devuelve el mensaje de error.

const mongoose = require('mongoose');

const solicitudSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'Escribe tu nombre.'],
    trim: true,
    minlength: [2, 'El nombre debe tener mínimo 2 letras.'],
    maxlength: [60, 'El nombre es muy largo.']
  },
  telefono: {
    type: String,
    required: [true, 'Escribe tu teléfono.'],
    match: [/^\d{10}$/, 'El teléfono debe tener 10 dígitos, por ejemplo 3001234567.']
  },
  direccion: {
    type: String,
    required: [true, 'Escribe tu barrio o dirección.'],
    trim: true,
    minlength: [3, 'Escribe tu barrio o dirección.'],
    maxlength: [120, 'La dirección es muy larga.']
  },
  dispositivo: {
    type: String,
    required: [true, 'Elige qué aparato hay que reparar.'],
    trim: true,
    maxlength: [30, 'Elige qué aparato hay que reparar.']
    // Que sea un servicio que existe se revisa en la ruta (rutas/solicitudes.js).
  },
  mensaje: {
    type: String,
    required: [true, 'Cuéntanos qué le pasa al aparato.'],
    trim: true,
    minlength: [5, 'Cuéntanos qué le pasa al aparato (mínimo 5 letras).'],
    maxlength: [500, 'El mensaje es muy largo.']
  },
  estado: {
    type: String,
    enum: { values: ['pendiente', 'atendida'], message: 'El estado debe ser "pendiente" o "atendida".' },
    default: 'pendiente'
  }
}, { timestamps: true }); // agrega createdAt y updatedAt solos

// El tercer parámetro es el nombre de la colección en MongoDB.
module.exports = mongoose.model('Solicitud', solicitudSchema, 'solicitudes');
