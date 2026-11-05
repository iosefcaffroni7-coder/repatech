// Tarjeta de un servicio. Recibe todo por props, así sirve para cualquier aparato.
function TarjetaServicio({ nombre, imagen, descripcion, alElegir }) {
  return (
    <button className="tarjeta-servicio" onClick={alElegir}>
      <img src={imagen} alt={nombre} />
      <h3>{nombre}</h3>
      <p>{descripcion}</p>
    </button>
  )
}

export default TarjetaServicio
