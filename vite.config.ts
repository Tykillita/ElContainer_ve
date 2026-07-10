import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        // Funcion (no objeto): la forma objeto mete los chunks en el grafo inicial
        // y precargaba three/r3f (~1MB) en todas las paginas aunque solo Beams los usa.
        manualChunks(id: string) {
          // Modulos virtuales de vite (p.ej. \0vite/preload-helper) al vendor comun;
          // sueltos, rollup los colocaba dentro de three-vendor y el entry lo precargaba
          if (!id.includes('node_modules')) {
            return id.startsWith('\0') || id.includes('vite/') ? 'vendor' : undefined;
          }
          // three aislado para que solo cargue con Beams; firebase separado para cache.
          // Resto en un solo vendor: si se deja a rollup, colocaba helpers compartidos
          // (react, use-sync-external-store) dentro de three-vendor y el entry lo precargaba.
          if (/node_modules[\\/](three|@react-three)[\\/]/.test(id)) return 'three-vendor';
          if (/node_modules[\\/](@firebase|firebase)[\\/]/.test(id)) return 'firebase-vendor';
          return 'vendor';
        }
      }
    },
    chunkSizeWarningLimit: 1000 // Increase limit to 1000kb
  },
  server: {
    // listen on all interfaces so other devices / LAN IP can reach the dev server
    host: true,
    port: 5173,
    // HMR settings: prefer environment-driven host and protocol for cross-platform usage.
    // If you don't set VITE_HMR_HOST, Vite will infer the correct host from the incoming request.
    hmr: {
      host: process.env.VITE_HMR_HOST || undefined,
      protocol: process.env.HTTPS === 'true' ? 'wss' : 'ws'
    }
  },
  preview: {
    port: 4173
  }
})
