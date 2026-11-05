// Mensaje de éxito o de error debajo de un formulario.
// Si no hay texto, no se muestra nada.
function Aviso({ texto, tipo = 'exito' }) {
  if (!texto) return null
  return (
    <p className={`aviso-formulario aviso-${tipo}`} role="status">
      {texto}
    </p>
  )
}

export default Aviso
