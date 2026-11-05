// Rutas públicas de reseñas.
// GET  /api/resenas -> lista de reseñas (las más nuevas primero)
// POST /api/resenas -> publica una reseña nueva

const express = require('express');
const Resena = require('../modelos/Resena');
const { responderError } = require('./errores');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const resenas = await Resena.find().sort({ createdAt: -1 });
    res.json(resenas);
  } catch (error) {
    responderError(res, error);
  }
});

router.post('/', async (req, res) => {
  try {
    const { tecnico, nombre, comentario, calificacion } = req.body || {};

    // La calificación debe ser un número entero (1, 2, 3, 4 o 5).
    if (!Number.isInteger(Number(calificacion))) {
      return res.status(400).json({ error: 'Elige de 1 a 5 estrellas.' });
    }

    const resena = await Resena.create({ tecnico, nombre, comentario, calificacion: Number(calificacion) });
    res.status(201).json(resena);
  } catch (error) {
    responderError(res, error);
  }
});

module.exports = router;
