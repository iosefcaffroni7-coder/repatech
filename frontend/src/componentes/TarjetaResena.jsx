// Tarjeta de una reseña. React muestra los textos como texto (nunca como HTML),
// así nadie puede meter código en un comentario.
import { estrellas } from '../datos.js'

function TarjetaResena({ nombre, tecnico, comentario, calificacion }) {
  return (
    <article className="tarjeta-resena">
      <p className="estrellas">{estrellas(calificacion)}</p>
      <p className="comentario">"{comentario}"</p>
      <p className="autor">— {nombre} sobre {tecnico}</p>
    </article>
  )
}

export default TarjetaResena
