// Rutas privadas del panel de administrador.
// POST   /api/admin/login              -> recibe usuario y clave, devuelve un token
// GET    /api/admin/solicitudes        -> lista de solicitudes de visita
// PATCH  /api/admin/solicitudes/:id    -> cambia el estado (pendiente / atendida)
// DELETE /api/admin/solicitudes/:id    -> borra una solicitud
// DELETE /api/admin/resenas/:id        -> borra una reseña (por ejemplo, spam)
// POST   /api/admin/solicitudes/:id/mensaje-ia -> la IA redacta un mensaje para el cliente

const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { redactarMensajeCliente } = require('../ia/asistente');

const router = express.Router();

// Tokens de las sesiones abiertas. Se guardan en memoria: si el servidor
// se reinicia, el admin solo tiene que volver a iniciar sesión.
const sesiones = new Set();

router.post('/login', (req, res) => {
  const { usuario, clave } = req.body || {};
  const usuarioCorrecto = process.env.ADMIN_USUARIO || 'admin';
  const claveCorrecta = process.env.ADMIN_CLAVE || 'thesun';

  if (usuario !== usuarioCorrecto || clave !== claveCorrecta) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  }

  const token = crypto.randomUUID();
  sesiones.add(token);
  res.json({ token });
});

// Middleware: se ejecuta antes de cada ruta de abajo y bloquea a quien
// no envíe un token válido en el encabezado "Authorization: Bearer <token>".
function requiereAdmin(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!sesiones.has(token)) {
    return res.status(401).json({ error: 'Tu sesión expiró, vuelve a iniciar sesión.' });
  }
  next();
}

router.use(requiereAdmin);

router.post('/logout', (req, res) => {
  sesiones.delete(req.headers.authorization.replace('Bearer ', ''));
  res.json({ ok: true });
});

router.get('/solicitudes', (req, res) => {
  res.json(db.leer('solicitudes'));
});

router.patch('/solicitudes/:id', (req, res) => {
  const { estado } = req.body || {};
  if (!['pendiente', 'atendida'].includes(estado)) {
    return res.status(400).json({ error: 'El estado debe ser "pendiente" o "atendida".' });
  }

  const solicitudes = db.leer('solicitudes');
  const solicitud = solicitudes.find(s => s.id === req.params.id);
  if (!solicitud) {
    return res.status(404).json({ error: 'No se encontró esa solicitud.' });
  }

  solicitud.estado = estado;
  db.guardar('solicitudes', solicitudes);
  res.json(solicitud);
});

router.delete('/solicitudes/:id', (req, res) => {
  const solicitudes = db.leer('solicitudes');
  const restantes = solicitudes.filter(s => s.id !== req.params.id);
  if (restantes.length === solicitudes.length) {
    return res.status(404).json({ error: 'No se encontró esa solicitud.' });
  }
  db.guardar('solicitudes', restantes);
  res.json({ ok: true });
});

router.delete('/resenas/:id', (req, res) => {
  const resenas = db.leer('resenas');
  const restantes = resenas.filter(r => r.id !== req.params.id);
  if (restantes.length === resenas.length) {
    return res.status(404).json({ error: 'No se encontró esa reseña.' });
  }
  db.guardar('resenas', restantes);
  res.json({ ok: true });
});

router.post('/solicitudes/:id/mensaje-ia', async (req, res) => {
  const solicitud = db.leer('solicitudes').find(s => s.id === req.params.id);
  if (!solicitud) {
    return res.status(404).json({ error: 'No se encontró esa solicitud.' });
  }

  try {
    const texto = await redactarMensajeCliente(solicitud);
    res.json({ texto });
  } catch (error) {
    console.error('Error de IA:', error.message);
    res.status(502).json({ error: 'La IA no respondió, intenta de nuevo en unos segundos.' });
  }
});

module.exports = router;
