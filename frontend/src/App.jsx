// Componente principal. Decide qué sección (vista) se muestra.
// La página funciona como una app: se ve una sección a la vez y al
// cambiar de sección aparece con una animación (clase "vista" en index.css).
import { useState } from 'react'
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

function App() {
  // Si la dirección termina en #admin se abre directo el panel.
  const [vista, setVista] = useState(window.location.hash === '#admin' ? 'admin' : 'inicio')
  // Filtro de técnicos: se guarda aquí porque lo cambian "Servicios" y "Técnicos".
  const [filtro, setFiltro] = useState('todos')

  function irA(nuevaVista) {
    setVista(nuevaVista)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Al tocar un aparato en Servicios se abren los técnicos ya filtrados.
  function elegirServicio(idAparato) {
    setFiltro(idAparato)
    irA('tecnicos')
  }

  return (
    <>
      <Encabezado vista={vista} irA={irA} />

      {/* key={vista} hace que React vuelva a crear la sección y se repita la animación */}
      <main key={vista} className="vista">
        {vista === 'inicio' && <Inicio irA={irA} />}
        {vista === 'servicios' && <Servicios elegirServicio={elegirServicio} />}
        {vista === 'tecnicos' && <Tecnicos filtro={filtro} setFiltro={setFiltro} />}
        {vista === 'cobertura' && <Cobertura />}
        {vista === 'resenas' && <Resenas />}
        {vista === 'contacto' && <Contacto />}
        {vista === 'admin' && <Admin />}
      </main>

      <Pie irA={irA} />
      {vista !== 'admin' && <Chat />}
    </>
  )
}

export default App
