import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@common': path.resolve(__dirname, './src/common'),
      '@features': path.resolve(__dirname, './src/features'),
      'next/link': path.resolve(__dirname, './src/common/lib/next-link.tsx'),
      'next/image': path.resolve(__dirname, './src/common/lib/next-image.tsx'),
      'next/navigation': path.resolve(__dirname, './src/common/lib/next-navigation.tsx'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
