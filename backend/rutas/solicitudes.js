// Ruta pública del formulario "Pide tu visita".
// POST /api/solicitudes -> guarda la solicitud en MongoDB para que el admin la vea.

const express = require('express');
const Solicitud = require('../modelos/Solicitud');
const { responderError } = require('./errores');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { nombre, telefono, direccion, dispositivo, mensaje } = req.body || {};

    // Las validaciones están en el modelo (modelos/Solicitud.js).
    // Al teléfono se le quitan espacios y guiones antes de guardarlo.
    await Solicitud.create({
      nombre,
      telefono: String(telefono || '').replace(/[\s-]/g, ''),
      direccion,
      dispositivo,
      mensaje
    });

    res.status(201).json({ mensaje: '¡Listo! Recibimos tu solicitud, te llamamos en un momento para confirmar.' });
  } catch (error) {
    responderError(res, error);
  }
});

module.exports = router;
