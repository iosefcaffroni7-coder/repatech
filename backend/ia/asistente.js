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
const Servicio = require('../modelos/Servicio');
const Tecnico = require('../modelos/Tecnico');
const Cobertura = require('../modelos/Cobertura');

const URL_GEMINI = 'https://generativelanguage.googleapis.com/v1beta/models';

// Lee de MongoDB los servicios, técnicos y la cobertura actuales.
// Así, si el administrador agrega un técnico o un descuento en el panel, la IA ya lo sabe.
async function cargarCatalogo() {
  const [servicios, tecnicos, cobertura] = await Promise.all([
    Servicio.find(), Tecnico.find(), Cobertura.findOne()
  ]);
  return { servicios, tecnicos, cobertura: cobertura || NEGOCIO.coberturaInicial };
}

// Nombres de los servicios de un técnico: ["celular", "tablet"] -> "Celulares, Tablets"
function especialidad(tecnico, servicios) {
  return servicios.filter(s => tecnico.servicios.includes(s.clave)).map(s => s.nombre).join(', ') || 'varios aparatos';
}

// Texto del descuento activo, o vacío si el precio está normal.
function textoDescuento(cobertura) {
  const d = cobertura.descuento;
  return d && d.activo ? `${d.porcentaje}% de descuento en el traslado por ${d.motivo}` : '';
}

// "Personalidad" y conocimiento del negocio que recibe la IA en cada consulta.
function instruccionesDelNegocio({ servicios, tecnicos, cobertura: c }) {
  const listaServicios = servicios.map(s => `- ${s.nombre}: ${s.descripcion}`).join('\n');
  const listaTecnicos = tecnicos
    .map(t => `- ${t.nombre}: ${especialidad(t, servicios)}, zona ${t.zona}, ${t.experiencia} años de experiencia, ${t.calificacion} estrellas`)
    .join('\n');
  const descuento = textoDescuento(c);

  return `Eres "Repi", el asistente virtual de ${NEGOCIO.nombre}. ${NEGOCIO.descripcion}

TONO DE MARCA: cercano, alegre y claro, como un vecino que sabe de tecnología. Tuteas al cliente,
usas español de Colombia, frases cortas y sin emojis. Respondes en 2 a 4 frases.

SERVICIOS (lo que reparamos):
${listaServicios}

TÉCNICOS:
${listaTecnicos}

COBERTURA Y TRASLADO:
- Llegamos hasta ${c.kmMaximo} km desde nuestro punto de partida.
- Hasta ${c.kmGratis} km el traslado es gratis. Después cuesta $${c.costoBase.toLocaleString('es-CO')} COP más $${c.costoPorKmExtra.toLocaleString('es-CO')} COP por cada km extra.
- Tiempo de llegada aproximado: ${c.minutosBase} minutos más ${c.minutosPorKm} minutos por km.
${descuento ? `- PROMOCIÓN ACTIVA: ${descuento}. Menciónala cuando pregunten por precios o por el traslado.` : '- No hay promociones activas en este momento: no inventes descuentos.'}

HORARIO: ${NEGOCIO.horario}.
CONTACTO: WhatsApp ${NEGOCIO.whatsapp}, correo ${NEGOCIO.correo}.

REGLAS:
- Si el cliente cuenta una falla, da 1 o 2 posibles causas sencillas y recomienda al técnico indicado por nombre.
- Solo reparamos los servicios de la lista. Si piden otro aparato, dilo con amabilidad.
- No inventes precios de reparación: el técnico da el precio exacto después de revisar el aparato.
- Para agendar, invita a llenar el formulario "Pide tu visita" de la página.
- Si preguntan algo que no tiene que ver con reparación de aparatos o con ${NEGOCIO.nombre}, responde amablemente que solo puedes ayudar con eso.`;
}

// Modelo de respaldo, más liviano, por si el principal está saturado.
const MODELO_RESPALDO = 'gemini-3.5-flash-lite';

// Llama a un modelo de Gemini con un historial de mensajes y devuelve el texto.
async function llamarModelo(modelo, contenidos, instrucciones) {
  const respuesta = await fetch(`${URL_GEMINI}/${modelo}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: instrucciones }] },
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
async function preguntarAGemini(contenidos, instrucciones) {
  const modelos = [process.env.GEMINI_MODELO || 'gemini-3.8-flash', MODELO_RESPALDO];
  let ultimoError;
  for (const modelo of modelos) {
    try {
      return await llamarModelo(modelo, contenidos, instrucciones);
    } catch (error) {
      console.error('Error de IA:', error.message);
      ultimoError = error;
    }
  }
  throw ultimoError;
}

// Plan B sin IA: si no hay clave o la IA no responde, el chat igual responde algo útil
// buscando palabras clave. Así la página nunca queda "muda" en una demostración.
function respuestaSinIA(pregunta, catalogo) {
  const p = pregunta.toLowerCase();
  const { servicios, tecnicos, cobertura } = catalogo;
  // Busca el primer técnico que repare alguno de esos servicios.
  const tecnicoPara = (...claves) => tecnicos.find(t => t.servicios.some(c => claves.includes(c)));
  const recomendar = (tecnico, aparato) => tecnico
    ? `Para ${aparato} te recomiendo a ${tecnico.nombre}. Llena el formulario "Pide tu visita" y te llamamos para confirmar la hora.`
    : `Cuéntanos qué le pasa a tu aparato en el formulario "Pide tu visita" y te llamamos.`;

  if (/celular|teléfono|telefono|iphone|android/.test(p)) return recomendar(tecnicoPara('celular'), 'celulares');
  if (/laptop|portátil|portatil|computador|pc/.test(p)) return recomendar(tecnicoPara('laptop', 'pc'), 'computadores');
  if (/consola|play|xbox|nintendo|tv|televisor|pantalla/.test(p)) return recomendar(tecnicoPara('consola', 'tv'), 'consolas y pantallas');
  if (/precio|cuesta|cobran|valor|cuánto|cuanto|traslado|descuento|promo/.test(p)) {
    const descuento = textoDescuento(cobertura);
    return `El traslado es gratis hasta ${cobertura.kmGratis} km.${descuento ? ` Además, ahora tenemos ${descuento}.` : ''} ` +
      'El precio de la reparación te lo da el técnico después de revisar tu aparato, sin compromiso.';
  }
  if (/horario|hora|abren|domingo/.test(p)) return `Atendemos ${NEGOCIO.horario}.`;
  if (/qué reparan|que reparan|servicios/.test(p)) return `Reparamos: ${servicios.map(s => s.nombre).join(', ')}.`;
  return 'Soy Repi, el asistente de RepaTech. Cuéntame qué aparato se te dañó y qué le pasa, y te digo qué técnico te puede ayudar.';
}

// historial: [{ rol: 'usuario' | 'asistente', texto: '...' }, ...]
async function responderChat(historial) {
  const ultimaPregunta = historial[historial.length - 1].texto;
  const catalogo = await cargarCatalogo();

  if (!process.env.GEMINI_API_KEY) {
    return respuestaSinIA(ultimaPregunta, catalogo);
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
    return await preguntarAGemini(contenidos, instruccionesDelNegocio(catalogo));
  } catch {
    // Si la IA no responde, el cliente igual recibe una respuesta útil.
    return respuestaSinIA(ultimaPregunta, catalogo);
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
  const catalogo = await cargarCatalogo();
  const servicio = catalogo.servicios.find(s => s.nombre === solicitud.dispositivo);
  const tecnico = (servicio && catalogo.tecnicos.find(t => t.servicios.includes(servicio.clave))) || catalogo.tecnicos[0];
  const quien = tecnico ? `${tecnico.nombre} es quien mejor te puede ayudar con ese caso.` : 'Uno de nuestros técnicos te va a ayudar.';
  const plantilla = `¡Hola ${solicitud.nombre}! Recibimos tu solicitud para reparar tu equipo (${solicitud.dispositivo}). ` +
    `${quien} ¿Qué día y a qué hora te queda bien la visita?` +
    `\n— Equipo RepaTech`;

  if (!process.env.GEMINI_API_KEY) return plantilla;

  try {
    return await preguntarAGemini([{ role: 'user', parts: [{ text: pedido }] }], instruccionesDelNegocio(catalogo));
  } catch {
    return plantilla;
  }
}

module.exports = { responderChat, redactarMensajeCliente };
