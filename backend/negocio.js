// Información fija del negocio y datos iniciales.
// Los servicios, los técnicos y la cobertura se guardan en MongoDB y se
// administran desde el panel. Lo de aquí solo se usa la primera vez,
// cuando la base de datos está vacía, para que la página no arranque en blanco.

const NEGOCIO = {
  nombre: 'RepaTech',
  descripcion: 'Reparación técnica a domicilio: un técnico de confianza va hasta la casa del cliente.',
  whatsapp: '304 643 7285',
  correo: 'iosefcaffroni7@gmail.com',
  horario: 'de lunes a sábado de 9am a 7pm y los domingos de 10am a 2pm',

  // Ilustraciones que se pueden elegir en el panel (están en frontend/src/assets).
  imagenesServicio: ['celular', 'laptop', 'pc', 'tablet', 'consola', 'tv', 'herramientas'],
  fotosTecnico: ['tecnico1', 'tecnico2', 'tecnico3', 'tecnico4', 'tecnico5', 'tecnico6', 'tecnico7'],

  serviciosIniciales: [
    { clave: 'celular', nombre: 'Celulares', imagen: 'celular', descripcion: 'Pantallas rotas, batería, no carga, se moja' },
    { clave: 'laptop', nombre: 'Laptops', imagen: 'laptop', descripcion: 'No enciende, se calienta, cambio de disco' },
    { clave: 'pc', nombre: 'PC de escritorio', imagen: 'pc', descripcion: 'Formateo, virus, mantenimiento, upgrades' },
    { clave: 'tablet', nombre: 'Tablets', imagen: 'tablet', descripcion: 'Cristal roto, botones, actualización de software' },
    { clave: 'consola', nombre: 'Consolas', imagen: 'consola', descripcion: 'Lector que no lee, joystick, sobrecalentamiento' },
    { clave: 'tv', nombre: 'Pantallas y TV', imagen: 'tv', descripcion: 'Sin imagen, líneas en pantalla, smart TV lento' }
  ],

  tecnicosIniciales: [
    { nombre: 'Miguel Torres', foto: 'tecnico1', servicios: ['celular', 'tablet'], zona: 'Centro', experiencia: 6, calificacion: 4.9, reparaciones: 32 },
    { nombre: 'Ana Ramírez', foto: 'tecnico2', servicios: ['laptop', 'pc'], zona: 'Norte', experiencia: 8, calificacion: 5, reparaciones: 41 },
    { nombre: 'David Cruz', foto: 'tecnico3', servicios: ['consola', 'tv'], zona: 'Sur', experiencia: 4, calificacion: 4.7, reparaciones: 19 },
    { nombre: 'Laura Gómez', foto: 'tecnico4', servicios: ['celular', 'pc', 'laptop'], zona: 'Centro', experiencia: 10, calificacion: 4.8, reparaciones: 50 }
  ],

  // Fórmula del traslado: gratis hasta kmGratis; después costoBase + costoPorKmExtra por cada km extra.
  coberturaInicial: {
    kmMaximo: 15,
    kmGratis: 2,
    costoBase: 15000,
    costoPorKmExtra: 6000,
    minutosBase: 15,
    minutosPorKm: 3,
    descuento: { activo: false, motivo: '', porcentaje: 10 }
  },

  // Reseñas de ejemplo que se guardan la primera vez que la base de datos está vacía.
  resenasIniciales: [
    { tecnico: 'Miguel Torres', nombre: 'Karina P.', calificacion: 5, comentario: 'Miguel llegó antes de lo prometido y me dejó el celular como nuevo, hasta me explicó qué le pasó.' },
    { tecnico: 'Ana Ramírez', nombre: 'Roberto H.', calificacion: 5, comentario: 'Ana me salvó el portátil del trabajo el mismo día. Súper profesional y explica todo bien clarito.' },
    { tecnico: 'David Cruz', nombre: 'Fernanda L.', calificacion: 4, comentario: 'David revisó mi consola en la sala de mi casa, tardó un poco más de lo esperado pero quedó perfecta.' }
  ]
};

module.exports = NEGOCIO;
