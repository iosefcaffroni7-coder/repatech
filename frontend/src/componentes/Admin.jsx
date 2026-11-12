// Panel de administrador.
// 1) Login: envía usuario y clave, el backend devuelve un token.
// 2) El token se guarda en sessionStorage (se borra al cerrar la pestaña)
//    y se manda en cada petición privada en el encabezado Authorization.
// 3) Con el token se listan, actualizan (PUT) y borran (DELETE) solicitudes y reseñas.
// 4) También se administran los servicios, los técnicos, la cobertura y el descuento
//    (cada pestaña está en su propio componente: AdminServicios, AdminTecnicos, AdminCobertura).
import { useEffect, useState } from 'react'
import { pedirAPI } from '../api.js'
import { estrellas } from '../datos.js'
import BotonCarga from './BotonCarga.jsx'
import Aviso from './Aviso.jsx'
import TarjetaSolicitud from './TarjetaSolicitud.jsx'
import AdminServicios from './AdminServicios.jsx'
import AdminTecnicos from './AdminTecnicos.jsx'
import AdminCobertura from './AdminCobertura.jsx'
import './Admin.css'

const pestanas = [
  { id: 'solicitudes', nombre: 'Solicitudes de visita' },
  { id: 'resenas', nombre: 'Reseñas' },
  { id: 'servicios', nombre: 'Servicios' },
  { id: 'tecnicos', nombre: 'Técnicos' },
  { id: 'cobertura', nombre: 'Cobertura y descuentos' }
]

// catalogo y recargarCatalogo llegan por props desde App.
function Admin({ catalogo, recargarCatalogo }) {
  const [token, setToken] = useState(sessionStorage.getItem('repatech_token') || '')
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [entrando, setEntrando] = useState(false)
  const [avisoLogin, setAvisoLogin] = useState('')

  const [solicitudes, setSolicitudes] = useState([])
  const [resenas, setResenas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [errorPanel, setErrorPanel] = useState('')
  const [pestana, setPestana] = useState('solicitudes')
  const [filtroEstado, setFiltroEstado] = useState('todas')

  function cerrarSesion(motivo = '') {
    sessionStorage.removeItem('repatech_token')
    setToken('')
    setAvisoLogin(motivo)
  }

  // Igual que pedirAPI, pero agrega el token. Si el servidor responde 401
  // (por ejemplo porque se reinició) se vuelve a la pantalla de login.
  async function pedirAPIAdmin(ruta, opciones = {}) {
    try {
      return await pedirAPI(ruta, { ...opciones, headers: { Authorization: `Bearer ${token}` } })
    } catch (error) {
      if (error.estado === 401) cerrarSesion(error.message)
      throw error
    }
  }

  async function iniciarSesion(evento) {
    evento.preventDefault()
    setEntrando(true)
    setAvisoLogin('')
    try {
      const datos = await pedirAPI('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ usuario, clave })
      })
      sessionStorage.setItem('repatech_token', datos.token)
      setToken(datos.token)
      setClave('')
    } catch (error) {
      setAvisoLogin(error.message)
    } finally {
      setEntrando(false)
    }
  }

  function salir() {
    pedirAPIAdmin('/api/admin/logout', { method: 'POST' }).catch(() => {})
    cerrarSesion()
  }

  async function cargarTodo() {
    setCargando(true)
    setErrorPanel('')
    try {
      // Las dos peticiones se hacen al mismo tiempo para que cargue más rápido.
      const [listaSolicitudes, listaResenas] = await Promise.all([
        pedirAPIAdmin('/api/admin/solicitudes'),
        pedirAPI('/api/resenas')
      ])
      setSolicitudes(listaSolicitudes)
      setResenas(listaResenas)
    } catch (error) {
      setErrorPanel(error.message)
    } finally {
      setCargando(false)
    }
  }

  // Cuando hay token (después de entrar), se cargan los datos.
  useEffect(() => {
    if (token) cargarTodo()
  }, [token])

  // Reemplaza una solicitud en la lista después de cambiarle el estado.
  function actualizarSolicitud(actualizada) {
    setSolicitudes(solicitudes.map(s => (s._id === actualizada._id ? actualizada : s)))
  }

  function quitarSolicitud(id) {
    setSolicitudes(solicitudes.filter(s => s._id !== id))
  }

  async function borrarResena(resena) {
    if (!confirm(`¿Borrar la reseña de ${resena.nombre}?`)) return
    try {
      await pedirAPIAdmin(`/api/admin/resenas/${resena._id}`, { method: 'DELETE' })
      setResenas(resenas.filter(r => r._id !== resena._id))
    } catch (error) {
      alert(error.message)
    }
  }

  /* ---------- Pantalla de login ---------- */
  if (!token) {
    return (
      <section className="contenedor seccion-admin">
        <div className="caja-login">
          <p className="pre-titulo">solo personal</p>
          <h1>Entrar al panel</h1>
          <form className="formulario-login" onSubmit={iniciarSesion}>
            <div className="campo">
              <label htmlFor="usuario">Usuario</label>
              <input type="text" id="usuario" autoComplete="username" required value={usuario} onChange={e => setUsuario(e.target.value)} />
            </div>
            <div className="campo">
              <label htmlFor="clave">Contraseña</label>
              <input type="password" id="clave" autoComplete="current-password" required value={clave} onChange={e => setClave(e.target.value)} />
            </div>
            <BotonCarga type="submit" cargando={entrando} texto="Entrar" textoCargando="Entrando..." />
          </form>
          <Aviso texto={avisoLogin} tipo="error" />
        </div>
      </section>
    )
  }

  /* ---------- Panel ---------- */
  const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length
  const atendidas = solicitudes.filter(s => s.estado === 'atendida').length
  const visibles = solicitudes.filter(s => filtroEstado === 'todas' || s.estado === filtroEstado)

  return (
    <section className="contenedor seccion-admin">
      <div className="cabecera-panel">
        <h1>Panel de administrador</h1>
        <button type="button" className="boton boton-secundario boton-chico" onClick={salir}>Cerrar sesión</button>
      </div>

      <div className="resumen">
        <div className="dato"><strong>{pendientes}</strong><span>visitas pendientes</span></div>
        <div className="dato"><strong>{atendidas}</strong><span>visitas atendidas</span></div>
        <div className="dato"><strong>{resenas.length}</strong><span>reseñas publicadas</span></div>
        <div className="dato"><strong>{catalogo ? catalogo.tecnicos.length : '-'}</strong><span>técnicos activos</span></div>
      </div>

      <div className="pestanas">
        {pestanas.map(p => (
          <button key={p.id} type="button" className={`chip ${pestana === p.id ? 'activo' : ''}`} onClick={() => setPestana(p.id)}>
            {p.nombre}
          </button>
        ))}
      </div>

      {cargando && ['solicitudes', 'resenas'].includes(pestana) && <p className="estado-carga">Cargando datos...</p>}
      {errorPanel && ['solicitudes', 'resenas'].includes(pestana) && (
        <p className="estado-carga estado-error">
          {errorPanel} <button type="button" className="boton-texto" onClick={cargarTodo}>Reintentar</button>
        </p>
      )}

      {!cargando && !errorPanel && pestana === 'solicitudes' && (
        <>
          <div className="filtros-admin">
            <label htmlFor="filtroEstado">Mostrar:</label>
            <select id="filtroEstado" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="todas">Todas</option>
              <option value="pendiente">Pendientes</option>
              <option value="atendida">Atendidas</option>
            </select>
          </div>
          <div className="lista-admin">
            {visibles.length === 0 && <p className="estado-carga">No hay solicitudes por aquí todavía.</p>}
            {visibles.map(solicitud => (
              <TarjetaSolicitud
                key={solicitud._id}
                solicitud={solicitud}
                pedirAPIAdmin={pedirAPIAdmin}
                alActualizar={actualizarSolicitud}
                alBorrar={quitarSolicitud}
              />
            ))}
          </div>
        </>
      )}

      {!cargando && !errorPanel && pestana === 'resenas' && (
        <div className="lista-admin">
          {resenas.length === 0 && <p className="estado-carga">No hay reseñas publicadas.</p>}
          {resenas.map(resena => (
            <article key={resena._id} className="tarjeta-admin">
              <div className="tarjeta-admin-cabecera">
                <h3>{resena.nombre} sobre {resena.tecnico}</h3>
                <span className="estrellas">{estrellas(resena.calificacion)}</span>
              </div>
              <p className="mensaje-cliente">"{resena.comentario}"</p>
              <div className="acciones-admin">
                <button type="button" className="boton boton-peligro boton-chico" onClick={() => borrarResena(resena)}>Borrar reseña</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pestañas del catálogo: necesitan que haya llegado el catálogo */}
      {['servicios', 'tecnicos', 'cobertura'].includes(pestana) && !catalogo && (
        <p className="estado-carga">
          Cargando catálogo... <button type="button" className="boton-texto" onClick={recargarCatalogo}>Reintentar</button>
        </p>
      )}
      {catalogo && pestana === 'servicios' && (
        <AdminServicios servicios={catalogo.servicios} tecnicos={catalogo.tecnicos} pedirAPIAdmin={pedirAPIAdmin} alCambiar={recargarCatalogo} />
      )}
      {catalogo && pestana === 'tecnicos' && (
        <AdminTecnicos servicios={catalogo.servicios} tecnicos={catalogo.tecnicos} pedirAPIAdmin={pedirAPIAdmin} alCambiar={recargarCatalogo} />
      )}
      {catalogo && pestana === 'cobertura' && (
        <AdminCobertura cobertura={catalogo.cobertura} pedirAPIAdmin={pedirAPIAdmin} alCambiar={recargarCatalogo} />
      )}
    </section>
  )
}

export default Admin
