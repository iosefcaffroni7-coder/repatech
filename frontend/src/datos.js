// Catálogo del negocio: servicios y técnicos.
// Los componentes recorren estos arreglos con .map() para dibujar las tarjetas,
// así para agregar un técnico nuevo solo se agrega un objeto aquí.

import celular from './assets/celular.svg'
import laptop from './assets/laptop.svg'
import pc from './assets/pc.svg'
import tablet from './assets/tablet.svg'
import consola from './assets/consola.svg'
import tv from './assets/tv.svg'
import tecnico1 from './assets/tecnico1.svg'
import tecnico2 from './assets/tecnico2.svg'
import tecnico3 from './assets/tecnico3.svg'
import tecnico4 from './assets/tecnico4.svg'

export const servicios = [
  { id: 'celular', nombre: 'Celulares', imagen: celular, descripcion: 'Pantallas rotas, batería, no carga, se moja' },
  { id: 'laptop', nombre: 'Laptops', imagen: laptop, descripcion: 'No enciende, se calienta, cambio de disco' },
  { id: 'pc', nombre: 'PC de escritorio', imagen: pc, descripcion: 'Formateo, virus, mantenimiento, upgrades' },
  { id: 'tablet', nombre: 'Tablets', imagen: tablet, descripcion: 'Cristal roto, botones, actualización de software' },
  { id: 'consola', nombre: 'Consolas', imagen: consola, descripcion: 'Lector que no lee, joystick, sobrecalentamiento' },
  { id: 'tv', nombre: 'Pantallas y TV', imagen: tv, descripcion: 'Sin imagen, líneas en pantalla, smart TV lento' }
]

// "dispositivos" dice qué aparatos repara cada técnico (se usa en el filtro).
export const tecnicos = [
  { nombre: 'Miguel Torres', foto: tecnico1, dispositivos: ['celular', 'tablet'], especialidad: 'Celulares · Tablets', calificacion: 4.9, experiencia: 6, zona: 'Centro', reparaciones: 32 },
  { nombre: 'Ana Ramírez', foto: tecnico2, dispositivos: ['laptop', 'pc'], especialidad: 'Laptops · PC de escritorio', calificacion: 5.0, experiencia: 8, zona: 'Norte', reparaciones: 41 },
  { nombre: 'David Cruz', foto: tecnico3, dispositivos: ['consola', 'tv'], especialidad: 'Consolas · Pantallas y TV', calificacion: 4.7, experiencia: 4, zona: 'Sur', reparaciones: 19 },
  { nombre: 'Laura Gómez', foto: tecnico4, dispositivos: ['celular', 'pc', 'laptop'], especialidad: 'Celulares · PC · Laptops', calificacion: 4.8, experiencia: 10, zona: 'Centro', reparaciones: 50 }
]

// Opciones del formulario de contacto (deben coincidir con el backend).
export const aparatos = ['Celular', 'Laptop', 'PC de escritorio', 'Tablet', 'Consola', 'TV / Pantalla']

// Convierte una calificación (ej. 4) en estrellas: ★★★★☆
export function estrellas(numero) {
  const llenas = Math.round(numero)
  return '★'.repeat(llenas) + '☆'.repeat(5 - llenas)
}
