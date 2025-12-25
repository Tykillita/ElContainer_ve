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
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Split vendor dependencies into separate chunks
                    'react-vendor': ['react', 'react-dom'],
                    'router-vendor': ['react-router-dom'],
                    'three-vendor': ['three'],
                    'r3f-vendor': ['@react-three/fiber', '@react-three/drei', '@react-three/rapier'],
                    'ui-vendor': ['lucide-react', 'clsx', 'class-variance-authority', 'tailwind-merge'],
                    'md-vendor': ['remark-parse', 'remark-gfm', 'remark-rehype', 'rehype-stringify', 'unified'],
                    'color-vendor': ['color-thief-react'],
                    'motion-vendor': ['motion', 'styled-components']
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
});
