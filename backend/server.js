// Punto de entrada del backend de RepaTech.
// Aquí solo se configura Express y se conectan las rutas;
// la lógica de cada funcionalidad vive en la carpeta /rutas.

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PUERTO = process.env.PORT || 3000;

// CORS: el frontend vive en GitHub Pages (otro dominio), por eso hay que
// permitirle explícitamente que llame a esta API.
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));

// Permite leer el cuerpo de las peticiones en formato JSON.
app.use(express.json());

// Ruta de prueba: sirve para saber si el servidor está despierto.
app.get('/api/salud', (req, res) => {
  res.json({ ok: true, mensaje: 'API de RepaTech funcionando' });
});

// Si se pide una ruta que no existe, se responde con un error claro.
app.use((req, res) => {
  res.status(404).json({ error: 'Esa ruta no existe en la API' });
});

app.listen(PUERTO, () => {
  console.log(`API de RepaTech escuchando en http://localhost:${PUERTO}`);
});
