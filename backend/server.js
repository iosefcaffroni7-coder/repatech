// Punto de entrada del backend de RepaTech.
// Aquí solo se configura Express y se conectan las rutas;
// la lógica de cada funcionalidad vive en la carpeta /rutas.

// Carga las variables del archivo .env (claves secretas) si existe.
// process.loadEnvFile viene incluido en Node 20.12+, así no instalamos "dotenv".
try {
  process.loadEnvFile();
} catch {
  // Sin archivo .env: se usan las variables del servidor (por ejemplo en Render).
}

const express = require('express');

const app = express();
const PUERTO = process.env.PORT || 3000;

// CORS: el frontend vive en GitHub Pages (otro dominio), por eso hay que
// permitirle explícitamente que llame a esta API. Se hace a mano en vez de
// instalar la librería "cors" porque son solo unas líneas.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Permite leer el cuerpo de las peticiones en formato JSON.
app.use(express.json());

// Ruta de prueba: sirve para saber si el servidor está despierto.
app.get('/api/salud', (req, res) => {
  res.json({ ok: true, mensaje: 'API de RepaTech funcionando' });
});

// Rutas de la API, cada una en su propio archivo.
app.use('/api/solicitudes', require('./rutas/solicitudes'));
app.use('/api/resenas', require('./rutas/resenas'));

// Si se pide una ruta que no existe, se responde con un error claro.
app.use((req, res) => {
  res.status(404).json({ error: 'Esa ruta no existe en la API' });
});

app.listen(PUERTO, () => {
  console.log(`API de RepaTech escuchando en http://localhost:${PUERTO}`);
});
