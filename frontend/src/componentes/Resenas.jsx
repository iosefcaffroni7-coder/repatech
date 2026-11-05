// Reseñas: se cargan del backend (GET) y se pueden publicar nuevas (POST).
import { useEffect, useState } from 'react'
import { pedirAPI } from '../api.js'
import { tecnicos } from '../datos.js'
import TarjetaResena from './TarjetaResena.jsx'
import BotonCarga from './BotonCarga.jsx'
import Aviso from './Aviso.jsx'

const formularioVacio = { tecnico: '', nombre: '', comentario: '' }

function Resenas() {
  const [resenas, setResenas] = useState([])
  const [cargandoLista, setCargandoLista] = useState(true)
  const [errorLista, setErrorLista] = useState('')

  const [formulario, setFormulario] = useState(formularioVacio)
  const [calificacion, setCalificacion] = useState(0)
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState({ texto: '', tipo: 'exito' })

  async function cargarResenas() {
    setCargandoLista(true)
    setErrorLista('')
    try {
      setResenas(await pedirAPI('/api/resenas'))
    } catch (error) {
      setErrorLista(error.message)
    } finally {
      setCargandoLista(false)
    }
  }

  // useEffect con [] se ejecuta una sola vez, cuando aparece la sección.
  useEffect(() => {
    cargarResenas()
  }, [])

  // Actualiza el campo que cambió (tecnico, nombre o comentario).
  function cambiarCampo(evento) {
    setFormulario({ ...formulario, [evento.target.name]: evento.target.value })
  }

  async function publicar(evento) {
    evento.preventDefault()
    if (calificacion === 0) {
      setAviso({ texto: 'Toca las estrellas para darle una calificación al técnico.', tipo: 'error' })
      return
    }

    setEnviando(true)
    setAviso({ texto: '', tipo: 'exito' })
    try {
      const nueva = await pedirAPI('/api/resenas', {
        method: 'POST',
        body: JSON.stringify({ ...formulario, calificacion })
      })
      setResenas([nueva, ...resenas]) // la nueva queda de primera
      setFormulario(formularioVacio)
      setCalificacion(0)
      setAviso({ texto: '¡Gracias! Tu reseña ya está publicada.', tipo: 'exito' })
    } catch (error) {
      setAviso({ texto: error.message, tipo: 'error' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="seccion seccion-alterna">
      <div className="contenedor">
        <p className="pre-titulo">paso 4</p>
        <h2>Lo que dicen de nuestros técnicos</h2>
        <p className="descripcion-seccion">Reseñas de gente real que ya recibió una visita.</p>

        <div className="rejilla-resenas">
          {cargandoLista && <p className="estado-carga">Cargando reseñas...</p>}

          {errorLista && (
            <p className="estado-carga estado-error">
              {errorLista} <button type="button" className="boton-texto" onClick={cargarResenas}>Reintentar</button>
            </p>
          )}

          {!cargandoLista && !errorLista && resenas.length === 0 && (
            <p className="estado-carga">Todavía no hay reseñas, ¡sé el primero!</p>
          )}

          {resenas.map(resena => (
            <TarjetaResena key={resena._id} {...resena} />
          ))}
        </div>

        <div className="caja-nueva-resena">
          <h3 className="titulo-mano">Deja tu propia reseña</h3>
          <form className="formulario-resena" onSubmit={publicar}>
            <div className="campo">
              <label htmlFor="tecnico">Técnico</label>
              <select id="tecnico" name="tecnico" required value={formulario.tecnico} onChange={cambiarCampo}>
                <option value="" disabled>Elige un técnico</option>
                {tecnicos.map(t => <option key={t.nombre} value={t.nombre}>{t.nombre}</option>)}
              </select>
            </div>

            <div className="campo">
              <label>Calificación</label>
              <div className="selector-estrellas">
                {[1, 2, 3, 4, 5].map(valor => (
                  <button
                    key={valor}
                    type="button"
                    aria-label={`${valor} estrellas`}
                    className={valor <= calificacion ? 'activa' : ''}
                    onClick={() => setCalificacion(valor)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="campo">
              <label htmlFor="nombre">Tu nombre</label>
              <input type="text" id="nombre" name="nombre" placeholder="Ej. Karina P." minLength="2" maxLength="40" required
                value={formulario.nombre} onChange={cambiarCampo} />
            </div>

            <div className="campo campo-ancho">
              <label htmlFor="comentario">Comentario</label>
              <textarea id="comentario" name="comentario" rows="3" placeholder="Cuéntanos cómo te fue" minLength="5" maxLength="300" required
                value={formulario.comentario} onChange={cambiarCampo}></textarea>
            </div>

            <BotonCarga type="submit" cargando={enviando} texto="Publicar reseña" textoCargando="Publicando..." />
          </form>
          <Aviso texto={aviso.texto} tipo={aviso.tipo} />
        </div>
      </div>
    </section>
  )
}

export default Resenas
