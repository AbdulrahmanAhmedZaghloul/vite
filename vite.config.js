import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // base: '/vite',
  // ,
  //   "predeploy": "npm run build",
  //   "deploy": "gh-pages -d dist"
  plugins: [react()],
})
