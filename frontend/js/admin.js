// Lógica del panel de administrador.
// 1) Login: envía usuario y clave, el backend devuelve un token.
// 2) El token se guarda en sessionStorage (se borra al cerrar la pestaña)
//    y se manda en cada petición privada en el encabezado Authorization.
// 3) Con el token se listan, actualizan y borran solicitudes y reseñas.

const vistaLogin = document.getElementById('vistaLogin');
const vistaPanel = document.getElementById('vistaPanel');
const formLogin = document.getElementById('formLogin');
const avisoLogin = document.getElementById('avisoLogin');
const botonSalir = document.getElementById('botonSalir');
const listaSolicitudes = document.getElementById('listaSolicitudes');
const listaResenas = document.getElementById('listaResenas');
const filtroEstado = document.getElementById('filtroEstado');

let solicitudes = [];
let resenas = [];

/* ---------- Sesión ---------- */

function leerToken() {
  return sessionStorage.getItem('repatech_token');
}

// Igual que pedirAPI, pero agrega el token. Si el servidor dice 401
// (token vencido, por ejemplo porque el servidor se reinició) se vuelve al login.
async function pedirAPIAdmin(ruta, opciones = {}) {
  try {
    return await pedirAPI(ruta, {
      ...opciones,
      headers: { Authorization: `Bearer ${leerToken()}` }
    });
  } catch (error) {
    if (error.estado === 401) cerrarSesion(error.message);
    throw error;
  }
}

function mostrarPanel(mostrar) {
  vistaLogin.classList.toggle('oculto', mostrar);
  vistaPanel.classList.toggle('oculto', !mostrar);
  botonSalir.classList.toggle('oculto', !mostrar);
  if (mostrar) cargarTodo();
}

function cerrarSesion(motivo) {
  sessionStorage.removeItem('repatech_token');
  mostrarPanel(false);
  if (motivo) mostrarAviso(avisoLogin, motivo, 'error');
}

formLogin.addEventListener('submit', async evento => {
  evento.preventDefault();
  const boton = formLogin.querySelector('button');
  botonCargando(boton, true, 'Entrando...');
  avisoLogin.classList.add('oculto');

  try {
    const datos = await pedirAPI('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        usuario: document.getElementById('usuario').value,
        clave: document.getElementById('clave').value
      })
    });
    sessionStorage.setItem('repatech_token', datos.token);
    formLogin.reset();
    mostrarPanel(true);
  } catch (error) {
    mostrarAviso(avisoLogin, error.message, 'error');
  } finally {
    botonCargando(boton, false);
  }
});

botonSalir.addEventListener('click', async () => {
  pedirAPIAdmin('/api/admin/logout', { method: 'POST' }).catch(() => {});
  cerrarSesion();
});

/* ---------- Pestañas ---------- */

document.querySelectorAll('[data-pestana]').forEach(boton => {
  boton.addEventListener('click', () => {
    document.querySelectorAll('[data-pestana]').forEach(b => b.classList.toggle('activo', b === boton));
    document.getElementById('pestanaSolicitudes').classList.toggle('oculto', boton.dataset.pestana !== 'solicitudes');
    document.getElementById('pestanaResenas').classList.toggle('oculto', boton.dataset.pestana !== 'resenas');
  });
});

/* ---------- Cargar datos ---------- */

async function cargarTodo() {
  listaSolicitudes.innerHTML = '<p class="estado-carga">Cargando solicitudes...</p>';
  listaResenas.innerHTML = '<p class="estado-carga">Cargando reseñas...</p>';
  try {
    // Las dos peticiones se hacen al mismo tiempo para que cargue más rápido.
    [solicitudes, resenas] = await Promise.all([
      pedirAPIAdmin('/api/admin/solicitudes'),
      pedirAPI('/api/resenas')
    ]);
    pintarSolicitudes();
    pintarResenas();
  } catch (error) {
    listaSolicitudes.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'estado-carga estado-error';
    p.textContent = error.message;
    listaSolicitudes.append(p);
  }
}

function actualizarResumen() {
  document.getElementById('totalPendientes').textContent = solicitudes.filter(s => s.estado === 'pendiente').length;
  document.getElementById('totalAtendidas').textContent = solicitudes.filter(s => s.estado === 'atendida').length;
  document.getElementById('totalResenas').textContent = resenas.length;
}

function formatearFecha(iso) {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

// Atajo para crear un elemento con clase y texto (siempre textContent, nunca HTML).
function crear(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

/* ---------- Solicitudes ---------- */

function pintarSolicitudes() {
  actualizarResumen();
  listaSolicitudes.innerHTML = '';

  const filtro = filtroEstado.value;
  const visibles = solicitudes.filter(s => filtro === 'todas' || s.estado === filtro);

  if (visibles.length === 0) {
    listaSolicitudes.append(crear('p', 'estado-carga', 'No hay solicitudes por aquí todavía.'));
    return;
  }

  visibles.forEach(s => listaSolicitudes.append(crearTarjetaSolicitud(s)));
}

filtroEstado.addEventListener('change', pintarSolicitudes);

function crearTarjetaSolicitud(s) {
  const tarjeta = crear('article', `tarjeta-admin estado-${s.estado}`);

  const cabecera = crear('div', 'tarjeta-admin-cabecera');
  cabecera.append(crear('h3', '', s.nombre), crear('span', `insignia insignia-${s.estado}`, s.estado));

  const detalles = crear('p', 'meta-admin', `${s.dispositivo} · ${s.direccion} · Tel. ${s.telefono} · ${formatearFecha(s.fecha)}`);
  const mensaje = crear('p', 'mensaje-cliente', `"${s.mensaje}"`);

  const acciones = crear('div', 'acciones-admin');
  const botonEstado = crear('button', 'boton boton-secundario boton-chico',
    s.estado === 'pendiente' ? 'Marcar atendida' : 'Volver a pendiente');
  const botonIA = crear('button', 'boton boton-primario boton-chico', '✨ Redactar mensaje con IA');
  const botonBorrar = crear('button', 'boton boton-peligro boton-chico', 'Borrar');
  [botonEstado, botonIA, botonBorrar].forEach(b => { b.type = 'button'; });
  acciones.append(botonEstado, botonIA, botonBorrar);

  const cajaIA = crear('div', 'caja-ia oculto');

  botonEstado.addEventListener('click', () => cambiarEstado(s, botonEstado));
  botonIA.addEventListener('click', () => redactarConIA(s, botonIA, cajaIA));
  botonBorrar.addEventListener('click', () => borrarSolicitud(s, botonBorrar));

  tarjeta.append(cabecera, detalles, mensaje, acciones, cajaIA);
  return tarjeta;
}

async function cambiarEstado(solicitud, boton) {
  const nuevoEstado = solicitud.estado === 'pendiente' ? 'atendida' : 'pendiente';
  botonCargando(boton, true, 'Guardando...');
  try {
    const actualizada = await pedirAPIAdmin(`/api/admin/solicitudes/${solicitud.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: nuevoEstado })
    });
    solicitud.estado = actualizada.estado;
    pintarSolicitudes();
  } catch (error) {
    botonCargando(boton, false);
    alert(error.message);
  }
}

async function borrarSolicitud(solicitud, boton) {
  if (!confirm(`¿Borrar la solicitud de ${solicitud.nombre}? Esto no se puede deshacer.`)) return;
  botonCargando(boton, true, 'Borrando...');
  try {
    await pedirAPIAdmin(`/api/admin/solicitudes/${solicitud.id}`, { method: 'DELETE' });
    solicitudes = solicitudes.filter(s => s.id !== solicitud.id);
    pintarSolicitudes();
  } catch (error) {
    botonCargando(boton, false);
    alert(error.message);
  }
}

// La IA escribe un mensaje de WhatsApp listo para enviar al cliente.
async function redactarConIA(solicitud, boton, caja) {
  botonCargando(boton, true, 'La IA está escribiendo...');
  try {
    const { texto } = await pedirAPIAdmin(`/api/admin/solicitudes/${solicitud.id}/mensaje-ia`, { method: 'POST' });

    caja.innerHTML = '';
    const areaTexto = crear('textarea', 'texto-ia');
    areaTexto.value = texto; // se puede editar antes de enviarlo
    areaTexto.rows = 5;

    const botonCopiar = crear('button', 'boton boton-secundario boton-chico', 'Copiar');
    botonCopiar.type = 'button';
    botonCopiar.addEventListener('click', async () => {
      await navigator.clipboard.writeText(areaTexto.value);
      botonCopiar.textContent = '¡Copiado!';
      setTimeout(() => { botonCopiar.textContent = 'Copiar'; }, 1500);
    });

    // wa.me abre WhatsApp con el mensaje escrito. 57 = código de Colombia.
    const enlaceWhatsApp = crear('a', 'boton boton-primario boton-chico', 'Abrir en WhatsApp');
    enlaceWhatsApp.target = '_blank';
    enlaceWhatsApp.rel = 'noopener';
    const actualizarEnlace = () => {
      enlaceWhatsApp.href = `https://wa.me/57${solicitud.telefono}?text=${encodeURIComponent(areaTexto.value)}`;
    };
    actualizarEnlace();
    areaTexto.addEventListener('input', actualizarEnlace);

    const filaBotones = crear('div', 'acciones-admin');
    filaBotones.append(botonCopiar, enlaceWhatsApp);
    caja.append(crear('p', 'titulo-ia', 'Mensaje sugerido por la IA (puedes editarlo):'), areaTexto, filaBotones);
    caja.classList.remove('oculto');
  } catch (error) {
    caja.innerHTML = '';
    caja.append(crear('p', 'estado-error', error.message));
    caja.classList.remove('oculto');
  } finally {
    botonCargando(boton, false);
  }
}

/* ---------- Reseñas ---------- */

function pintarResenas() {
  actualizarResumen();
  listaResenas.innerHTML = '';

  if (resenas.length === 0) {
    listaResenas.append(crear('p', 'estado-carga', 'No hay reseñas publicadas.'));
    return;
  }

  resenas.forEach(r => {
    const tarjeta = crear('article', 'tarjeta-admin');
    const cabecera = crear('div', 'tarjeta-admin-cabecera');
    cabecera.append(
      crear('h3', '', `${r.nombre} sobre ${r.tecnico}`),
      crear('span', 'estrellas', '★'.repeat(r.calificacion) + '☆'.repeat(5 - r.calificacion))
    );
    const comentario = crear('p', 'mensaje-cliente', `"${r.comentario}"`);
    const botonBorrar = crear('button', 'boton boton-peligro boton-chico', 'Borrar reseña');
    botonBorrar.type = 'button';
    botonBorrar.addEventListener('click', () => borrarResena(r, botonBorrar));
    const acciones = crear('div', 'acciones-admin');
    acciones.append(botonBorrar);
    tarjeta.append(cabecera, comentario, acciones);
    listaResenas.append(tarjeta);
  });
}

async function borrarResena(resena, boton) {
  if (!confirm(`¿Borrar la reseña de ${resena.nombre}?`)) return;
  botonCargando(boton, true, 'Borrando...');
  try {
    await pedirAPIAdmin(`/api/admin/resenas/${resena.id}`, { method: 'DELETE' });
    resenas = resenas.filter(r => r.id !== resena.id);
    pintarResenas();
  } catch (error) {
    botonCargando(boton, false);
    alert(error.message);
  }
}

/* ---------- Inicio ---------- */
// Si ya había una sesión abierta en esta pestaña, se entra directo al panel.
mostrarPanel(Boolean(leerToken()));
