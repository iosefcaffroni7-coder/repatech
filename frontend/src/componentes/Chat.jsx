// Chatbot "Repi": la burbuja de ayuda de la esquina.
// El navegador NO habla directamente con la IA: le envía la conversación
// a nuestro backend (/api/chat), que es quien tiene la clave secreta de Gemini
// y le explica a la IA cómo es el negocio.
import { useEffect, useRef, useState } from 'react'
import { pedirAPI } from '../api.js'
import logo from '../assets/logo.svg'

const saludo = { rol: 'asistente', texto: '¡Hola! Soy Repi. Cuéntame qué aparato se te dañó y te digo qué técnico te puede ayudar.' }
const sugerencias = ['Se me mojó el celular', '¿Cuánto cobran el traslado?', '¿Quién arregla consolas?']

function Chat() {
  const [abierto, setAbierto] = useState(false)
  // Toda la conversación. Se envía completa en cada pregunta para que la IA "recuerde".
  const [mensajes, setMensajes] = useState([saludo])
  const [texto, setTexto] = useState('')
  const [esperando, setEsperando] = useState(false)
  const [error, setError] = useState('')
  const finalRef = useRef(null)

  // Cada vez que llega un mensaje, baja hasta el final de la conversación.
  useEffect(() => {
    finalRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, esperando, error])

  async function enviarPregunta(pregunta) {
    pregunta = pregunta.trim()
    if (!pregunta || esperando) return

    const conPregunta = [...mensajes, { rol: 'usuario', texto: pregunta }]
    setMensajes(conPregunta)
    setTexto('')
    setError('')
    setEsperando(true)

    try {
      const datos = await pedirAPI('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ historial: conPregunta })
      })
      setMensajes([...conPregunta, { rol: 'asistente', texto: datos.respuesta }])
    } catch (e) {
      setError(e.message)
      setMensajes(mensajes) // se quita la pregunta sin respuesta para poder intentar de nuevo
      setTexto(pregunta)
    } finally {
      setEsperando(false)
    }
  }

  function alEnviar(evento) {
    evento.preventDefault()
    enviarPregunta(texto)
  }

  if (!abierto) {
    return (
      <button className="chat-burbuja" aria-label="Abrir asistente de RepaTech" onClick={() => setAbierto(true)}>
        <img src={logo} alt="" width="30" />
        <span>¿Te ayudo?</span>
      </button>
    )
  }

  return (
    <section className="chat-ventana" aria-label="Asistente de RepaTech">
      <header className="chat-cabecera">
        <div>
          <strong>Repi</strong>
          <span>Asistente con IA de RepaTech</span>
        </div>
        <button type="button" aria-label="Cerrar asistente" onClick={() => setAbierto(false)}>✕</button>
      </header>

      <div className="chat-mensajes" aria-live="polite">
        {mensajes.map((mensaje, indice) => (
          <p key={indice} className={`mensaje mensaje-${mensaje.rol}`}>{mensaje.texto}</p>
        ))}

        {esperando && (
          <p className="mensaje mensaje-asistente escribiendo" aria-label="Repi está escribiendo">
            <span></span><span></span><span></span>
          </p>
        )}

        {error && <p className="mensaje mensaje-asistente mensaje-error">{error}</p>}
        <div ref={finalRef}></div>
      </div>

      {/* Las sugerencias solo se muestran mientras no se ha preguntado nada */}
      {mensajes.length === 1 && (
        <div className="chat-sugerencias">
          {sugerencias.map(s => (
            <button key={s} type="button" onClick={() => enviarPregunta(s)}>{s}</button>
          ))}
        </div>
      )}

      <form className="chat-formulario" onSubmit={alEnviar}>
        <input
          type="text" placeholder="Escribe tu pregunta..." maxLength="500" autoComplete="off" aria-label="Tu pregunta" autoFocus
          value={texto} onChange={e => setTexto(e.target.value)}
        />
        <button type="submit" className="boton boton-primario" disabled={esperando}>Enviar</button>
      </form>
    </section>
  )
}

export default Chat
