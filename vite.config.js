import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@components': './src/components',
        },
    },
    server: {
        proxy: {
            // Proxy /gnews-rss/* to Google News to avoid CORS in dev
            '/gnews-rss': {
                target: 'https://news.google.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/gnews-rss/, ''),
                secure: true,
            },
        },
    },
})