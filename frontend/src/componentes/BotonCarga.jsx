// Botón reutilizable que muestra un estado de carga (spinner + otro texto).
// Lo usan todos los formularios. El servidor gratuito de Render se "duerme",
// así que si la espera pasa de 6 segundos se avisa que está despertando.
import { useEffect, useState } from 'react'

function BotonCarga({ cargando, texto, textoCargando = 'Enviando...', clase = 'boton-primario', ...resto }) {
  const [tardando, setTardando] = useState(false)

  useEffect(() => {
    if (!cargando) {
      setTardando(false)
      return
    }
    const temporizador = setTimeout(() => setTardando(true), 6000)
    return () => clearTimeout(temporizador) // se limpia si termina antes
  }, [cargando])

  let contenido = texto
  if (cargando) contenido = tardando ? 'Despertando el servidor...' : textoCargando

  return (
    <button className={`boton ${clase} ${cargando ? 'cargando' : ''}`} disabled={cargando} {...resto}>
      {contenido}
    </button>
  )
}

export default BotonCarga
