// Modelo de Mongoose para la cobertura y el descuento del traslado.
// Solo existe UN documento: el administrador lo edita desde el panel.

const mongoose = require('mongoose');

const coberturaSchema = new mongoose.Schema({
  kmMaximo: { type: Number, required: true, min: [1, 'La distancia máxima debe ser de al menos 1 km.'], max: [100, 'La distancia máxima es de 100 km.'] },
  kmGratis: { type: Number, required: true, min: [0, 'Los km gratis no pueden ser negativos.'], max: [100, 'Revisa los km gratis.'] },
  costoBase: { type: Number, required: true, min: [0, 'El costo base no puede ser negativo.'] },
  costoPorKmExtra: { type: Number, required: true, min: [0, 'El costo por km no puede ser negativo.'] },
  minutosBase: { type: Number, required: true, min: [0, 'Los minutos no pueden ser negativos.'], max: [240, 'Revisa los minutos base.'] },
  minutosPorKm: { type: Number, required: true, min: [0, 'Los minutos no pueden ser negativos.'], max: [60, 'Revisa los minutos por km.'] },

  // Descuento en el traslado por una ocasión (Navidad, Black Friday...).
  // Si "activo" es false, el precio queda normal.
  descuento: {
    activo: { type: Boolean, default: false },
    motivo: { type: String, trim: true, default: '', maxlength: [40, 'El motivo es muy largo (máximo 40 letras).'] },
    porcentaje: { type: Number, default: 10, min: [1, 'El descuento debe ser de 1% a 90%.'], max: [90, 'El descuento debe ser de 1% a 90%.'] }
  }
}, { timestamps: true });

module.exports = mongoose.model('Cobertura', coberturaSchema, 'cobertura');
