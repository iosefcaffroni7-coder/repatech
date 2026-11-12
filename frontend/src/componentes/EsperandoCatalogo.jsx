// Mensaje que se ve mientras llega el catálogo (servicios, técnicos y cobertura)
// desde el servidor. Si el servidor gratuito estaba dormido avisa que está despertando.
import { useEffect, useState } from 'react'

function EsperandoCatalogo({ error, reintentar }) {
  const [tardando, setTardando] = useState(false)

  useEffect(() => {
    const temporizador = setTimeout(() => setTardando(true), 6000)
    return () => clearTimeout(temporizador)
  }, [])

  return (
    <section className="seccion">
      <div className="contenedor">
        {error ? (
          <p className="estado-carga estado-error">
            {error} <button type="button" className="boton-texto" onClick={reintentar}>Reintentar</button>
          </p>
        ) : (
          <p className="estado-carga">
            {tardando ? 'Despertando el servidor, puede tardar unos 50 segundos...' : 'Cargando...'}
          </p>
        )}
      </div>
    </section>
  )
}

export default EsperandoCatalogo
