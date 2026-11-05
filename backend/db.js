// "Base de datos" sencilla basada en archivos JSON.
// Decisión técnica: para un proyecto de este tamaño un archivo JSON por
// colección es fácil de entender y de revisar a mano. Si el negocio crece,
// se puede cambiar este archivo por MongoDB o PostgreSQL sin tocar las rutas,
// porque todas usan solo estas tres funciones: leer, guardar y nuevoId.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CARPETA_DATOS = path.join(__dirname, 'datos');

function rutaDe(coleccion) {
  return path.join(CARPETA_DATOS, `${coleccion}.json`);
}

// Devuelve el arreglo guardado en datos/<coleccion>.json (o [] si no existe).
function leer(coleccion) {
  try {
    const texto = fs.readFileSync(rutaDe(coleccion), 'utf8');
    return JSON.parse(texto);
  } catch {
    return [];
  }
}

// Sobrescribe la colección completa con el arreglo recibido.
function guardar(coleccion, registros) {
  fs.mkdirSync(CARPETA_DATOS, { recursive: true });
  fs.writeFileSync(rutaDe(coleccion), JSON.stringify(registros, null, 2));
}

// Identificador único para cada registro nuevo.
function nuevoId() {
  return crypto.randomUUID();
}

module.exports = { leer, guardar, nuevoId };
