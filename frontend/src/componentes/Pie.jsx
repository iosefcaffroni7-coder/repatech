// Pie de página con horario, contacto y créditos del autor.
import logo from '../assets/logo.svg'

function Pie({ irA }) {
  function abrirAdmin(evento) {
    evento.preventDefault()
    irA('admin')
  }

  return (
    <footer className="pie">
      <div className="contenedor pie-caja">
        <div>
          <p className="logo logo-pie">
            <img src={logo} alt="Logo RepaTech" width="32" />
            <span>Repa<b>Tech</b></span>
          </p>
          <p>Reparación técnica a domicilio, hecha por gente de tu zona.</p>
        </div>
        <div>
          <h4>Horario</h4>
          <p>Lunes a sábado, 9am - 7pm</p>
          <p>Domingo, 10am - 2pm</p>
        </div>
        <div>
          <h4>Contacto</h4>
          <p><a href="mailto:iosefcaffroni7@gmail.com">iosefcaffroni7@gmail.com</a></p>
          <p><a href="https://wa.me/573046437285" target="_blank" rel="noopener">WhatsApp 304 643 7285</a></p>
        </div>
      </div>
      <p className="derechos">
        RepaTech © 2026 · Desarrollado por <strong>Iosef (The_Sun)</strong> ·{' '}
        <a href="mailto:iosefcaffroni7@gmail.com">iosefcaffroni7@gmail.com</a> ·{' '}
        <a href="https://wa.me/573046437285" target="_blank" rel="noopener">304 643 7285</a> ·{' '}
        <a href="#admin" className="enlace-admin" onClick={abrirAdmin}>Acceso administrador</a>
      </p>
    </footer>
  )
}

export default Pie
