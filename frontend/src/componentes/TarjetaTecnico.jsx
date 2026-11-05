// Tarjeta de un técnico. Todos los datos llegan por props.
import { estrellas } from '../datos.js'

function TarjetaTecnico({ nombre, foto, especialidad, calificacion, experiencia, zona, reparaciones }) {
  return (
    <article className="tarjeta-tecnico">
      <img src={foto} alt={`Foto de ${nombre}`} className="avatar-tecnico" />
      <h3>{nombre}</h3>
      <p className="especialidad">{especialidad}</p>
      <p className="estrellas">{estrellas(calificacion)} <span>{calificacion.toFixed(1)}</span></p>
      <p className="meta">{experiencia} años de experiencia · Zona {zona}</p>
      <p className="meta">{reparaciones} reparaciones este mes</p>
    </article>
  )
}

export default TarjetaTecnico
