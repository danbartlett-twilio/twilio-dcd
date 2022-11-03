import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(
  {
  plugins: [vue()],
  base: "/clients/end-user-view/",
  build: {    
    outDir: "../../assets/clients/end-user-view/",
    
  },  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
