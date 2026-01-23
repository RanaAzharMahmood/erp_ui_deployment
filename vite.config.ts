import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/erp_ui/',
  server: {
    port: 3000,
    open: true
  }
})

