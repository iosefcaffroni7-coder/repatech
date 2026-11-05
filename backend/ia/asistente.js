// Asistente de IA de RepaTech.
// Usa la API gratuita de Google Gemini. La clave vive solo en el servidor
// (variable GEMINI_API_KEY) y nunca llega al navegador: por eso la IA
// se llama desde el backend y no directamente desde el frontend.
//
// Dos funciones:
// 1. responderChat: el chatbot de la página, para clientes.
// 2. redactarMensajeCliente: en el panel admin, escribe un mensaje de
//    WhatsApp listo para enviarle al cliente que pidió una visita.

const NEGOCIO = require('../negocio');

const URL_GEMINI = 'https://generativelanguage.googleapis.com/v1beta/models';

// "Personalidad" y conocimiento del negocio que recibe la IA en cada consulta.
function instruccionesDelNegocio() {
  const c = NEGOCIO.cobertura;
  const servicios = NEGOCIO.servicios.map(s => `- ${s.aparato}: ${s.problemas}`).join('\n');
  const tecnicos = NEGOCIO.tecnicos
    .map(t => `- ${t.nombre}: ${t.especialidad}, zona ${t.zona}, ${t.experiencia} años de experiencia, ${t.calificacion} estrellas`)
    .join('\n');

  return `Eres "Repi", el asistente virtual de ${NEGOCIO.nombre}. ${NEGOCIO.descripcion}

TONO DE MARCA: cercano, alegre y claro, como un vecino que sabe de tecnología. Tuteas al cliente,
usas español de Colombia, frases cortas y máximo un emoji por respuesta. Respondes en 2 a 4 frases.

SERVICIOS (lo que reparamos):
${servicios}

TÉCNICOS:
${tecnicos}

COBERTURA Y TRASLADO:
- Llegamos hasta ${c.kmMaximo} km desde nuestro punto de partida.
- Hasta ${c.kmGratis} km el traslado es gratis. Después cuesta $${c.costoBase.toLocaleString('es-CO')} COP más $${c.costoPorKmExtra.toLocaleString('es-CO')} COP por cada km extra.
- Tiempo de llegada aproximado: ${c.minutosBase} minutos más ${c.minutosPorKm} minutos por km.

HORARIO: ${NEGOCIO.horario}.
CONTACTO: WhatsApp ${NEGOCIO.whatsapp}, correo ${NEGOCIO.correo}.

REGLAS:
- Si el cliente cuenta una falla, da 1 o 2 posibles causas sencillas y recomienda al técnico indicado por nombre.
- No inventes precios de reparación: el técnico da el precio exacto después de revisar el aparato.
- Para agendar, invita a llenar el formulario "Pide tu visita" de la página.
- Si preguntan algo que no tiene que ver con reparación de aparatos o con ${NEGOCIO.nombre}, responde amablemente que solo puedes ayudar con eso.`;
}

// Modelo de respaldo, más liviano, por si el principal está saturado.
const MODELO_RESPALDO = 'gemini-3.5-flash-lite';

// Llama a un modelo de Gemini con un historial de mensajes y devuelve el texto.
async function llamarModelo(modelo, contenidos) {
  const respuesta = await fetch(`${URL_GEMINI}/${modelo}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: instruccionesDelNegocio() }] },
      contents: contenidos,
      generationConfig: { temperature: 0.7 }
    }),
    signal: AbortSignal.timeout(15000) // si tarda más de 15 s, se cancela
  });

  if (!respuesta.ok) {
    throw new Error(`Gemini (${modelo}) respondió ${respuesta.status}: ${await respuesta.text()}`);
  }

  const datos = await respuesta.json();
  const texto = datos.candidates?.[0]?.content?.parts?.map(p => p.text).join('').trim();
  if (!texto) throw new Error(`Gemini (${modelo}) devolvió una respuesta vacía`);
  return texto;
}

// Prueba primero con el modelo principal y, si falla (por ejemplo
// "mucha demanda"), con el de respaldo. Si los dos fallan, lanza el error
// para que se use la respuesta sin IA.
async function preguntarAGemini(contenidos) {
  const modelos = [process.env.GEMINI_MODELO || 'gemini-3.8-flash', MODELO_RESPALDO];
  let ultimoError;
  for (const modelo of modelos) {
    try {
      return await llamarModelo(modelo, contenidos);
    } catch (error) {
      console.error('Error de IA:', error.message);
      ultimoError = error;
    }
  }
  throw ultimoError;
}

// Plan B sin IA: si no hay clave o la IA no responde, el chat igual responde algo útil
// buscando palabras clave. Así la página nunca queda "muda" en una demostración.
function respuestaSinIA(pregunta) {
  const p = pregunta.toLowerCase();
  const tecnicoPara = palabra => NEGOCIO.tecnicos.find(t => t.especialidad.toLowerCase().includes(palabra));

  if (/celular|teléfono|telefono|iphone|android/.test(p)) {
    return `Para celulares te recomiendo a ${tecnicoPara('celulares').nombre}, es nuestro experto 📱. Llena el formulario "Pide tu visita" y te llamamos para confirmar la hora.`;
  }
  if (/laptop|portátil|portatil|computador|pc/.test(p)) {
    return `Para computadores te recomiendo a ${tecnicoPara('laptops').nombre}. Cuéntanos la falla en el formulario "Pide tu visita" y te contactamos.`;
  }
  if (/consola|play|xbox|nintendo|tv|televisor|pantalla/.test(p)) {
    return `Para consolas y pantallas el indicado es ${tecnicoPara('consolas').nombre} 🎮. Pide tu visita en el formulario y te llamamos.`;
  }
  if (/precio|cuesta|cobran|valor|cuánto|cuanto/.test(p)) {
    return `El traslado es gratis hasta ${NEGOCIO.cobertura.kmGratis} km. El precio de la reparación te lo da el técnico después de revisar tu aparato, sin compromiso.`;
  }
  if (/horario|hora|abren|domingo/.test(p)) {
    return `Atendemos ${NEGOCIO.horario}.`;
  }
  return `Soy Repi, el asistente de RepaTech 🔧. Cuéntame qué aparato se te dañó y qué le pasa, y te digo qué técnico te puede ayudar.`;
}

// historial: [{ rol: 'usuario' | 'asistente', texto: '...' }, ...]
async function responderChat(historial) {
  const ultimaPregunta = historial[historial.length - 1].texto;

  if (!process.env.GEMINI_API_KEY) {
    return respuestaSinIA(ultimaPregunta);
  }

  // Gemini usa los roles "user" y "model". Solo se envían los últimos 10
  // mensajes para que la consulta sea rápida y barata.
  // Gemini exige que la conversación empiece con un mensaje del usuario,
  // así que se quita el saludo inicial del asistente si viene al principio.
  const recientes = historial.slice(-10);
  while (recientes.length && recientes[0].rol !== 'usuario') recientes.shift();

  const contenidos = recientes.map(m => ({
    role: m.rol === 'usuario' ? 'user' : 'model',
    parts: [{ text: m.texto }]
  }));

  try {
    return await preguntarAGemini(contenidos);
  } catch {
    // Si la IA no responde, el cliente igual recibe una respuesta útil.
    return respuestaSinIA(ultimaPregunta);
  }
}

async function redactarMensajeCliente(solicitud) {
  const pedido = `Redacta un mensaje de WhatsApp corto (máximo 5 líneas) para el cliente ${solicitud.nombre},
que pidió una visita para reparar su ${solicitud.dispositivo} en ${solicitud.direccion}.
El problema que contó fue: "${solicitud.mensaje}".
Salúdalo por su nombre, confirma que recibimos su solicitud, recomienda al técnico más indicado
para ese aparato y pregúntale qué día y hora le queda bien. Firma como "Equipo RepaTech".
Devuelve solo el mensaje, sin explicaciones.`;

  // Mensaje de plantilla, por si no hay IA disponible.
  const tecnico = NEGOCIO.tecnicos.find(t => t.especialidad.toLowerCase().includes(solicitud.dispositivo.toLowerCase().split(' ')[0])) || NEGOCIO.tecnicos[0];
  const aparato = solicitud.dispositivo.toLowerCase().replace('pc', 'PC').replace('tv', 'TV');
  const plantilla = `¡Hola ${solicitud.nombre}! Recibimos tu solicitud para reparar tu ${aparato}. ` +
    `${tecnico.nombre} es quien mejor te puede ayudar con ese caso. ¿Qué día y a qué hora te queda bien la visita?` +
    `\n— Equipo RepaTech`;

  if (!process.env.GEMINI_API_KEY) return plantilla;

  try {
    return await preguntarAGemini([{ role: 'user', parts: [{ text: pedido }] }]);
  } catch {
    return plantilla;
  }
}

module.exports = { responderChat, redactarMensajeCliente };
