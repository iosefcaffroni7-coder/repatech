// Calculadora de cobertura: con la distancia en km calcula el tiempo y el costo del traslado.
// Los valores (km máximos, km gratis, precios y descuento) llegan por props desde App,
// que los pidió a la API. El administrador los cambia en el panel.
import { useState } from 'react'
import mapa from '../assets/mapa.svg'
import { calcularTraslado, pesos } from '../datos.js'

// Devuelve un objeto con el resultado según los kilómetros.
function calcularCobertura(km, c) {
  if (isNaN(km) || km < 0) {
    return { aviso: true, titulo: 'Revisa la distancia', lineas: ['Escribe un número de kilómetros, por ejemplo 4.5'] }
  }
  if (km > c.kmMaximo) {
    return {
      aviso: true,
      titulo: 'Uy, todavía no llegamos hasta allá',
      lineas: [`Por ahora cubrimos hasta ${c.kmMaximo} km desde nuestro punto de partida. Escríbenos y vemos si podemos hacer una excepción.`]
    }
  }
  const { minutos, costo, conDescuento } = calcularTraslado(km, c)
  const lineas = [`Tiempo estimado de llegada: ${minutos} minutos`]
  if (costo === 0) {
    lineas.push('Traslado sin costo')
  } else if (conDescuento < costo) {
    lineas.push(`Costo de traslado aprox. ${pesos(conDescuento)} COP (antes ${pesos(costo)})`)
    lineas.push(`Incluye ${c.descuento.porcentaje}% de descuento por ${c.descuento.motivo}`)
  } else {
    lineas.push(`Costo de traslado aprox. ${pesos(costo)} COP`)
  }
  return { aviso: false, titulo: '¡Sí llegamos!', lineas }
}

function Cobertura({ cobertura }) {
  const [distancia, setDistancia] = useState('')
  const [resultado, setResultado] = useState(null)
  const descuento = cobertura.descuento

  function calcular(evento) {
    evento.preventDefault()
    setResultado(calcularCobertura(parseFloat(distancia), cobertura))
  }

  return (
    <section className="seccion">
      <div className="contenedor cobertura-caja">
        <div className="cobertura-texto">
          <p className="pre-titulo">paso 3</p>
          <h2>¿Llegamos hasta tu casa?</h2>
          <p className="descripcion-seccion">Pon qué tan lejos estás de nuestro punto de partida (en km) y te decimos el tiempo y el costo del traslado.</p>

          {descuento?.activo && (
            <p className="aviso-descuento">
              <strong>{descuento.porcentaje}% de descuento</strong> en el traslado por {descuento.motivo}.
            </p>
          )}

          <form className="formulario-cobertura" onSubmit={calcular}>
            <div>
              <label htmlFor="distancia">Distancia aproximada en km</label>
              <input
                type="number" id="distancia" min="0" max="100" step="0.5" placeholder="Ej. 4.5" required
                value={distancia}
                onChange={e => setDistancia(e.target.value)}
              />
            </div>
            <button type="submit" className="boton boton-primario">Calcular</button>
          </form>

          {resultado && (
            <div className={`resultado-cobertura ${resultado.aviso ? 'aviso' : ''}`}>
              <h4>{resultado.titulo}</h4>
              {resultado.lineas.map(linea => <p key={linea}>{linea}</p>)}
            </div>
          )}
        </div>
        <div className="cobertura-imagen">
          <img src={mapa} alt="Mapa con radio de cobertura de RepaTech" />
          {/* Las etiquetas van encima del mapa para que muestren los valores actuales */}
          <span className="pildora-mapa pildora-maximo">hasta {cobertura.kmMaximo} km</span>
          <span className="pildora-mapa pildora-gratis">{cobertura.kmGratis} km gratis</span>
        </div>
      </div>
    </section>
  )
}

export default Cobertura
