// Selector de ilustración reutilizable: muestra las imágenes como botones
// y marca la elegida. Lo usan los formularios de servicios y de técnicos.
// - opciones: objeto { nombre: archivo } (ej. imagenesServicio de datos.js)
// - valor: el nombre elegido; alCambiar: función que recibe el nuevo nombre
function SelectorImagen({ opciones, valor, alCambiar, redonda = false }) {
  return (
    <div className="selector-imagen">
      {Object.entries(opciones).map(([nombre, archivo]) => (
        <button
          key={nombre}
          type="button"
          className={`opcion-imagen ${redonda ? 'redonda' : ''} ${valor === nombre ? 'elegida' : ''}`}
          aria-label={`Elegir ilustración ${nombre}`}
          aria-pressed={valor === nombre}
          onClick={() => alCambiar(nombre)}
        >
          <img src={archivo} alt="" />
        </button>
      ))}
    </div>
  )
}

export default SelectorImagen
