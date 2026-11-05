// Funciones pequeñas para validar lo que llega del frontend.
// Nunca se confía solo en la validación del navegador: cualquiera
// podría llamar a la API directamente, por eso se revisa también aquí.

// Revisa que el valor sea texto y que su largo esté entre min y max.
function textoValido(valor, min, max) {
  return typeof valor === 'string' && valor.trim().length >= min && valor.trim().length <= max;
}

// Teléfono colombiano: exactamente 10 dígitos (se ignoran espacios y guiones).
function telefonoValido(valor) {
  return typeof valor === 'string' && /^\d{10}$/.test(valor.replace(/[\s-]/g, ''));
}

module.exports = { textoValido, telefonoValido };
