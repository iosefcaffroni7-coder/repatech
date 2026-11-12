// Componente principal. Decide qué sección (vista) se muestra
// y carga el catálogo (servicios, técnicos y cobertura) desde la API.
// La página funciona como una app: se ve una sección a la vez y al
// cambiar de sección aparece con una animación (clase "vista" en index.css).
import { useEffect, useState } from 'react'
import { pedirAPI } from './api.js'
import Encabezado from './componentes/Encabezado.jsx'
import Inicio from './componentes/Inicio.jsx'
import Servicios from './componentes/Servicios.jsx'
import Tecnicos from './componentes/Tecnicos.jsx'
import Cobertura from './componentes/Cobertura.jsx'
import Resenas from './componentes/Resenas.jsx'
import Contacto from './componentes/Contacto.jsx'
import Admin from './componentes/Admin.jsx'
import Pie from './componentes/Pie.jsx'
import Chat from './componentes/Chat.jsx'
import EsperandoCatalogo from './componentes/EsperandoCatalogo.jsx'

// Secciones que necesitan el catálogo para poder dibujarse.
const usanCatalogo = ['servicios', 'tecnicos', 'cobertura', 'resenas', 'contacto']

function App() {
  // Si la dirección termina en #admin se abre directo el panel.
  const [vista, setVista] = useState(window.location.hash === '#admin' ? 'admin' : 'inicio')
  // Filtro de técnicos: se guarda aquí porque lo cambian "Servicios" y "Técnicos".
  const [filtro, setFiltro] = useState('todos')
  // { servicios, tecnicos, cobertura } que vienen de MongoDB. null = todavía no llega.
  const [catalogo, setCatalogo] = useState(null)
  const [errorCatalogo, setErrorCatalogo] = useState('')

  async function cargarCatalogo() {
    setErrorCatalogo('')
    try {
      setCatalogo(await pedirAPI('/api/catalogo'))
    } catch (error) {
      setErrorCatalogo(error.message)
    }
  }

  // Se pide una sola vez, cuando abre la página.
  useEffect(() => {
    cargarCatalogo()
  }, [])

  function irA(nuevaVista) {
    setVista(nuevaVista)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Al tocar un aparato en Servicios se abren los técnicos ya filtrados.
  function elegirServicio(claveServicio) {
    setFiltro(claveServicio)
    irA('tecnicos')
  }

  const esperando = usanCatalogo.includes(vista) && !catalogo

  return (
    <>
      <Encabezado vista={vista} irA={irA} />

      {/* key={vista} hace que React vuelva a crear la sección y se repita la animación */}
      <main key={vista} className="vista">
        {esperando && <EsperandoCatalogo error={errorCatalogo} reintentar={cargarCatalogo} />}
        {vista === 'inicio' && <Inicio irA={irA} cobertura={catalogo?.cobertura} />}
        {!esperando && vista === 'servicios' && <Servicios servicios={catalogo.servicios} elegirServicio={elegirServicio} />}
        {!esperando && vista === 'tecnicos' && (
          <Tecnicos servicios={catalogo.servicios} tecnicos={catalogo.tecnicos} filtro={filtro} setFiltro={setFiltro} />
        )}
        {!esperando && vista === 'cobertura' && <Cobertura cobertura={catalogo.cobertura} />}
        {!esperando && vista === 'resenas' && <Resenas tecnicos={catalogo.tecnicos} />}
        {!esperando && vista === 'contacto' && <Contacto servicios={catalogo.servicios} />}
        {vista === 'admin' && <Admin catalogo={catalogo} recargarCatalogo={cargarCatalogo} />}
      </main>

      <Pie irA={irA} />
      {vista !== 'admin' && <Chat />}
    </>
  )
}

export default App
