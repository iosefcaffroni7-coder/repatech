// Ruta pública del formulario "Pide tu visita".
// POST /api/solicitudes -> guarda la solicitud para que el admin la vea en su panel.

const express = require('express');
const db = require('../db');
const NEGOCIO = require('../negocio');
const { textoValido, telefonoValido } = require('../validar');

const router = express.Router();

router.post('/', (req, res) => {
  const { nombre, telefono, direccion, dispositivo, mensaje } = req.body || {};

  // Cada validación devuelve un mensaje que el usuario pueda entender.
  if (!textoValido(nombre, 2, 60)) {
    return res.status(400).json({ error: 'Escribe tu nombre (mínimo 2 letras).' });
  }
  if (!telefonoValido(telefono)) {
    return res.status(400).json({ error: 'El teléfono debe tener 10 dígitos, por ejemplo 3001234567.' });
  }
  if (!textoValido(direccion, 3, 120)) {
    return res.status(400).json({ error: 'Escribe tu barrio o dirección.' });
  }
  if (!NEGOCIO.dispositivos.includes(dispositivo)) {
    return res.status(400).json({ error: 'Elige qué aparato hay que reparar.' });
  }
  if (!textoValido(mensaje, 5, 500)) {
    return res.status(400).json({ error: 'Cuéntanos qué le pasa al aparato (mínimo 5 letras).' });
  }

  const solicitud = {
    id: db.nuevoId(),
    nombre: nombre.trim(),
    telefono: telefono.replace(/[\s-]/g, ''),
    direccion: direccion.trim(),
    dispositivo,
    mensaje: mensaje.trim(),
    estado: 'pendiente', // el admin la puede cambiar a "atendida"
    fecha: new Date().toISOString()
  };

  const solicitudes = db.leer('solicitudes');
  solicitudes.unshift(solicitud); // las más nuevas primero
  db.guardar('solicitudes', solicitudes);

  res.status(201).json({ ok: true, mensaje: '¡Listo! Recibimos tu solicitud, te llamamos en un momento para confirmar.' });
});

module.exports = router;
