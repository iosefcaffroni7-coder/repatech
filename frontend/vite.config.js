import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: la página se publica en https://iosefcaffroni7-coder.github.io/repatech/
// por eso todas las rutas de archivos deben empezar con /repatech/
export default defineConfig({
  plugins: [react()],
  base: '/repatech/'
})
