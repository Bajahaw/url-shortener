import { defineConfig } from 'vite'

export default defineConfig({
    base: '/url-shortener/',
    server: {
        proxy: {
            '/api': {
                target: 'https://url.radhi.tech',
                changeOrigin: true,
                rewrite: path => path.replace(/^\/api/, '')
            }
        }
    }
})
