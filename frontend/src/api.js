// Conexión con el backend (la API).
// - En tu computador (localhost) usa el servidor local.
// - Publicado en GitHub Pages usa el servidor en Render.
//   ⚠️ Si Render te da otra dirección, cámbiala aquí.
const enMiComputador = ['localhost', '127.0.0.1'].includes(window.location.hostname)
export const API_URL = enMiComputador ? 'http://localhost:3000' : 'https://repatech-api.onrender.com'

// Hace una petición a la API y devuelve la respuesta en JSON.
// Si algo falla, lanza un Error con un mensaje que se le puede mostrar al usuario.
export async function pedirAPI(ruta, opciones = {}) {
  let respuesta
  try {
    respuesta = await fetch(API_URL + ruta, {
      ...opciones,
      headers: { 'Content-Type': 'application/json', ...opciones.headers }
    })
  } catch {
    // fetch solo falla así cuando no hay internet o el servidor está apagado.
    throw new Error('No pudimos conectar con el servidor. Revisa tu internet e intenta de nuevo.')
  }

  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) {
    const error = new Error(datos.error || 'Algo salió mal, intenta de nuevo.')
    error.estado = respuesta.status // ej. 401 = sesión vencida
    throw error
  }
  return datos
}
