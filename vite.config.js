import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { fileURLToPath } from 'url';
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
export default defineConfig({
    plugins: [react()],
    assetsInclude: ['**/*.glb'],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
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
});
