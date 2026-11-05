// Tarjeta de una solicitud de visita en el panel de administrador.
// Botones: marcar atendida/pendiente (PUT), borrar (DELETE)
// y "Redactar mensaje con IA", que escribe un WhatsApp listo para el cliente.
import { useState } from 'react'
import BotonCarga from './BotonCarga.jsx'

function formatearFecha(iso) {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

function TarjetaSolicitud({ solicitud, pedirAPIAdmin, alActualizar, alBorrar }) {
  const [guardando, setGuardando] = useState(false)
  const [redactando, setRedactando] = useState(false)
  const [textoIA, setTextoIA] = useState('')
  const [errorIA, setErrorIA] = useState('')
  const [copiado, setCopiado] = useState(false)

  async function cambiarEstado() {
    const nuevoEstado = solicitud.estado === 'pendiente' ? 'atendida' : 'pendiente'
    setGuardando(true)
    try {
      const actualizada = await pedirAPIAdmin(`/api/admin/solicitudes/${solicitud._id}`, {
        method: 'PUT',
        body: JSON.stringify({ estado: nuevoEstado })
      })
      alActualizar(actualizada)
    } catch (error) {
      alert(error.message)
    } finally {
      setGuardando(false)
    }
  }

  async function borrar() {
    if (!confirm(`¿Borrar la solicitud de ${solicitud.nombre}? Esto no se puede deshacer.`)) return
    try {
      await pedirAPIAdmin(`/api/admin/solicitudes/${solicitud._id}`, { method: 'DELETE' })
      alBorrar(solicitud._id)
    } catch (error) {
      alert(error.message)
    }
  }

  async function redactarConIA() {
    setRedactando(true)
    setErrorIA('')
    try {
      const datos = await pedirAPIAdmin(`/api/admin/solicitudes/${solicitud._id}/mensaje-ia`, { method: 'POST' })
      setTextoIA(datos.texto)
    } catch (error) {
      setErrorIA(error.message)
    } finally {
      setRedactando(false)
    }
  }

  async function copiar() {
    await navigator.clipboard.writeText(textoIA)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1500)
  }

  // wa.me abre WhatsApp con el mensaje ya escrito. 57 = código de Colombia.
  const enlaceWhatsApp = `https://wa.me/57${solicitud.telefono}?text=${encodeURIComponent(textoIA)}`

  return (
    <article className={`tarjeta-admin estado-${solicitud.estado}`}>
      <div className="tarjeta-admin-cabecera">
        <h3>{solicitud.nombre}</h3>
        <span className={`insignia insignia-${solicitud.estado}`}>{solicitud.estado}</span>
      </div>
      <p className="meta-admin">
        {solicitud.dispositivo} · {solicitud.direccion} · Tel. {solicitud.telefono} · {formatearFecha(solicitud.createdAt)}
      </p>
      <p className="mensaje-cliente">"{solicitud.mensaje}"</p>

      <div className="acciones-admin">
        <BotonCarga
          type="button" clase="boton-secundario boton-chico" onClick={cambiarEstado} cargando={guardando} textoCargando="Guardando..."
          texto={solicitud.estado === 'pendiente' ? 'Marcar atendida' : 'Volver a pendiente'}
        />
        <BotonCarga
          type="button" clase="boton-primario boton-chico" onClick={redactarConIA} cargando={redactando}
          texto="Redactar mensaje con IA" textoCargando="La IA está escribiendo..."
        />
        <button type="button" className="boton boton-peligro boton-chico" onClick={borrar}>Borrar</button>
      </div>

      {errorIA && <p className="estado-error caja-ia">{errorIA}</p>}

      {textoIA && (
        <div className="caja-ia">
          <p className="titulo-ia">Mensaje sugerido por la IA (puedes editarlo):</p>
          <textarea className="texto-ia" rows="5" value={textoIA} onChange={e => setTextoIA(e.target.value)} />
          <div className="acciones-admin">
            <button type="button" className="boton boton-secundario boton-chico" onClick={copiar}>{copiado ? '¡Copiado!' : 'Copiar'}</button>
            <a className="boton boton-primario boton-chico" href={enlaceWhatsApp} target="_blank" rel="noopener">Abrir en WhatsApp</a>
          </div>
        </div>
      )}
    </article>
  )
}

export default TarjetaSolicitud
