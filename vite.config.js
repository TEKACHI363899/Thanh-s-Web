import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: ['.web.js', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  define: {
    global: 'window',
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          vendor: ['lucide-react', 'react-native-web']
        }
      }
    }
  }
});
