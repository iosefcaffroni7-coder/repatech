// Chatbot "Repi": la burbuja de ayuda de la esquina.
// El navegador NO habla directamente con la IA: le envía la conversación
// a nuestro backend (/api/chat), que es quien tiene la clave secreta de Gemini
// y le explica a la IA cómo es el negocio.

const chatBurbuja = document.getElementById('chatBurbuja');
const chatVentana = document.getElementById('chatVentana');
const chatCerrar = document.getElementById('chatCerrar');
const chatMensajes = document.getElementById('chatMensajes');
const chatFormulario = document.getElementById('chatFormulario');
const chatEntrada = document.getElementById('chatEntrada');
const chatSugerencias = document.getElementById('chatSugerencias');

// Toda la conversación se guarda aquí y se envía completa en cada pregunta,
// así la IA "recuerda" lo que se habló antes.
const historial = [];
let esperandoRespuesta = false;

function abrirChat(abrir) {
  chatVentana.hidden = !abrir;
  chatBurbuja.setAttribute('aria-expanded', abrir);
  chatBurbuja.classList.toggle('oculto', abrir);
  if (abrir) {
    if (historial.length === 0) {
      agregarMensaje('asistente', '¡Hola! Soy Repi 🔧 Cuéntame qué aparato se te dañó y te digo qué técnico te puede ayudar.');
    }
    chatEntrada.focus();
  }
}

chatBurbuja.addEventListener('click', () => abrirChat(true));
chatCerrar.addEventListener('click', () => abrirChat(false));

// Pinta una burbuja de mensaje. Se usa textContent para que el texto
// de la IA o del usuario nunca se interprete como HTML.
function agregarMensaje(rol, texto, extraClase = '') {
  const burbuja = document.createElement('p');
  burbuja.className = `mensaje mensaje-${rol} ${extraClase}`;
  burbuja.textContent = texto;
  chatMensajes.append(burbuja);
  chatMensajes.scrollTop = chatMensajes.scrollHeight;
  if (rol !== 'error') historial.push({ rol, texto });
  return burbuja;
}

async function enviarPregunta(texto) {
  texto = texto.trim();
  if (!texto || esperandoRespuesta) return;

  esperandoRespuesta = true;
  chatSugerencias.classList.add('oculto'); // las sugerencias solo se muestran al inicio
  agregarMensaje('usuario', texto);
  chatEntrada.value = '';

  // Estado de carga: tres puntitos animados mientras responde la IA.
  const escribiendo = document.createElement('p');
  escribiendo.className = 'mensaje mensaje-asistente escribiendo';
  escribiendo.setAttribute('aria-label', 'Repi está escribiendo');
  escribiendo.innerHTML = '<span></span><span></span><span></span>';
  chatMensajes.append(escribiendo);
  chatMensajes.scrollTop = chatMensajes.scrollHeight;

  try {
    const datos = await pedirAPI('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ historial })
    });
    escribiendo.remove();
    agregarMensaje('asistente', datos.respuesta);
  } catch (error) {
    escribiendo.remove();
    agregarMensaje('error', error.message, 'mensaje-asistente');
    historial.pop(); // la pregunta sin respuesta no se envía en el próximo intento
  } finally {
    esperandoRespuesta = false;
    chatEntrada.focus();
  }
}

chatFormulario.addEventListener('submit', evento => {
  evento.preventDefault();
  enviarPregunta(chatEntrada.value);
});

chatSugerencias.querySelectorAll('button').forEach(boton => {
  boton.addEventListener('click', () => enviarPregunta(boton.textContent));
});
