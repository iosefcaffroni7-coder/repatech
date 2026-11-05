// Información del negocio en un solo lugar.
// La usan las validaciones de las rutas y el asistente de IA,
// así si cambia un técnico o un precio, se cambia solo aquí.

const NEGOCIO = {
  nombre: 'RepaTech',
  descripcion: 'Reparación técnica a domicilio: un técnico de confianza va hasta la casa del cliente.',
  whatsapp: '304 643 7285',
  correo: 'iosefcaffroni7@gmail.com',
  horario: 'de lunes a sábado de 9am a 7pm y los domingos de 10am a 2pm',

  dispositivos: ['Celular', 'Laptop', 'PC de escritorio', 'Tablet', 'Consola', 'TV / Pantalla'],

  servicios: [
    { aparato: 'Celulares', problemas: 'pantallas rotas, batería, no carga, se mojó' },
    { aparato: 'Laptops', problemas: 'no enciende, se calienta, cambio de disco' },
    { aparato: 'PC de escritorio', problemas: 'formateo, virus, mantenimiento, mejoras de hardware' },
    { aparato: 'Tablets', problemas: 'cristal roto, botones, actualización de software' },
    { aparato: 'Consolas', problemas: 'lector que no lee, controles, sobrecalentamiento' },
    { aparato: 'Pantallas y TV', problemas: 'sin imagen, líneas en pantalla, smart TV lento' }
  ],

  tecnicos: [
    { nombre: 'Miguel Torres', especialidad: 'Celulares y tablets', zona: 'Centro', experiencia: 6, calificacion: 4.9 },
    { nombre: 'Ana Ramírez', especialidad: 'Laptops y PC de escritorio', zona: 'Norte', experiencia: 8, calificacion: 5.0 },
    { nombre: 'David Cruz', especialidad: 'Consolas, pantallas y TV', zona: 'Sur', experiencia: 4, calificacion: 4.7 },
    { nombre: 'Laura Gómez', especialidad: 'Celulares, PC y laptops', zona: 'Centro', experiencia: 10, calificacion: 4.8 }
  ],

  // Reseñas de ejemplo que se guardan la primera vez que la base de datos está vacía.
  resenasIniciales: [
    { tecnico: 'Miguel Torres', nombre: 'Karina P.', calificacion: 5, comentario: 'Miguel llegó antes de lo prometido y me dejó el celular como nuevo, hasta me explicó qué le pasó.' },
    { tecnico: 'Ana Ramírez', nombre: 'Roberto H.', calificacion: 5, comentario: 'Ana me salvó el portátil del trabajo el mismo día. Súper profesional y explica todo bien clarito.' },
    { tecnico: 'David Cruz', nombre: 'Fernanda L.', calificacion: 4, comentario: 'David revisó mi consola en la sala de mi casa, tardó un poco más de lo esperado pero quedó perfecta.' }
  ],

  // Misma fórmula que usa la calculadora de cobertura del frontend.
  cobertura: {
    kmMaximo: 15,
    kmGratis: 2,
    costoBase: 15000,
    costoPorKmExtra: 6000,
    minutosBase: 15,
    minutosPorKm: 3
  }
};

module.exports = NEGOCIO;
