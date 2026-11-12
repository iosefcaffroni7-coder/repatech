// Lista de técnicos con filtro por tipo de aparato.
// Los técnicos y los servicios llegan por props desde App (que los pidió a la API).
import { fotosTecnico, especialidadDe } from '../datos.js'
import TarjetaTecnico from './TarjetaTecnico.jsx'

function Tecnicos({ servicios, tecnicos, filtro, setFiltro }) {
  // filter: deja solo los técnicos que reparan el aparato elegido.
  const visibles = tecnicos.filter(t => filtro === 'todos' || t.servicios.includes(filtro))

  // Botones del filtro: "Todos" + uno por cada servicio.
  const opciones = [{ clave: 'todos', nombre: 'Todos' }, ...servicios]

  return (
    <section className="seccion seccion-alterna">
      <div className="contenedor">
        <p className="pre-titulo">paso 2</p>
        <h2>Elige a tu técnico</h2>
        <p className="descripcion-seccion">Todos están verificados y tienen reseñas reales de otros clientes del barrio.</p>

        <div className="filtros">
          {opciones.map(opcion => (
            <button
              key={opcion.clave}
              className={`chip ${filtro === opcion.clave ? 'activo' : ''}`}
              onClick={() => setFiltro(opcion.clave)}
            >
              {opcion.nombre}
            </button>
          ))}
        </div>

        <div className="rejilla-tecnicos">
          {visibles.map(tecnico => (
            <TarjetaTecnico
              key={tecnico._id}
              {...tecnico}
              foto={fotosTecnico[tecnico.foto]}
              especialidad={especialidadDe(tecnico, servicios)}
            />
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
