// Pestaña "Cobertura y descuentos" del panel.
// Edita la fórmula del traslado y el descuento por ocasión con PUT /api/admin/cobertura.
import { useState } from 'react'
import { calcularTraslado, pesos } from '../datos.js'
import BotonCarga from './BotonCarga.jsx'
import Aviso from './Aviso.jsx'

const ocasiones = ['Navidad', 'Black Friday', 'Día de la Madre', 'Día del Padre', 'Amor y Amistad', 'Regreso a clases', 'Cliente frecuente']

const campos = [
  { nombre: 'kmMaximo', etiqueta: 'Distancia máxima (km)' },
  { nombre: 'kmGratis', etiqueta: 'Traslado gratis hasta (km)' },
  { nombre: 'costoBase', etiqueta: 'Costo base del traslado ($)' },
  { nombre: 'costoPorKmExtra', etiqueta: 'Costo por cada km extra ($)' },
  { nombre: 'minutosBase', etiqueta: 'Minutos base de llegada' },
  { nombre: 'minutosPorKm', etiqueta: 'Minutos extra por km' }
]

function AdminCobertura({ cobertura, pedirAPIAdmin, alCambiar }) {
  // El formulario empieza con los valores guardados en la base de datos.
  const [formulario, setFormulario] = useState(() => ({
    ...cobertura,
    descuento: { ...cobertura.descuento }
  }))
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState({ texto: '', tipo: 'exito' })

  function cambiarCampo(evento) {
    setFormulario({ ...formulario, [evento.target.name]: evento.target.value })
  }

  function cambiarDescuento(cambios) {
    setFormulario({ ...formulario, descuento: { ...formulario.descuento, ...cambios } })
  }

  async function guardar(datos) {
    setGuardando(true)
    setAviso({ texto: '', tipo: 'exito' })
    try {
      await pedirAPIAdmin('/api/admin/cobertura', { method: 'PUT', body: JSON.stringify(datos) })
      await alCambiar()
      setAviso({ texto: 'Cambios guardados. La calculadora y el asistente Repi ya usan los nuevos valores.', tipo: 'exito' })
    } catch (error) {
      setAviso({ texto: error.message, tipo: 'error' })
    } finally {
      setGuardando(false)
    }
  }

  function alGuardar(evento) {
    evento.preventDefault()
    guardar(formulario)
  }

  // Botón rápido para volver al precio normal.
  function dejarNormal() {
    const datos = { ...formulario, descuento: { ...formulario.descuento, activo: false } }
    setFormulario(datos)
    guardar(datos)
  }

  // Vista previa con los números que hay en el formulario (todavía sin guardar).
  const numeros = Object.fromEntries(campos.map(c => [c.nombre, Number(formulario[c.nombre]) || 0]))
  const ejemplo = calcularTraslado(5, { ...numeros, descuento: { ...formulario.descuento, porcentaje: Number(formulario.descuento.porcentaje) || 0 } })

  return (
    <form className="caja-formulario-admin formulario-cobertura-admin" onSubmit={alGuardar}>
      <h2>Cobertura del traslado</h2>
      <div className="campos-dobles">
        {campos.map(campo => (
          <div className="campo" key={campo.nombre}>
            <label htmlFor={campo.nombre}>{campo.etiqueta}</label>
            <input id={campo.nombre} name={campo.nombre} type="number" min="0" step="any" required
              value={formulario[campo.nombre]} onChange={cambiarCampo} />
          </div>
        ))}
      </div>

      <h2>Descuento en el traslado</h2>
      <label className="interruptor">
        <input type="checkbox" checked={formulario.descuento.activo}
          onChange={e => cambiarDescuento({ activo: e.target.checked })} />
        <span>{formulario.descuento.activo ? 'Descuento activado' : 'Precio normal (sin descuento)'}</span>
      </label>

      {formulario.descuento.activo && (
        <div className="caja-descuento">
          <div className="campos-dobles">
            <div className="campo">
              <label htmlFor="motivoDescuento">Ocasión o motivo</label>
              <input id="motivoDescuento" maxLength="40" placeholder="Ej. Navidad" required
                value={formulario.descuento.motivo} onChange={e => cambiarDescuento({ motivo: e.target.value })} />
            </div>
            <div className="campo">
              <label htmlFor="porcentajeDescuento">Descuento (%)</label>
              <input id="porcentajeDescuento" type="number" min="1" max="90" required
                value={formulario.descuento.porcentaje} onChange={e => cambiarDescuento({ porcentaje: e.target.value })} />
            </div>
          </div>
          <div className="filtros">
            {ocasiones.map(ocasion => (
              <button key={ocasion} type="button"
                className={`chip ${formulario.descuento.motivo === ocasion ? 'activo' : ''}`}
                onClick={() => cambiarDescuento({ motivo: ocasion })}>
                {ocasion}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="vista-previa">
        Ejemplo a 5 km: llega en {ejemplo.minutos} min y el traslado cuesta{' '}
        {ejemplo.costo === 0 ? 'nada (gratis)' : ejemplo.conDescuento < ejemplo.costo
          ? <><s>{pesos(ejemplo.costo)}</s> <strong>{pesos(ejemplo.conDescuento)}</strong></>
          : <strong>{pesos(ejemplo.costo)}</strong>}
      </p>

      <div className="acciones-admin">
        <BotonCarga type="submit" cargando={guardando} texto="Guardar cambios" textoCargando="Guardando..." />
        {cobertura.descuento?.activo && (
          <button type="button" className="boton boton-secundario" onClick={dejarNormal} disabled={guardando}>
            Dejar precio normal
          </button>
        )}
      </div>
      <Aviso texto={aviso.texto} tipo={aviso.tipo} />
    </form>
  )
}

export default AdminCobertura
