// Página de inicio con la marca y los botones principales.
import hero from '../assets/hero.svg'

function Inicio({ irA, cobertura }) {
  const descuento = cobertura?.descuento
  return (
    <section className="hero">
      <div className="contenedor hero-caja">
        <div className="hero-texto">
          {descuento?.activo && (
            <button type="button" className="cinta-descuento" onClick={() => irA('cobertura')}>
              <strong>{descuento.porcentaje}% menos</strong> en el traslado por {descuento.motivo}
            </button>
          )}
          <span className="etiqueta-mano">¡se descompuso otra vez!</span>
          <h1>Reparación técnica <span className="resaltado">a domicilio</span></h1>
          <p>
            Mandamos a un técnico de confianza hasta la puerta de tu casa para arreglar tu celular,
            laptop, PC, tablet, consola o pantalla. Sin filas, sin dejar tu equipo tirado en un mostrador.
          </p>
          <div className="hero-botones">
            <button className="boton boton-primario" onClick={() => irA('tecnicos')}>Ver técnicos disponibles</button>
            <button className="boton boton-secundario" onClick={() => irA('cobertura')}>Revisar cobertura</button>
          </div>
          <div className="hero-datos">
            <div><strong>+1,200</strong><span>reparaciones hechas</span></div>
            <div><strong>4.8★</strong><span>calificación promedio</span></div>
            <div><strong>45 min</strong><span>tiempo de llegada aprox.</span></div>
          </div>
        </div>
        <div className="hero-imagen">
          <img src={hero} alt="Técnico de RepaTech con su caja de herramientas llegando a una casa" />
        </div>
      </div>
    </section>
  )
}

export default Inicio
