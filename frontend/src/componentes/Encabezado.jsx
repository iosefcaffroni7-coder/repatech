// Barra de navegación. En celular se convierte en un menú de hamburguesa.
import { useState } from 'react'
import logo from '../assets/logo.svg'

// Secciones del menú: id de la vista y texto que se muestra.
const enlaces = [
  { id: 'inicio', texto: 'Inicio' },
  { id: 'servicios', texto: 'Servicios' },
  { id: 'tecnicos', texto: 'Técnicos' },
  { id: 'cobertura', texto: 'Cobertura' },
  { id: 'resenas', texto: 'Reseñas' },
  { id: 'contacto', texto: 'Contacto' }
]

function Encabezado({ vista, irA }) {
  const [menuAbierto, setMenuAbierto] = useState(false)

  function navegar(evento, id) {
    evento.preventDefault()
    setMenuAbierto(false)
    irA(id)
  }

  return (
    <header className="encabezado">
      <div className="contenedor barra-nav">
        <a href="#inicio" className="logo" onClick={e => navegar(e, 'inicio')}>
          <img src={logo} alt="Logo RepaTech" width="42" />
          <span>Repa<b>Tech</b>{vista === 'admin' && <small className="etiqueta-admin">admin</small>}</span>
        </a>

        <button
          className="boton-menu"
          aria-label="Abrir menú"
          aria-expanded={menuAbierto}
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          <span></span><span></span><span></span>
        </button>

        <nav className={`nav ${menuAbierto ? 'abierto' : ''}`}>
          {enlaces.map(enlace => (
            <a
              key={enlace.id}
              href={`#${enlace.id}`}
              className={vista === enlace.id ? 'activo' : ''}
              onClick={e => navegar(e, enlace.id)}
            >
              {enlace.texto}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Encabezado
