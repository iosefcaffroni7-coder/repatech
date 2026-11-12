// Ilustraciones y funciones de ayuda del catálogo.
// Los servicios, técnicos y la cobertura ya NO están escritos aquí:
// vienen de la base de datos (GET /api/catalogo) y se editan en el panel.
// En MongoDB cada servicio o técnico guarda solo el NOMBRE de su imagen
// (ej. "celular" o "tecnico3"); estos objetos traducen ese nombre al archivo.

import celular from './assets/celular.svg'
import laptop from './assets/laptop.svg'
import pc from './assets/pc.svg'
import tablet from './assets/tablet.svg'
import consola from './assets/consola.svg'
import tv from './assets/tv.svg'
import herramientas from './assets/herramientas.svg'
import tecnico1 from './assets/tecnico1.svg'
import tecnico2 from './assets/tecnico2.svg'
import tecnico3 from './assets/tecnico3.svg'
import tecnico4 from './assets/tecnico4.svg'
import tecnico5 from './assets/tecnico5.svg'
import tecnico6 from './assets/tecnico6.svg'
import tecnico7 from './assets/tecnico7.svg'

export const imagenesServicio = { celular, laptop, pc, tablet, consola, tv, herramientas }
export const fotosTecnico = { tecnico1, tecnico2, tecnico3, tecnico4, tecnico5, tecnico6, tecnico7 }

// Especialidad de un técnico a partir de sus servicios: ["celular", "tablet"] -> "Celulares · Tablets"
export function especialidadDe(tecnico, servicios) {
  const nombres = servicios.filter(s => tecnico.servicios.includes(s.clave)).map(s => s.nombre)
  return nombres.length ? nombres.join(' · ') : 'Sin servicios asignados'
}

// Convierte una calificación (ej. 4) en estrellas: ★★★★☆
export function estrellas(numero) {
  const llenas = Math.round(numero)
  return '★'.repeat(llenas) + '☆'.repeat(5 - llenas)
}

// 15000 -> "$15.000"
export function pesos(valor) {
  return `$${Math.round(valor).toLocaleString('es-CO')}`
}

// Calcula tiempo y costo del traslado con la cobertura guardada en la base de datos.
// Si hay un descuento activo, también devuelve el costo con descuento.
export function calcularTraslado(km, c) {
  const minutos = Math.round(c.minutosBase + km * c.minutosPorKm)
  const costo = km <= c.kmGratis ? 0 : Math.round(c.costoBase + (km - c.kmGratis) * c.costoPorKmExtra)
  const conDescuento = c.descuento?.activo && costo > 0
    ? Math.round(costo * (1 - c.descuento.porcentaje / 100))
    : costo
  return { minutos, costo, conDescuento }
}
