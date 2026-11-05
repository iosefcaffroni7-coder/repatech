// Calculadora de cobertura: con la distancia en km calcula el tiempo y el costo del traslado.
// Se calcula en el navegador porque es una fórmula simple y no necesita datos del servidor.
import { useState } from 'react'
import mapa from '../assets/mapa.svg'

const KM_MAXIMO = 15

// Devuelve un objeto con el resultado según los kilómetros.
function calcularCobertura(km) {
  if (isNaN(km) || km < 0) {
    return { aviso: true, titulo: 'Revisa la distancia', lineas: ['Escribe un número de kilómetros, por ejemplo 4.5'] }
  }
  if (km > KM_MAXIMO) {
    return {
      aviso: true,
      titulo: 'Uy, todavía no llegamos hasta allá',
      lineas: [`Por ahora cubrimos hasta ${KM_MAXIMO} km desde nuestro punto de partida. Escríbenos y vemos si podemos hacer una excepción.`]
    }
  }
  const tiempo = Math.round(15 + km * 3)
  const costo = km <= 2 ? 0 : Math.round(15000 + (km - 2) * 6000)
  const textoCosto = costo === 0 ? 'Traslado sin costo' : `Costo de traslado aprox. $${costo.toLocaleString('es-CO')} COP`
  return { aviso: false, titulo: '¡Sí llegamos!', lineas: [`Tiempo estimado de llegada: ${tiempo} minutos`, textoCosto] }
}

function Cobertura() {
  const [distancia, setDistancia] = useState('')
  const [resultado, setResultado] = useState(null)

  function calcular(evento) {
    evento.preventDefault()
    setResultado(calcularCobertura(parseFloat(distancia)))
  }

  return (
    <section className="seccion">
      <div className="contenedor cobertura-caja">
        <div className="cobertura-texto">
          <p className="pre-titulo">paso 3</p>
          <h2>¿Llegamos hasta tu casa?</h2>
          <p className="descripcion-seccion">Pon qué tan lejos estás de nuestro punto de partida (en km) y te decimos el tiempo y el costo del traslado.</p>

          <form className="formulario-cobertura" onSubmit={calcular}>
            <div>
              <label htmlFor="distancia">Distancia aproximada en km</label>
              <input
                type="number" id="distancia" min="0" max="50" step="0.5" placeholder="Ej. 4.5" required
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
        </div>
      </div>
    </section>
  )
}

export default Cobertura
