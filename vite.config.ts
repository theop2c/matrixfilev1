import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  resolve: {
    alias: {
       '@': path.resolve(__dirname, './src'), // Use __dirname safely here
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          pdf: ['pdfjs-dist'],
          office: ['docx', 'xlsx'],
          ai: ['openai']
        }
      }
    },
    chunkSizeWarningLimit: 5000,
    target: 'esnext'
  }
});