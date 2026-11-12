// Pestaña "Servicios" del panel: agregar (POST) y quitar (DELETE) servicios.
// Después de cada cambio se vuelve a pedir el catálogo, así la página pública
// muestra los servicios nuevos sin recargar.
import { useState } from 'react'
import { imagenesServicio } from '../datos.js'
import SelectorImagen from './SelectorImagen.jsx'
import BotonCarga from './BotonCarga.jsx'
import Aviso from './Aviso.jsx'

const formularioVacio = { nombre: '', descripcion: '', imagen: 'herramientas' }

function AdminServicios({ servicios, tecnicos, pedirAPIAdmin, alCambiar }) {
  const [formulario, setFormulario] = useState(formularioVacio)
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState({ texto: '', tipo: 'exito' })

  function cambiarCampo(evento) {
    setFormulario({ ...formulario, [evento.target.name]: evento.target.value })
  }

  async function agregar(evento) {
    evento.preventDefault()
    setEnviando(true)
    setAviso({ texto: '', tipo: 'exito' })
    try {
      const nuevo = await pedirAPIAdmin('/api/admin/servicios', { method: 'POST', body: JSON.stringify(formulario) })
      await alCambiar()
      setFormulario(formularioVacio)
      setAviso({ texto: `Servicio "${nuevo.nombre}" agregado. Ahora asígnaselo a un técnico en la pestaña Técnicos.`, tipo: 'exito' })
    } catch (error) {
      setAviso({ texto: error.message, tipo: 'error' })
    } finally {
      setEnviando(false)
    }
  }

  async function quitar(servicio) {
    if (!confirm(`¿Quitar el servicio "${servicio.nombre}"? Los técnicos dejarán de tenerlo asignado.`)) return
    try {
      await pedirAPIAdmin(`/api/admin/servicios/${servicio._id}`, { method: 'DELETE' })
      await alCambiar()
    } catch (error) {
      alert(error.message)
    }
  }

  // Cuántos técnicos reparan cada servicio.
  const cuantosTecnicos = clave => tecnicos.filter(t => t.servicios.includes(clave)).length

  return (
    <div className="admin-catalogo">
      <form className="caja-formulario-admin" onSubmit={agregar}>
        <h2>Agregar servicio</h2>
        <div className="campo">
          <label htmlFor="nombreServicio">Nombre</label>
          <input id="nombreServicio" name="nombre" placeholder="Ej. Relojes inteligentes" minLength="3" maxLength="30" required
            value={formulario.nombre} onChange={cambiarCampo} />
        </div>
        <div className="campo">
          <label htmlFor="descripcionServicio">¿Qué reparan?</label>
          <input id="descripcionServicio" name="descripcion" placeholder="Ej. Pantalla, batería, correa" minLength="5" maxLength="80" required
            value={formulario.descripcion} onChange={cambiarCampo} />
        </div>
        <div className="campo">
          <label>Ilustración</label>
          <SelectorImagen
            opciones={imagenesServicio}
            valor={formulario.imagen}
            alCambiar={imagen => setFormulario({ ...formulario, imagen })}
          />
        </div>
        <BotonCarga type="submit" cargando={enviando} texto="Agregar servicio" textoCargando="Guardando..." />
        <Aviso texto={aviso.texto} tipo={aviso.tipo} />
      </form>

      <div className="lista-catalogo">
        {servicios.map(servicio => (
          <article key={servicio._id} className="tarjeta-admin tarjeta-catalogo">
            <img src={imagenesServicio[servicio.imagen]} alt="" className="miniatura" />
            <div className="tarjeta-catalogo-texto">
              <h3>{servicio.nombre}</h3>
              <p className="meta-admin">{servicio.descripcion}</p>
              <p className="meta-admin">{cuantosTecnicos(servicio.clave)} técnico(s) lo reparan</p>
            </div>
            <button type="button" className="boton boton-peligro boton-chico" onClick={() => quitar(servicio)}>Quitar</button>
          </article>
        ))}
      </div>
    </div>
  )
}

export default AdminServicios
