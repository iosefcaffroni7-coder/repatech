# RepaTech 🔧

**Reparación técnica a domicilio.** RepaTech conecta a las personas con técnicos de confianza de su zona que van hasta su casa a arreglar celulares, portátiles, PC, tablets, consolas y televisores.

Proyecto final, Ruta Avanzada de Jóvenes creaTIvos: una aplicación web full stack publicada en internet y con inteligencia artificial personalizada para el negocio.

- **Página publicada:** `https://TU-USUARIO.github.io/repatech/` *(cámbialo por tu enlace)*
- **API publicada:** `https://repatech-api.onrender.com/api/salud` *(cámbialo por tu enlace)*

---

## ✅ Entregables

| # | Entregable | Dónde está |
|---|------------|------------|
| 01 | App publicada | Frontend en GitHub Pages + backend en Render |
| 02 | Repositorio GitHub | Este repositorio, con historial de commits |
| 03 | Marca + home | `frontend/index.html`: logo, colores, tipografías e inicio propios |
| 04 | Catálogo | Servicios por aparato y técnicos con filtro por especialidad |
| 05 | Contacto real | Formulario "Pide tu visita" que se guarda en el backend |
| 06 | Admin con login | `frontend/admin.html`: usuario y contraseña, ver/atender/borrar solicitudes y reseñas |
| 07 | IA personalizada | Chatbot **Repi** que conoce servicios, técnicos, cobertura y tono de marca + generador de mensajes de WhatsApp en el panel |

## 🏗️ Arquitectura

```
 Navegador (GitHub Pages)                 Servidor (Render)                 Google Gemini
┌──────────────────────────┐   fetch    ┌───────────────────────────┐   API   ┌──────────────┐
│ frontend/                │ ─────────▶ │ backend/  (Node + Express)│ ──────▶ │ Modelo de IA │
│ HTML + CSS + JavaScript  │ ◀───────── │ rutas, validación, login  │ ◀────── │              │
└──────────────────────────┘    JSON    │ datos/*.json (base datos) │         └──────────────┘
                                        └───────────────────────────┘
```

- El **frontend** solo muestra cosas y le pide datos a la API.
- El **backend** valida, guarda los datos y es el único que tiene la clave de la IA.
- La clave de Gemini **nunca** llega al navegador; por eso la IA se llama desde el backend.

## 📁 Estructura de carpetas

```
repatech/
├── frontend/                 → lo que se publica en GitHub Pages
│   ├── index.html            → página principal (inicio, servicios, técnicos, cobertura, reseñas, contacto)
│   ├── admin.html            → panel de administrador
│   ├── css/style.css         → estilos generales, responsive y animaciones
│   ├── css/admin.css         → estilos solo del panel
│   ├── js/config.js          → URL de la API (local o Render)
│   ├── js/api.js             → funciones compartidas: pedirAPI, botón cargando, avisos
│   ├── js/script.js          → navegación, filtros, cobertura, reseñas y contacto
│   ├── js/chat.js            → chatbot Repi
│   ├── js/admin.js           → login y gestión del panel
│   └── imagenes/             → logo e ilustraciones SVG
├── backend/                  → API en Node.js + Express
│   ├── server.js             → arranca el servidor y conecta las rutas
│   ├── negocio.js            → datos del negocio (técnicos, servicios, cobertura)
│   ├── db.js                 → leer y guardar en archivos JSON
│   ├── validar.js            → validaciones reutilizables
│   ├── rutas/                → una ruta por funcionalidad
│   │   ├── solicitudes.js    → formulario de contacto
│   │   ├── resenas.js        → reseñas públicas
│   │   ├── chat.js           → chatbot
│   │   └── admin.js          → login + rutas privadas
│   ├── ia/asistente.js       → instrucciones del negocio para la IA y llamada a Gemini
│   ├── datos/                → "base de datos" en JSON
│   └── .env.example          → variables de entorno de ejemplo
├── .github/workflows/pages.yml → publica el frontend automáticamente
└── render.yaml               → configuración para publicar el backend
```

## 🔌 API

| Método | Ruta | Para qué | ¿Privada? |
|--------|------|----------|-----------|
| GET | `/api/salud` | Saber si el servidor está despierto | |
| POST | `/api/solicitudes` | Guardar una solicitud de visita | |
| GET | `/api/resenas` | Listar reseñas | |
| POST | `/api/resenas` | Publicar reseña | |
| POST | `/api/chat` | Preguntarle al asistente Repi | |
| POST | `/api/admin/login` | Iniciar sesión, devuelve un token | |
| GET | `/api/admin/solicitudes` | Ver solicitudes | 🔒 |
| PATCH | `/api/admin/solicitudes/:id` | Marcar como pendiente o atendida | 🔒 |
| DELETE | `/api/admin/solicitudes/:id` | Borrar solicitud | 🔒 |
| POST | `/api/admin/solicitudes/:id/mensaje-ia` | La IA redacta un WhatsApp para el cliente | 🔒 |
| DELETE | `/api/admin/resenas/:id` | Borrar reseña | 🔒 |

Las rutas 🔒 necesitan el encabezado `Authorization: Bearer <token>`.

## 💻 Cómo correrlo en tu computador

Requisitos: [Node.js](https://nodejs.org) 20.12 o más nuevo.

```bash
# 1. Backend
cd backend
npm install
copy .env.example .env      # en Mac/Linux: cp .env.example .env
npm start                   # queda en http://localhost:3000

# 2. Frontend: abre frontend/index.html con Live Server de VS Code
```

Usuario del panel por defecto: `admin` / `repatech2026` (cámbialo en `.env`).
Sin `GEMINI_API_KEY` el chatbot igual responde con respuestas básicas; con la clave responde con IA.

## 🚀 Cómo publicarlo

**Backend en Render (gratis)**
1. Entra a [render.com](https://render.com) con tu cuenta de GitHub.
2. *New → Blueprint* → elige este repositorio. Render lee `render.yaml`.
3. Escribe `ADMIN_CLAVE` y tu `GEMINI_API_KEY` ([sácala gratis aquí](https://aistudio.google.com/apikey)).
4. Copia la URL que te da Render y ponla en `frontend/js/config.js`.

**Frontend en GitHub Pages**
1. En el repositorio: *Settings → Pages → Source: GitHub Actions*.
2. Cada `git push` a `main` publica la carpeta `frontend` sola.

## 🧠 Decisiones técnicas

- **JavaScript sin frameworks en el frontend:** la página es pequeña; así cualquier persona entiende el código sin instalar nada.
- **Express sin librerías extra:** CORS y `.env` se resuelven con pocas líneas (`process.loadEnvFile` viene en Node).
- **Base de datos en JSON (`db.js`):** fácil de revisar a mano. Como todas las rutas usan solo `leer` y `guardar`, cambiarla por MongoDB o PostgreSQL solo toca ese archivo.
- **Login con token:** el backend entrega un token aleatorio al iniciar sesión; el panel lo guarda en `sessionStorage` (se borra al cerrar la pestaña) y lo envía en cada petición privada.
- **Seguridad básica:** validación en el backend (no solo en el navegador), textos de usuarios pintados con `textContent` para evitar código inyectado, y claves solo en variables de entorno.
- **IA personalizada:** `ia/asistente.js` le da a Gemini la información real del negocio (técnicos, servicios, fórmula de cobertura, horario) y el tono de marca. Si no hay clave, hay respuestas de respaldo para que la demo nunca falle.
- **UX:** responsive en celular y computador, animaciones entre secciones, botones con estado de carga, mensajes de error claros y aviso si el servidor gratuito está "despertando".

## ⚠️ Limitaciones y mejoras futuras

- En el plan gratuito de Render el disco no es permanente: los JSON vuelven a su estado inicial cuando el servidor se reinicia. El siguiente paso es usar una base de datos en la nube (MongoDB Atlas o Supabase).
- El servidor gratuito se "duerme" tras 15 minutos sin uso; la primera petición puede tardar unos 50 segundos.
- Un solo usuario administrador; se podrían agregar roles y contraseñas cifradas.

---

Hecho por **The_Sun** · RepaTech © 2026
