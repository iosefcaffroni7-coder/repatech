// Rutas privadas del panel de administrador.
// POST   /api/admin/login                      -> recibe usuario y clave, devuelve un token
// POST   /api/admin/logout                     -> cierra la sesión
// GET    /api/admin/solicitudes                -> lista de solicitudes de visita
// PUT    /api/admin/solicitudes/:id            -> cambia el estado (pendiente / atendida)
// DELETE /api/admin/solicitudes/:id            -> borra una solicitud
// DELETE /api/admin/resenas/:id                -> borra una reseña (por ejemplo, spam)
// POST   /api/admin/solicitudes/:id/mensaje-ia -> la IA redacta un WhatsApp para el cliente
// POST   /api/admin/servicios                  -> agrega un servicio
// DELETE /api/admin/servicios/:id              -> quita un servicio
// POST   /api/admin/tecnicos                   -> agrega un técnico
// DELETE /api/admin/tecnicos/:id               -> quita un técnico
// PUT    /api/admin/cobertura                  -> edita la cobertura y el descuento del traslado

const express = require('express');
const crypto = require('crypto');
const Solicitud = require('../modelos/Solicitud');
const Resena = require('../modelos/Resena');
const Servicio = require('../modelos/Servicio');
const Tecnico = require('../modelos/Tecnico');
const Cobertura = require('../modelos/Cobertura');
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

/* ---------- Servicios ---------- */

// Convierte un nombre en una clave sin tildes ni espacios: "Relojes Inteligentes" -> "relojes-inteligentes"
function crearClave(nombre) {
  return String(nombre || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // quita las tildes
    .replace(/[^a-z0-9]+/g, '-')                     // todo lo que no sea letra o número pasa a ser "-"
    .replace(/^-+|-+$/g, '');                         // quita los "-" del principio y del final
}

router.post('/servicios', async (req, res) => {
  try {
    const { nombre, descripcion, imagen } = req.body || {};
    const clave = crearClave(nombre);
    if (!clave) {
      return res.status(400).json({ error: 'Escribe el nombre del servicio.' });
    }
    const servicio = await Servicio.create({ clave, nombre, descripcion, imagen });
    res.status(201).json(servicio);
  } catch (error) {
    responderError(res, error);
  }
});

router.delete('/servicios/:id', async (req, res) => {
  try {
    if (await Servicio.countDocuments() <= 1) {
      return res.status(400).json({ error: 'Debe quedar al menos un servicio.' });
    }
    const borrado = await Servicio.findByIdAndDelete(req.params.id);
    if (!borrado) {
      return res.status(404).json({ error: 'No se encontró ese servicio.' });
    }
    // Se le quita ese servicio a los técnicos que lo tenían ($pull saca un valor de una lista).
    await Tecnico.updateMany({}, { $pull: { servicios: borrado.clave } });
    res.json({ ok: true });
  } catch (error) {
    responderError(res, error);
  }
});

/* ---------- Técnicos ---------- */

// Un campo numérico vacío se deja sin valor para que el modelo muestre su mensaje.
const numero = valor => (valor === '' || valor === undefined || valor === null ? undefined : Number(valor));

router.post('/tecnicos', async (req, res) => {
  try {
    const { nombre, foto, servicios, zona, experiencia, calificacion, reparaciones } = req.body || {};
    const lista = Array.isArray(servicios) ? servicios : [];

    // Todos los servicios elegidos deben existir.
    const existentes = await Servicio.countDocuments({ clave: { $in: lista } });
    if (existentes !== lista.length) {
      return res.status(400).json({ error: 'Uno de los servicios elegidos ya no existe, recarga la página.' });
    }

    const tecnico = await Tecnico.create({
      nombre, foto, servicios: lista, zona,
      experiencia: numero(experiencia),
      calificacion: numero(calificacion),
      reparaciones: numero(reparaciones)
    });
    res.status(201).json(tecnico);
  } catch (error) {
    responderError(res, error);
  }
});

router.delete('/tecnicos/:id', async (req, res) => {
  try {
    if (await Tecnico.countDocuments() <= 1) {
      return res.status(400).json({ error: 'Debe quedar al menos un técnico.' });
    }
    const borrado = await Tecnico.findByIdAndDelete(req.params.id);
    if (!borrado) {
      return res.status(404).json({ error: 'No se encontró ese técnico.' });
    }
    res.json({ ok: true });
  } catch (error) {
    responderError(res, error);
  }
});

/* ---------- Cobertura y descuento ---------- */

router.put('/cobertura', async (req, res) => {
  try {
    const datos = req.body || {};
    const campos = ['kmMaximo', 'kmGratis', 'costoBase', 'costoPorKmExtra', 'minutosBase', 'minutosPorKm'];
    const cambios = {};
    for (const campo of campos) {
      cambios[campo] = Number(datos[campo]);
      if (datos[campo] === '' || !Number.isFinite(cambios[campo])) {
        return res.status(400).json({ error: 'Llena todos los campos de la cobertura con números.' });
      }
    }
    if (cambios.kmGratis > cambios.kmMaximo) {
      return res.status(400).json({ error: 'Los km gratis no pueden ser más que la distancia máxima.' });
    }

    const descuento = datos.descuento || {};
    cambios.descuento = {
      activo: Boolean(descuento.activo),
      motivo: String(descuento.motivo || '').trim(),
      porcentaje: Number(descuento.porcentaje) || 10
    };
    if (cambios.descuento.activo && !cambios.descuento.motivo) {
      return res.status(400).json({ error: 'Escribe el motivo del descuento (por ejemplo, Navidad).' });
    }
    if (cambios.descuento.porcentaje < 1 || cambios.descuento.porcentaje > 90) {
      return res.status(400).json({ error: 'El descuento debe ser de 1% a 90%.' });
    }

    // Solo hay un documento de cobertura: se actualiza ese (o se crea si no existe).
    const cobertura = await Cobertura.findOneAndUpdate({}, cambios, { new: true, runValidators: true, upsert: true });
    res.json(cobertura);
  } catch (error) {
    responderError(res, error);
  }
});

module.exports = router;
