const botonMenu = document.getElementById('botonMenu');
const navPrincipal = document.getElementById('navPrincipal');
const todasLasVistas = document.querySelectorAll('.vista');
const enlacesNav = document.querySelectorAll('.nav a[data-vista]');
const main = document.querySelector('main');

botonMenu.addEventListener('click', () => {
  navPrincipal.classList.toggle('abierto');
});

function mostrarVista(idVista) {
  const vistaActual = document.querySelector('.vista.vista-activa');
  const vistaNueva = document.getElementById(idVista);

  navPrincipal.classList.remove('abierto');

  if (!vistaNueva || vistaNueva === vistaActual) {
    return;
  }

  enlacesNav.forEach(enlace => {
    enlace.classList.toggle('activo', enlace.dataset.vista === idVista);
  });

  const abrirVistaNueva = () => {
    vistaNueva.classList.add('vista-activa');
    main.scrollIntoView({ behavior: 'smooth', block: 'start' });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        vistaNueva.classList.add('vista-visible');
      });
    });
  };

  if (vistaActual) {
    vistaActual.classList.remove('vista-visible');
    vistaActual.classList.add('vista-saliendo');
    setTimeout(() => {
      vistaActual.classList.remove('vista-activa', 'vista-saliendo');
      abrirVistaNueva();
    }, 320);
  } else {
    abrirVistaNueva();
  }
}

document.querySelectorAll('[data-vista]').forEach(disparador => {
  disparador.addEventListener('click', evento => {
    evento.preventDefault();
    mostrarVista(disparador.dataset.vista);
  });
});

const chips = document.querySelectorAll('.chip');
const tarjetasTecnico = document.querySelectorAll('.tarjeta-tecnico');
const sinResultados = document.getElementById('sinResultados');

function filtrarTecnicos(valor) {
  let visibles = 0;
  chips.forEach(chip => {
    chip.classList.toggle('activo', chip.dataset.filtro === valor);
  });
  tarjetasTecnico.forEach(tarjeta => {
    const coincide = valor === 'todos' || tarjeta.dataset.dispositivos.split(' ').includes(valor);
    tarjeta.classList.toggle('oculto', !coincide);
    if (coincide) visibles++;
  });
  sinResultados.classList.toggle('oculto', visibles !== 0);
}

chips.forEach(chip => {
  chip.addEventListener('click', () => filtrarTecnicos(chip.dataset.filtro));
});

document.querySelectorAll('.tarjeta-servicio').forEach(tarjeta => {
  tarjeta.addEventListener('click', () => {
    const dispositivo = tarjeta.dataset.dispositivo;
    mostrarVista('tecnicos');
    filtrarTecnicos(dispositivo);
  });
});

const formCobertura = document.getElementById('formCobertura');
const resultadoCobertura = document.getElementById('resultadoCobertura');

formCobertura.addEventListener('submit', evento => {
  evento.preventDefault();
  const km = parseFloat(document.getElementById('distancia').value);

  if (isNaN(km) || km < 0) {
    return;
  }

  resultadoCobertura.classList.remove('oculto');

  if (km > 15) {
    resultadoCobertura.classList.add('aviso');
    resultadoCobertura.innerHTML = '<h4>Uy, todavía no llegamos hasta allá</h4><p>Por ahora cubrimos hasta 15 km desde nuestro punto de partida. Escríbenos y vemos si podemos hacer una excepción.</p>';
    return;
  }

  resultadoCobertura.classList.remove('aviso');
  const tiempo = Math.round(15 + km * 3);
  const costo = km <= 2 ? 0 : Math.round(15000 + (km - 2) * 6000);
  const costoFormateado = costo.toLocaleString('es-CO');
  const textoCosto = costo === 0 ? 'Traslado sin costo' : `Costo de traslado aprox. $${costoFormateado} COP`;

  resultadoCobertura.innerHTML = `<h4>¡Sí llegamos!</h4><p>Tiempo estimado de llegada: ${tiempo} minutos</p><p>${textoCosto}</p>`;
});

const selectorEstrellas = document.getElementById('selectorEstrellas');
const botonesEstrella = selectorEstrellas.querySelectorAll('button');
let calificacionElegida = 0;

botonesEstrella.forEach(boton => {
  boton.addEventListener('click', () => {
    calificacionElegida = parseInt(boton.dataset.valor);
    botonesEstrella.forEach(b => {
      b.classList.toggle('activa', parseInt(b.dataset.valor) <= calificacionElegida);
    });
  });
});

const rejillaResenas = document.getElementById('rejillaResenas');
const formResena = document.getElementById('formResena');

function crearTarjetaResena(datos) {
  const articulo = document.createElement('article');
  articulo.className = 'tarjeta-resena';
  const estrellas = '★'.repeat(datos.calificacion) + '☆'.repeat(5 - datos.calificacion);
  articulo.innerHTML = `<p class="estrellas">${estrellas}</p><p class="comentario">"${datos.comentario}"</p><p class="autor">— ${datos.nombre} sobre ${datos.tecnico}</p>`;
  return articulo;
}

function guardarResena(datos) {
  const guardadas = JSON.parse(localStorage.getItem('repatech_resenas') || '[]');
  guardadas.unshift(datos);
  localStorage.setItem('repatech_resenas', JSON.stringify(guardadas));
}

function cargarResenasGuardadas() {
  const guardadas = JSON.parse(localStorage.getItem('repatech_resenas') || '[]');
  guardadas.forEach(datos => {
    rejillaResenas.prepend(crearTarjetaResena(datos));
  });
}

cargarResenasGuardadas();

formResena.addEventListener('submit', evento => {
  evento.preventDefault();

  if (calificacionElegida === 0) {
    return;
  }

  const datos = {
    tecnico: document.getElementById('tecnicoResena').value,
    nombre: document.getElementById('nombreResena').value,
    comentario: document.getElementById('comentarioResena').value,
    calificacion: calificacionElegida
  };

  rejillaResenas.prepend(crearTarjetaResena(datos));
  guardarResena(datos);

  formResena.reset();
  botonesEstrella.forEach(b => b.classList.remove('activa'));
  calificacionElegida = 0;
});

const formContacto = document.getElementById('formContacto');
const mensajeConfirmacion = document.getElementById('mensajeConfirmacion');

formContacto.addEventListener('submit', evento => {
  evento.preventDefault();
  mensajeConfirmacion.classList.remove('oculto');
  formContacto.reset();
  mensajeConfirmacion.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
