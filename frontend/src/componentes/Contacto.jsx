// Formulario "Pide tu visita": envía la solicitud al backend (POST /api/solicitudes).
import { useState } from 'react'
import { pedirAPI } from '../api.js'
import BotonCarga from './BotonCarga.jsx'
import Aviso from './Aviso.jsx'

const formularioVacio = { nombre: '', telefono: '', direccion: '', dispositivo: '', mensaje: '' }

function Contacto({ servicios }) {
  const [formulario, setFormulario] = useState(formularioVacio)
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState({ texto: '', tipo: 'exito' })

  function cambiarCampo(evento) {
    let valor = evento.target.value
    // El teléfono solo acepta números y máximo 10.
    if (evento.target.name === 'telefono') {
      valor = valor.replace(/\D/g, '').slice(0, 10)
    }
    setFormulario({ ...formulario, [evento.target.name]: valor })
  }

  async function enviar(evento) {
    evento.preventDefault()
    if (formulario.telefono.length !== 10) {
      setAviso({ texto: 'El teléfono debe tener 10 dígitos, por ejemplo 3001234567.', tipo: 'error' })
      return
    }

    setEnviando(true)
    setAviso({ texto: '', tipo: 'exito' })
    try {
      const respuesta = await pedirAPI('/api/solicitudes', {
        method: 'POST',
        body: JSON.stringify(formulario)
      })
      setAviso({ texto: respuesta.mensaje, tipo: 'exito' })
      setFormulario(formularioVacio)
    } catch (error) {
      setAviso({ texto: error.message, tipo: 'error' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="seccion">
      <div className="contenedor contacto-caja">
        <p className="pre-titulo">paso 5</p>
        <h2>Pide tu visita</h2>
        <p className="descripcion-seccion">
          Llena el formulario y te contactamos para confirmar el horario.
          ¿Tienes dudas antes? Pregúntale a Repi, nuestro asistente, en la burbuja de abajo.
        </p>

        <form className="formulario-contacto" onSubmit={enviar}>
          <div className="campo">
            <label htmlFor="nombreContacto">Nombre</label>
            <input type="text" id="nombreContacto" name="nombre" minLength="2" maxLength="60" autoComplete="name" required
              value={formulario.nombre} onChange={cambiarCampo} />
          </div>
          <div className="campo">
            <label htmlFor="telefonoContacto">Teléfono</label>
            <input type="tel" id="telefonoContacto" name="telefono" placeholder="Ej. 3001234567" inputMode="numeric" autoComplete="tel" required
              value={formulario.telefono} onChange={cambiarCampo} />
          </div>
          <div className="campo">
            <label htmlFor="direccionContacto">Barrio o dirección</label>
            <input type="text" id="direccionContacto" name="direccion" maxLength="120" autoComplete="street-address" required
              value={formulario.direccion} onChange={cambiarCampo} />
          </div>
          <div className="campo">
            <label htmlFor="dispositivoContacto">Aparato a reparar</label>
            <select id="dispositivoContacto" name="dispositivo" required value={formulario.dispositivo} onChange={cambiarCampo}>
              <option value="" disabled>Elige uno</option>
              {servicios.map(s => <option key={s._id} value={s.nombre}>{s.nombre}</option>)}
            </select>
          </div>
          <div className="campo campo-ancho">
            <label htmlFor="mensajeContacto">Cuéntanos qué le pasa</label>
            <textarea id="mensajeContacto" name="mensaje" rows="3" minLength="5" maxLength="500" required
              placeholder="Ej. Se me cayó y la pantalla quedó negra"
              value={formulario.mensaje} onChange={cambiarCampo}></textarea>
          </div>
          <BotonCarga type="submit" cargando={enviando} texto="Solicitar visita" textoCargando="Enviando solicitud..." />
        </form>
        <Aviso texto={aviso.texto} tipo={aviso.tipo} />
      </div>
    </section>
  )
}

export default Contacto
