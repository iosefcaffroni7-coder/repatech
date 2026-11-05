// Dirección del backend (la API).
// - En tu computador (localhost) usa el servidor local.
// - Publicado en GitHub Pages usa el servidor en Render.
//   ⚠️ Cuando publiques el backend en Render, cambia esta URL por la tuya.
const API_URL = ['localhost', '127.0.0.1'].includes(location.hostname) || location.protocol === 'file:'
  ? 'http://localhost:3000'
  : 'https://repatech-api.onrender.com';
