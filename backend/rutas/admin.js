// Rutas privadas del panel de administrador.
// POST   /api/admin/login                      -> recibe usuario y clave, devuelve un token
// POST   /api/admin/logout                     -> cierra la sesión
// GET    /api/admin/solicitudes                -> lista de solicitudes de visita
// PUT    /api/admin/solicitudes/:id            -> cambia el estado (pendiente / atendida)
// DELETE /api/admin/solicitudes/:id            -> borra una solicitud
// DELETE /api/admin/resenas/:id                -> borra una reseña (por ejemplo, spam)
// POST   /api/admin/solicitudes/:id/mensaje-ia -> la IA redacta un WhatsApp para el cliente

const express = require('express');
const crypto = require('crypto');
const Solicitud = require('../modelos/Solicitud');
const Resena = require('../modelos/Resena');
const { responderError } = require('./errores');
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

  // Un token es un texto aleatorio imposible de adivinar que funciona como "pase".
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
  req.token = token;
  next();
}

router.use(requiereAdmin);

router.post('/logout', (req, res) => {
  sesiones.delete(req.token);
  res.json({ ok: true });
});

router.get('/solicitudes', async (req, res) => {
  try {
    const solicitudes = await Solicitud.find().sort({ createdAt: -1 });
    res.json(solicitudes);
  } catch (error) {
    responderError(res, error);
  }
});

router.put('/solicitudes/:id', async (req, res) => {
  try {
    const solicitud = await Solicitud.findByIdAndUpdate(
      req.params.id,
      { estado: (req.body || {}).estado },
      { new: true, runValidators: true } // devuelve la versión nueva y revisa las reglas del modelo
    );
    if (!solicitud) {
      return res.status(404).json({ error: 'No se encontró esa solicitud.' });
    }
    res.json(solicitud);
  } catch (error) {
    responderError(res, error);
  }
});

router.delete('/solicitudes/:id', async (req, res) => {
  try {
    const borrada = await Solicitud.findByIdAndDelete(req.params.id);
    if (!borrada) {
      return res.status(404).json({ error: 'No se encontró esa solicitud.' });
    }
    res.json({ ok: true });
  } catch (error) {
    responderError(res, error);
  }
});

router.delete('/resenas/:id', async (req, res) => {
  try {
    const borrada = await Resena.findByIdAndDelete(req.params.id);
    if (!borrada) {
      return res.status(404).json({ error: 'No se encontró esa reseña.' });
    }
    res.json({ ok: true });
  } catch (error) {
    responderError(res, error);
  }
});

router.post('/solicitudes/:id/mensaje-ia', async (req, res) => {
  let solicitud;
  try {
    solicitud = await Solicitud.findById(req.params.id);
  } catch (error) {
    return responderError(res, error);
  }
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
