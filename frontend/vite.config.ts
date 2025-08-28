import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import svgr from "vite-plugin-svgr";

import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true
    }),
    viteReact(),
    tailwindcss(),
    svgr()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
