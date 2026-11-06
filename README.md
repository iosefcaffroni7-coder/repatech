# RepaTech

**Reparación técnica a domicilio.** RepaTech conecta a las personas con técnicos de confianza de su zona que van hasta su casa a arreglar celulares, portátiles, PC, tablets, consolas y televisores.

Proyecto final, Ruta Avanzada de Jóvenes creaTIvos: una aplicación web full stack publicada en internet y con inteligencia artificial personalizada para el negocio.

- **Página publicada:** https://iosefcaffroni7-coder.github.io/repatech/
- **Panel de administrador:** https://iosefcaffroni7-coder.github.io/repatech/#admin
- **API publicada:** https://repatech-api.onrender.com/api/salud *(si Render te da otra dirección, cámbiala aquí y en `frontend/src/api.js`)*

### Cómo probarlo en un minuto

1. Abre la página y recorre los pasos: Servicios, Técnicos, Cobertura, Reseñas y Contacto.
2. Pregúntale algo a Repi en la burbuja de la esquina (por ejemplo: "se me mojó el celular").
3. Envía una solicitud en "Pide tu visita".
4. Entra al panel (`/#admin`), búscala, márcala como atendida y prueba "Redactar mensaje con IA".

> La primera carga puede tardar unos 50 segundos si el servidor gratuito estaba dormido.

---

## Tecnologías (las mismas de los cursos)

| Parte | Tecnología |
|-------|------------|
| Frontend | **React** con **Vite**: componentes, JSX, props y estilos con CSS |
| Backend | **Node.js** + **Express**: rutas con GET, POST, PUT y DELETE |
| Base de datos | **MongoDB** (Atlas) con **Mongoose**: modelos en la carpeta `modelos/` |
| IA | **Google Gemini**, llamada desde el backend |
| Publicación | GitHub Pages (frontend) y Render (backend) |

## Entregables

| # | Entregable | Dónde está |
|---|------------|------------|
| 01 | App publicada | Frontend en GitHub Pages + backend en Render |
| 02 | Repositorio GitHub | Este repositorio, con historial de commits |
| 03 | Marca + home | Componente `Inicio.jsx`: logo, colores, tipografías e inicio propios |
| 04 | Catálogo | `Servicios.jsx` y `Tecnicos.jsx`, con filtro por tipo de aparato |
| 05 | Contacto real | `Contacto.jsx` guarda las solicitudes en MongoDB |
| 06 | Admin con login | `Admin.jsx`: usuario y contraseña; ver, atender y borrar solicitudes y reseñas |
| 07 | IA personalizada | Chatbot **Repi** (`Chat.jsx`), que conoce servicios, técnicos, cobertura y tono de marca, y un generador de mensajes de WhatsApp en el panel |

## Arquitectura

```
 Navegador (GitHub Pages)            Servidor (Render)                    Nube
┌───────────────────────┐  fetch  ┌──────────────────────────┐  Mongoose ┌──────────────────┐
│ frontend/ (React)     │ ──────▶ │ backend/ (Node+Express)  │ ────────▶ │ MongoDB Atlas    │
│ componentes con props │ ◀────── │ rutas + modelos + login  │           └──────────────────┘
└───────────────────────┘  JSON   │                          │   API     ┌──────────────────┐
                                  │ ia/asistente.js          │ ────────▶ │ Google Gemini    │
                                  └──────────────────────────┘           └──────────────────┘
```

- El **frontend** muestra la página y le pide datos a la API con `fetch`.
- El **backend** recibe las peticiones, guarda en MongoDB y es el único que tiene la clave de la IA.
- La clave de Gemini y el enlace de MongoDB **nunca** llegan al navegador: viven en variables de entorno.

## Estructura de carpetas

```
repatech/
├── frontend/                       → React + Vite (se publica en GitHub Pages)
│   ├── index.html                  → HTML base, React se monta en <div id="root">
│   ├── vite.config.js              → configuración de Vite (base /repatech/)
│   ├── public/favicon.svg
│   └── src/
│       ├── main.jsx                → arranca React
│       ├── App.jsx                 → decide qué sección se muestra
│       ├── api.js                  → URL del backend y función pedirAPI
│       ├── datos.js                → catálogo: servicios y técnicos
│       ├── index.css               → estilos, responsive y animaciones
│       ├── assets/                 → logo e ilustraciones SVG
│       └── componentes/
│           ├── Encabezado.jsx      → menú (hamburguesa en celular)
│           ├── Inicio.jsx          → home con la marca
│           ├── Servicios.jsx + TarjetaServicio.jsx
│           ├── Tecnicos.jsx + TarjetaTecnico.jsx
│           ├── Cobertura.jsx       → calculadora de traslado
│           ├── Resenas.jsx + TarjetaResena.jsx
│           ├── Contacto.jsx        → formulario "Pide tu visita"
│           ├── Chat.jsx            → chatbot Repi
│           ├── Admin.jsx + TarjetaSolicitud.jsx + Admin.css
│           ├── BotonCarga.jsx      → botón reutilizable con estado de carga
│           ├── Aviso.jsx           → mensajes de éxito o error
│           └── Pie.jsx             → pie de página con créditos
├── backend/                        → Node + Express + Mongoose (se publica en Render)
│   ├── index.js                    → conecta MongoDB, configura Express y las rutas
│   ├── negocio.js                  → datos del negocio para la IA
│   ├── modelos/
│   │   ├── Solicitud.js            → esquema de Mongoose de las solicitudes
│   │   └── Resena.js               → esquema de Mongoose de las reseñas
│   ├── rutas/
│   │   ├── solicitudes.js          → POST del formulario de contacto
│   │   ├── resenas.js              → GET y POST de reseñas
│   │   ├── chat.js                 → POST del chatbot
│   │   ├── admin.js                → login + rutas privadas (GET, PUT, DELETE)
│   │   └── errores.js              → convierte errores de Mongoose en mensajes claros
│   ├── ia/asistente.js             → instrucciones del negocio para la IA y llamada a Gemini
│   └── .env.example                → variables de entorno de ejemplo
├── .github/workflows/pages.yml     → compila React y lo publica en GitHub Pages
└── render.yaml                     → configuración para publicar el backend en Render
```

## API

| Método | Ruta | Para qué | ¿Requiere login? |
|--------|------|----------|-----------|
| GET | `/api/salud` | Saber si el servidor está despierto | No |
| POST | `/api/solicitudes` | Guardar una solicitud de visita | No |
| GET | `/api/resenas` | Listar reseñas | No |
| POST | `/api/resenas` | Publicar una reseña | No |
| POST | `/api/chat` | Preguntarle al asistente Repi | No |
| POST | `/api/admin/login` | Iniciar sesión, devuelve un token | No |
| GET | `/api/admin/solicitudes` | Ver solicitudes | Sí |
| PUT | `/api/admin/solicitudes/:id` | Marcar como pendiente o atendida | Sí |
| DELETE | `/api/admin/solicitudes/:id` | Borrar una solicitud | Sí |
| POST | `/api/admin/solicitudes/:id/mensaje-ia` | La IA redacta un WhatsApp para el cliente | Sí |
| DELETE | `/api/admin/resenas/:id` | Borrar una reseña | Sí |

Las rutas que requieren login necesitan el encabezado `Authorization: Bearer <token>`.

## Cómo correrlo en tu computador

Requisitos: [Node.js](https://nodejs.org) 20.12 o más nuevo y una base de datos gratis en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).

**1. Backend** (en una terminal):
```bash
cd backend
npm install
copy .env.example .env      # en Mac/Linux: cp .env.example .env
# abre .env y pega tu enlace de MongoDB en MONGODB_URI
npm start                   # debe decir "Base de datos conectada"
```

**2. Frontend** (en otra terminal):
```bash
cd frontend
npm install
npm run dev                 # abre la dirección que muestra (http://localhost:5173/repatech/)
```

Usuario del panel: `admin` / contraseña `thesun`.
Sin `GEMINI_API_KEY` el chatbot igual responde con respuestas básicas; con la clave responde con IA.

## Cómo publicarlo

**Backend en Render (gratis)**
1. Entra a [render.com](https://render.com) con tu cuenta de GitHub.
2. *New → Blueprint* → elige este repositorio. Render lee `render.yaml`.
3. Pega tu `MONGODB_URI` (de Atlas) y tu `GEMINI_API_KEY` ([sácala gratis aquí](https://aistudio.google.com/apikey)).

**Frontend en GitHub Pages**
1. En el repositorio: *Settings → Pages → Source: GitHub Actions*.
2. Cada `git push` a `main` compila React y publica la página sola.

## Decisiones técnicas

- **React + Vite:** la página está dividida en componentes pequeños que reciben datos por **props** (por ejemplo `TarjetaTecnico` sirve para cualquier técnico). El catálogo está en `datos.js` y se recorre con `.map()`.
- **Una sección a la vez:** `App.jsx` guarda en el estado qué sección se ve; al cambiar, la nueva aparece con una animación CSS.
- **MongoDB + Mongoose:** los modelos (`modelos/`) definen los campos y las reglas (obligatorio, largo mínimo, valores permitidos). Si un dato no cumple, Mongoose no lo guarda y la API devuelve un mensaje claro.
- **CRUD con los métodos HTTP:** GET para leer, POST para crear, PUT para actualizar y DELETE para borrar.
- **Login con token:** el backend entrega un token aleatorio al iniciar sesión; el panel lo guarda en `sessionStorage` y lo envía en cada petición privada.
- **IA personalizada:** `ia/asistente.js` le da a Gemini la información real del negocio (técnicos, servicios, fórmula de cobertura, horario) y el tono de marca. Si no hay clave, hay respuestas de respaldo para que la demo nunca falle.
- **UX:** responsive en celular y computador, animaciones, botones con estado de carga (`BotonCarga`), mensajes de error claros (`Aviso`) y aviso si el servidor gratuito está "despertando".

## Limitaciones y mejoras futuras

- El servidor gratuito de Render se "duerme" tras 15 minutos sin uso; la primera petición puede tardar unos 50 segundos.
- Un solo usuario administrador; se podrían agregar más usuarios con contraseñas cifradas guardadas en MongoDB.

---

## Autor

**Iosef (The_Sun)**
- Correo: [iosefcaffroni7@gmail.com](mailto:iosefcaffroni7@gmail.com)
- Celular / WhatsApp: [304 643 7285](https://wa.me/573046437285)
- GitHub: [iosefcaffroni7-coder](https://github.com/iosefcaffroni7-coder)

RepaTech © 2026
