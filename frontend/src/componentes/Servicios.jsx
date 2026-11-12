// Catálogo de servicios: una tarjeta por cada aparato que reparamos.
// La lista de servicios llega por props desde App (que la pidió a la API).
import { imagenesServicio } from '../datos.js'
import TarjetaServicio from './TarjetaServicio.jsx'

function Servicios({ servicios, elegirServicio }) {
  return (
    <section className="seccion">
      <div className="contenedor">
        <p className="pre-titulo">paso 1</p>
        <h2>¿Qué aparato se te descompuso?</h2>
        <p className="descripcion-seccion">Dale clic al aparato y te llevamos directo a los técnicos que saben arreglarlo.</p>

        <div className="rejilla-servicios">
          {servicios.map(servicio => (
            <TarjetaServicio
              key={servicio._id}
              nombre={servicio.nombre}
              imagen={imagenesServicio[servicio.imagen]}
              descripcion={servicio.descripcion}
              alElegir={() => elegirServicio(servicio.clave)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Servicios
