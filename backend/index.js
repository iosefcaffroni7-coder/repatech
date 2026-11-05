// Punto de entrada del backend de RepaTech.
// Aquí se configura Express, se conecta MongoDB y se conectan las rutas.
// La lógica de cada funcionalidad vive en la carpeta /rutas
// y la forma de los datos en la carpeta /modelos.

// Carga las variables del archivo .env (claves secretas) si existe.
// process.loadEnvFile viene incluido en Node 20.12+, así no instalamos "dotenv".
try {
  process.loadEnvFile();
} catch {
  // Sin archivo .env: se usan las variables del servidor (por ejemplo en Render).
}

const express = require('express');
const mongoose = require('mongoose');
const Resena = require('./modelos/Resena');
const NEGOCIO = require('./negocio');

const app = express();
const PUERTO = process.env.PORT || 3000;

// CORS: el frontend vive en GitHub Pages (otro dominio), por eso hay que
// permitirle explícitamente que llame a esta API.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Permite leer el cuerpo de las peticiones en formato JSON (req.body).
app.use(express.json());

// Ruta de prueba: sirve para saber si el servidor está despierto.
app.get('/api/salud', (req, res) => {
  res.json({ ok: true, mensaje: 'API de RepaTech funcionando' });
});

// Rutas de la API, cada una en su propio archivo.
app.use('/api/solicitudes', require('./rutas/solicitudes'));
app.use('/api/resenas', require('./rutas/resenas'));
app.use('/api/chat', require('./rutas/chat'));
app.use('/api/admin', require('./rutas/admin'));

// Si se pide una ruta que no existe, se responde con un error claro.
app.use((req, res) => {
  res.status(404).json({ error: 'Esa ruta no existe en la API' });
});

// Si la base de datos está vacía, se guardan las reseñas de ejemplo.
async function crearResenasIniciales() {
  const cantidad = await Resena.countDocuments();
  if (cantidad === 0) {
    await Resena.insertMany(NEGOCIO.resenasIniciales);
    console.log('Reseñas de ejemplo guardadas');
  }
}

// Primero se conecta a MongoDB y después se prende el servidor.
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/repatech')
  .then(async () => {
    console.log('Base de datos conectada');
    await crearResenasIniciales();
    app.listen(PUERTO, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PUERTO}`);
    });
  })
  .catch(error => {
    console.error('No se pudo conectar a MongoDB:', error.message);
  });
