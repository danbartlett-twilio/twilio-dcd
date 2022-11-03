import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(
  {
  plugins: [vue()],
  base: "/clients/agent-view/",
  build: {    
    outDir: "../../assets/clients/agent-view/",
    
  },  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
