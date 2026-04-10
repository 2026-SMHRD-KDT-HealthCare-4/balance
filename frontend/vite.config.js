import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  optimizeDeps: {
    // 기존 MediaPipe 설정에 TensorFlow.js와 Teachable Machine 설정을 추가합니다.
    include: [
      '@mediapipe/pose', 
      '@mediapipe/camera_utils',
      '@teachablemachine/pose', 
      '@tensorflow/tfjs',
      '@tensorflow/tfjs-core',
      '@tensorflow/tfjs-converter',
      '@tensorflow/tfjs-backend-webgl'
    ],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
})