// Funciones compartidas para hablar con el backend.
// Las usan la página principal (script.js), el chat (chat.js) y el panel (admin.js),
// así el manejo de errores y de carga se escribe una sola vez.

// Hace una petición a la API y devuelve la respuesta en JSON.
// Si algo falla, lanza un Error con un mensaje que se le puede mostrar al usuario.
async function pedirAPI(ruta, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(API_URL + ruta, {
      ...opciones,
      headers: { 'Content-Type': 'application/json', ...opciones.headers }
    });
  } catch {
    // fetch solo falla así cuando no hay conexión o el servidor está apagado.
    throw new Error('No pudimos conectar con el servidor. Revisa tu internet e intenta de nuevo.');
  }

  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    const error = new Error(datos.error || 'Algo salió mal, intenta de nuevo.');
    error.estado = respuesta.status; // ej. 401 = sesión vencida
    throw error;
  }
  return datos;
}

// Pone un botón en modo "cargando" (deshabilitado y con otro texto) o lo devuelve a la normalidad.
// El servidor gratuito de Render se "duerme" y puede tardar en despertar,
// por eso si pasan 6 segundos se le avisa al usuario que espere un poco más.
function botonCargando(boton, cargando, texto = 'Enviando...') {
  if (cargando) {
    boton.dataset.textoOriginal = boton.textContent;
    boton.textContent = texto;
    boton.disabled = true;
    boton.classList.add('cargando');
    boton.dataset.temporizador = setTimeout(() => {
      boton.textContent = 'Despertando el servidor...';
    }, 6000);
  } else {
    clearTimeout(boton.dataset.temporizador);
    boton.textContent = boton.dataset.textoOriginal;
    boton.disabled = false;
    boton.classList.remove('cargando');
  }
}

// Muestra un mensaje de éxito o de error debajo de un formulario.
function mostrarAviso(elemento, texto, tipo = 'exito') {
  elemento.textContent = texto;
  elemento.classList.remove('oculto', 'aviso-exito', 'aviso-error');
  elemento.classList.add(tipo === 'exito' ? 'aviso-exito' : 'aviso-error');
}
