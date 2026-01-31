import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'vrcxkg-ip-190-236-82-63.tunnelmole.net'
    ]
  }
})
