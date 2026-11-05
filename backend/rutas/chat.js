// Ruta pública del chatbot.
// POST /api/chat  con { historial: [{ rol: 'usuario' | 'asistente', texto }] }
// -> responde { respuesta: '...' }

const express = require('express');
const { responderChat } = require('../ia/asistente');

const router = express.Router();

router.post('/', async (req, res) => {
  const { historial } = req.body || {};

  const historialValido = Array.isArray(historial) && historial.length > 0 &&
    historial.every(m => ['usuario', 'asistente'].includes(m.rol) && typeof m.texto === 'string');

  if (!historialValido) {
    return res.status(400).json({ error: 'Escribe una pregunta para el asistente.' });
  }
  if (historial[historial.length - 1].texto.length > 500) {
    return res.status(400).json({ error: 'Tu mensaje es muy largo, resúmelo en menos de 500 letras.' });
  }

  try {
    const respuesta = await responderChat(historial);
    res.json({ respuesta });
  } catch (error) {
    console.error('Error de IA:', error.message);
    res.status(502).json({ error: 'El asistente no está disponible en este momento. Escríbenos por WhatsApp al 304 643 7285.' });
  }
});

module.exports = router;
