// Lista de técnicos con filtro por tipo de aparato.
import { servicios, tecnicos } from '../datos.js'
import TarjetaTecnico from './TarjetaTecnico.jsx'

function Tecnicos({ filtro, setFiltro }) {
  // filter: deja solo los técnicos que reparan el aparato elegido.
  const visibles = tecnicos.filter(t => filtro === 'todos' || t.dispositivos.includes(filtro))

  // Botones del filtro: "Todos" + uno por cada servicio.
  const opciones = [{ id: 'todos', nombre: 'Todos' }, ...servicios]

  return (
    <section className="seccion seccion-alterna">
      <div className="contenedor">
        <p className="pre-titulo">paso 2</p>
        <h2>Elige a tu técnico</h2>
        <p className="descripcion-seccion">Todos están verificados y tienen reseñas reales de otros clientes del barrio.</p>

        <div className="filtros">
          {opciones.map(opcion => (
            <button
              key={opcion.id}
              className={`chip ${filtro === opcion.id ? 'activo' : ''}`}
              onClick={() => setFiltro(opcion.id)}
            >
              {opcion.nombre}
            </button>
          ))}
        </div>

        <div className="rejilla-tecnicos">
          {visibles.map(tecnico => (
            <TarjetaTecnico key={tecnico.nombre} {...tecnico} />
          ))}
        </div>

        {visibles.length === 0 && (
          <p className="sin-resultados">No tenemos técnicos para ese aparato todavía, prueba con otro filtro.</p>
        )}
      </div>
    </section>
  )
}

export default Tecnicos
