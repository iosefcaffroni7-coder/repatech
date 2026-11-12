// Ruta pública del catálogo.
// GET /api/catalogo -> { servicios, tecnicos, cobertura }
// La página lo pide una sola vez al abrir y con eso dibuja servicios,
// técnicos, la calculadora de cobertura y los formularios.

const express = require('express');
const Servicio = require('../modelos/Servicio');
const Tecnico = require('../modelos/Tecnico');
const Cobertura = require('../modelos/Cobertura');
const { responderError } = require('./errores');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Las tres consultas se hacen al mismo tiempo para que responda más rápido.
    const [servicios, tecnicos, cobertura] = await Promise.all([
      Servicio.find().sort({ createdAt: 1 }),
      Tecnico.find().sort({ createdAt: 1 }),
      Cobertura.findOne()
    ]);
    res.json({ servicios, tecnicos, cobertura });
  } catch (error) {
    responderError(res, error);
  }
});

module.exports = router;
