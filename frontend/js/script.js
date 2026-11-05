// Lógica de la página principal de RepaTech.
// Secciones: 1) navegación entre vistas, 2) filtro de técnicos,
// 3) calculadora de cobertura, 4) reseñas (API), 5) formulario de contacto (API).

/* ---------- 1. Navegación entre vistas ---------- */
// La página muestra una sección a la vez (como una app) con una animación
// de salida y de entrada, en vez de un scroll larguísimo.

const botonMenu = document.getElementById('botonMenu');
const navPrincipal = document.getElementById('navPrincipal');
const enlacesNav = document.querySelectorAll('.nav a[data-vista]');
const main = document.querySelector('main');

botonMenu.addEventListener('click', () => {
  const abierto = navPrincipal.classList.toggle('abierto');
  botonMenu.setAttribute('aria-expanded', abierto);
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
    // Doble requestAnimationFrame: espera a que el navegador pinte la vista
    // con opacidad 0 antes de pasarla a 1, si no la animación no se ve.
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
    }, 320); // mismo tiempo que la transición en el CSS
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

/* ---------- 2. Filtro de técnicos ---------- */

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

// Al tocar un aparato en "Servicios" se abre la vista de técnicos ya filtrada.
document.querySelectorAll('.tarjeta-servicio').forEach(tarjeta => {
  tarjeta.addEventListener('click', () => {
    mostrarVista('tecnicos');
    filtrarTecnicos(tarjeta.dataset.dispositivo);
  });
});

/* ---------- 3. Calculadora de cobertura ---------- */
// Se calcula en el navegador porque es una fórmula simple y no necesita datos del servidor.

const formCobertura = document.getElementById('formCobertura');
const resultadoCobertura = document.getElementById('resultadoCobertura');
const KM_MAXIMO = 15;

formCobertura.addEventListener('submit', evento => {
  evento.preventDefault();
  const km = parseFloat(document.getElementById('distancia').value);
  resultadoCobertura.classList.remove('oculto', 'aviso');

  if (isNaN(km) || km < 0) {
    resultadoCobertura.classList.add('aviso');
    resultadoCobertura.innerHTML = '<h4>Revisa la distancia</h4><p>Escribe un número de kilómetros, por ejemplo 4.5</p>';
    return;
  }

  if (km > KM_MAXIMO) {
    resultadoCobertura.classList.add('aviso');
    resultadoCobertura.innerHTML = `<h4>Uy, todavía no llegamos hasta allá</h4><p>Por ahora cubrimos hasta ${KM_MAXIMO} km desde nuestro punto de partida. Escríbenos y vemos si podemos hacer una excepción.</p>`;
    return;
  }

  const tiempo = Math.round(15 + km * 3);
  const costo = km <= 2 ? 0 : Math.round(15000 + (km - 2) * 6000);
  const textoCosto = costo === 0
    ? 'Traslado sin costo'
    : `Costo de traslado aprox. $${costo.toLocaleString('es-CO')} COP`;

  resultadoCobertura.innerHTML = `<h4>¡Sí llegamos!</h4><p>Tiempo estimado de llegada: ${tiempo} minutos</p><p>${textoCosto}</p>`;
});

/* ---------- 4. Reseñas (se guardan en el backend) ---------- */

const rejillaResenas = document.getElementById('rejillaResenas');
const formResena = document.getElementById('formResena');
const avisoResena = document.getElementById('avisoResena');
const botonesEstrella = document.querySelectorAll('#selectorEstrellas button');
let calificacionElegida = 0;

botonesEstrella.forEach(boton => {
  boton.addEventListener('click', () => {
    calificacionElegida = parseInt(boton.dataset.valor);
    botonesEstrella.forEach(b => {
      b.classList.toggle('activa', parseInt(b.dataset.valor) <= calificacionElegida);
    });
  });
});

// Crea la tarjeta con textContent (y no con innerHTML) para que si alguien
// escribe código HTML en su comentario, se muestre como texto y no se ejecute.
function crearTarjetaResena(resena) {
  const articulo = document.createElement('article');
  articulo.className = 'tarjeta-resena';

  const estrellas = document.createElement('p');
  estrellas.className = 'estrellas';
  estrellas.textContent = '★'.repeat(resena.calificacion) + '☆'.repeat(5 - resena.calificacion);

  const comentario = document.createElement('p');
  comentario.className = 'comentario';
  comentario.textContent = `"${resena.comentario}"`;

  const autor = document.createElement('p');
  autor.className = 'autor';
  autor.textContent = `— ${resena.nombre} sobre ${resena.tecnico}`;

  articulo.append(estrellas, comentario, autor);
  return articulo;
}

async function cargarResenas() {
  rejillaResenas.innerHTML = '<p class="estado-carga">Cargando reseñas...</p>';
  try {
    const resenas = await pedirAPI('/api/resenas');
    rejillaResenas.innerHTML = '';
    if (resenas.length === 0) {
      rejillaResenas.innerHTML = '<p class="estado-carga">Todavía no hay reseñas, ¡sé el primero!</p>';
    }
    resenas.forEach(resena => rejillaResenas.append(crearTarjetaResena(resena)));
  } catch (error) {
    rejillaResenas.innerHTML = `<p class="estado-carga estado-error">${error.message} <button type="button" class="boton-texto" id="reintentarResenas">Reintentar</button></p>`;
    document.getElementById('reintentarResenas').addEventListener('click', cargarResenas);
  }
}

cargarResenas();

formResena.addEventListener('submit', async evento => {
  evento.preventDefault();

  if (calificacionElegida === 0) {
    mostrarAviso(avisoResena, 'Toca las estrellas para darle una calificación al técnico.', 'error');
    return;
  }

  const boton = formResena.querySelector('button[type="submit"]');
  botonCargando(boton, true, 'Publicando...');
  avisoResena.classList.add('oculto');

  try {
    const resena = await pedirAPI('/api/resenas', {
      method: 'POST',
      body: JSON.stringify({
        tecnico: document.getElementById('tecnicoResena').value,
        nombre: document.getElementById('nombreResena').value,
        comentario: document.getElementById('comentarioResena').value,
        calificacion: calificacionElegida
      })
    });

    rejillaResenas.querySelector('.estado-carga')?.remove();
    rejillaResenas.prepend(crearTarjetaResena(resena));
    formResena.reset();
    botonesEstrella.forEach(b => b.classList.remove('activa'));
    calificacionElegida = 0;
    mostrarAviso(avisoResena, '¡Gracias! Tu reseña ya está publicada.');
  } catch (error) {
    mostrarAviso(avisoResena, error.message, 'error');
  } finally {
    botonCargando(boton, false);
  }
});

/* ---------- 5. Formulario de contacto (se guarda en el backend) ---------- */

const formContacto = document.getElementById('formContacto');
const avisoContacto = document.getElementById('avisoContacto');
const campoTelefono = document.getElementById('telefonoContacto');

// Validación en vivo: el teléfono solo acepta números y se marca en rojo si no tiene 10 dígitos.
campoTelefono.addEventListener('input', () => {
  campoTelefono.value = campoTelefono.value.replace(/\D/g, '').slice(0, 10);
  const valido = campoTelefono.value.length === 10;
  campoTelefono.setCustomValidity(valido ? '' : 'El teléfono debe tener 10 dígitos');
});

formContacto.addEventListener('submit', async evento => {
  evento.preventDefault();
  const boton = formContacto.querySelector('button[type="submit"]');
  botonCargando(boton, true, 'Enviando solicitud...');
  avisoContacto.classList.add('oculto');

  try {
    const datos = await pedirAPI('/api/solicitudes', {
      method: 'POST',
      body: JSON.stringify({
        nombre: document.getElementById('nombreContacto').value,
        telefono: campoTelefono.value,
        direccion: document.getElementById('direccionContacto').value,
        dispositivo: document.getElementById('dispositivoContacto').value,
        mensaje: document.getElementById('mensajeContacto').value
      })
    });
    mostrarAviso(avisoContacto, datos.mensaje);
    formContacto.reset();
  } catch (error) {
    mostrarAviso(avisoContacto, error.message, 'error');
  } finally {
    botonCargando(boton, false);
    avisoContacto.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});
