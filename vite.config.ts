import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'vendor-ui': ['lucide-react', 'react-hot-toast', 'motion'],
          'vendor-charts': ['recharts'],
          // Separate large components into feature chunks
          'component-dashboards': [
            './src/components/ClientDashboard.tsx',
            './src/components/StaffDashboard.tsx',
            './src/components/CandidateDashboard.tsx'
          ],
          'component-forms': [
            './src/components/RegistrationForm.tsx',
            './src/components/LoginModal.tsx'
          ],
        }
      }
    },
    // Increase chunk size warning limit since we're splitting properly
    chunkSizeWarningLimit: 600,
    // Enable minification for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
});
