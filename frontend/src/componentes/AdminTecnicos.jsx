// Pestaña "Técnicos" del panel: agregar (POST) y quitar (DELETE) técnicos.
// Reutiliza TarjetaTecnico, el mismo componente de la página pública.
import { useState } from 'react'
import { fotosTecnico, especialidadDe } from '../datos.js'
import SelectorImagen from './SelectorImagen.jsx'
import TarjetaTecnico from './TarjetaTecnico.jsx'
import BotonCarga from './BotonCarga.jsx'
import Aviso from './Aviso.jsx'

const formularioVacio = { nombre: '', zona: '', experiencia: '', calificacion: '5', reparaciones: '0', servicios: [], foto: 'tecnico5' }

function AdminTecnicos({ servicios, tecnicos, pedirAPIAdmin, alCambiar }) {
  const [formulario, setFormulario] = useState(formularioVacio)
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState({ texto: '', tipo: 'exito' })

  function cambiarCampo(evento) {
    setFormulario({ ...formulario, [evento.target.name]: evento.target.value })
  }

  // Marca o desmarca un servicio en la lista del técnico.
  function alternarServicio(clave) {
    const lista = formulario.servicios.includes(clave)
      ? formulario.servicios.filter(c => c !== clave)
      : [...formulario.servicios, clave]
    setFormulario({ ...formulario, servicios: lista })
  }

  async function agregar(evento) {
    evento.preventDefault()
    if (formulario.servicios.length === 0) {
      setAviso({ texto: 'Elige al menos un servicio que repare.', tipo: 'error' })
      return
    }
    setEnviando(true)
    setAviso({ texto: '', tipo: 'exito' })
    try {
      const nuevo = await pedirAPIAdmin('/api/admin/tecnicos', { method: 'POST', body: JSON.stringify(formulario) })
      await alCambiar()
      setFormulario(formularioVacio)
      setAviso({ texto: `${nuevo.nombre} ya aparece en la página.`, tipo: 'exito' })
    } catch (error) {
      setAviso({ texto: error.message, tipo: 'error' })
    } finally {
      setEnviando(false)
    }
  }

  async function quitar(tecnico) {
    if (!confirm(`¿Quitar a ${tecnico.nombre}? Ya no aparecerá en la página.`)) return
    try {
      await pedirAPIAdmin(`/api/admin/tecnicos/${tecnico._id}`, { method: 'DELETE' })
      await alCambiar()
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className="admin-catalogo">
      <form className="caja-formulario-admin" onSubmit={agregar}>
        <h2>Agregar técnico</h2>
        <div className="campos-dobles">
          <div className="campo">
            <label htmlFor="nombreTecnico">Nombre</label>
            <input id="nombreTecnico" name="nombre" placeholder="Ej. Pedro Pérez" minLength="3" maxLength="40" required
              value={formulario.nombre} onChange={cambiarCampo} />
          </div>
          <div className="campo">
            <label htmlFor="zonaTecnico">Zona</label>
            <input id="zonaTecnico" name="zona" placeholder="Ej. Norte" maxLength="30" required
              value={formulario.zona} onChange={cambiarCampo} />
          </div>
          <div className="campo">
            <label htmlFor="experienciaTecnico">Años de experiencia</label>
            <input id="experienciaTecnico" name="experiencia" type="number" min="0" max="60" required
              value={formulario.experiencia} onChange={cambiarCampo} />
          </div>
          <div className="campo">
            <label htmlFor="calificacionTecnico">Calificación (1 a 5)</label>
            <input id="calificacionTecnico" name="calificacion" type="number" min="1" max="5" step="0.1" required
              value={formulario.calificacion} onChange={cambiarCampo} />
          </div>
        </div>
        <div className="campo">
          <label>¿Qué repara?</label>
          <div className="filtros">
            {servicios.map(s => (
              <button
                key={s._id}
                type="button"
                className={`chip ${formulario.servicios.includes(s.clave) ? 'activo' : ''}`}
                aria-pressed={formulario.servicios.includes(s.clave)}
                onClick={() => alternarServicio(s.clave)}
              >
                {s.nombre}
              </button>
            ))}
          </div>
        </div>
        <div className="campo">
          <label>Foto</label>
          <SelectorImagen
            opciones={fotosTecnico}
            valor={formulario.foto}
            alCambiar={foto => setFormulario({ ...formulario, foto })}
            redonda
          />
        </div>
        <BotonCarga type="submit" cargando={enviando} texto="Agregar técnico" textoCargando="Guardando..." />
        <Aviso texto={aviso.texto} tipo={aviso.tipo} />
      </form>

      <div className="rejilla-tecnicos">
        {tecnicos.map(tecnico => (
          <div key={tecnico._id} className="tecnico-con-acciones">
            <TarjetaTecnico
              {...tecnico}
              foto={fotosTecnico[tecnico.foto]}
              especialidad={especialidadDe(tecnico, servicios)}
            />
            <button type="button" className="boton boton-peligro boton-chico" onClick={() => quitar(tecnico)}>
              Quitar técnico
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminTecnicos
