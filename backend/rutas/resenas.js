// Rutas públicas de reseñas.
// GET  /api/resenas -> lista de reseñas (las más nuevas primero)
// POST /api/resenas -> publica una reseña nueva
// Antes las reseñas se guardaban en el navegador (localStorage) y solo las
// veía quien las escribía. Ahora se guardan en el servidor y las ve todo el mundo.

const express = require('express');
const db = require('../db');
const NEGOCIO = require('../negocio');
const { textoValido } = require('../validar');

const router = express.Router();
const NOMBRES_TECNICOS = NEGOCIO.tecnicos.map(t => t.nombre);

router.get('/', (req, res) => {
  res.json(db.leer('resenas'));
});

router.post('/', (req, res) => {
  const { tecnico, nombre, comentario, calificacion } = req.body || {};
  const estrellas = Number(calificacion);

  if (!NOMBRES_TECNICOS.includes(tecnico)) {
    return res.status(400).json({ error: 'Elige un técnico de la lista.' });
  }
  if (!Number.isInteger(estrellas) || estrellas < 1 || estrellas > 5) {
    return res.status(400).json({ error: 'Elige de 1 a 5 estrellas.' });
  }
  if (!textoValido(nombre, 2, 40)) {
    return res.status(400).json({ error: 'Escribe tu nombre (mínimo 2 letras).' });
  }
  if (!textoValido(comentario, 5, 300)) {
    return res.status(400).json({ error: 'El comentario debe tener entre 5 y 300 letras.' });
  }

  const resena = {
    id: db.nuevoId(),
    tecnico,
    nombre: nombre.trim(),
    comentario: comentario.trim(),
    calificacion: estrellas,
    fecha: new Date().toISOString()
  };

  const resenas = db.leer('resenas');
  resenas.unshift(resena);
  db.guardar('resenas', resenas);

  res.status(201).json(resena);
});

module.exports = router;
