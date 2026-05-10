import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  
  // ✅ ถูกต้องแล้ว: ต้องเป็น './' เพื่อให้ Electron โหลดไฟล์ผ่าน protocol file:// ได้
  base:  './',
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    // ✅ เพิ่มความเสถียร: ป้องกันปัญหาเรื่องขนาดไฟล์ Assets บางตัวใหญ่เกินไป
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // ปรับชื่อไฟล์ให้คงที่ เพื่อไม่ให้เกิดปัญหา Cache หรือ Path เก่าค้าง
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      },
    },
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    strictPort: true,
    // ✅ เพิ่ม Proxy: ช่วยให้ตอนพัฒนา (Dev Mode) หน้า UI คุยกับ Backend (Port 8000) ได้ง่ายขึ้น
    // เวลาเรียกใช้ใน React ให้ยิงไปที่ /api/... ได้เลย
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})