// Convierte los errores de Mongoose en una respuesta clara para el usuario.
// - ValidationError: algún dato no cumple las reglas del modelo -> 400
// - CastError: el id de la URL no tiene el formato de MongoDB -> 404
// - Cualquier otro: error del servidor -> 500

function responderError(res, error) {
  if (error.name === 'ValidationError') {
    const primerError = Object.values(error.errors)[0];
    return res.status(400).json({ error: primerError.message });
  }
  if (error.name === 'CastError') {
    return res.status(404).json({ error: 'No se encontró ese registro.' });
  }
  console.error(error);
  res.status(500).json({ error: 'Algo falló en el servidor, intenta de nuevo.' });
}

module.exports = { responderError };
