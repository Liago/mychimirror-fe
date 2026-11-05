/** @type {import('next').NextConfig} */

// Indicizzazione permessa solo sul dominio vero (da attivare al go-live):
// su staging e anteprime ogni risposta ha X-Robots-Tag: noindex
const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'

const nextConfig = {
    // Gli URL di WordPress finiscono tutti con "/": restano identici per la SEO
    trailingSlash: true,
    // C'è un package-lock.json in /Users/.../Projects: la root del progetto è questa cartella
    turbopack: { root: __dirname },
    async headers() {
        const headers = [
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ]
        if (!allowIndexing) {
            headers.push({ key: 'X-Robots-Tag', value: 'noindex, nofollow' })
        }
        return [{ source: '/:path*', headers }]
    },
    async redirects() {
        return [
            // Doppione di /contacts/ (la pagina nel menu)
            { source: '/contatti/', destination: '/contacts/', statusCode: 301 },
            { source: '/en/contatti/', destination: '/en/contacts/', statusCode: 301 },
            // Archivi del portfolio del tema: l'unica voce è la rassegna stampa
            { source: '/portfolio-item/', destination: '/portfolio-item/press/', statusCode: 301 },
            { source: '/portfolio-category/press/', destination: '/portfolio-item/press/', statusCode: 301 },
            // Archivi WordPress senza una pagina equivalente: portano al blog
            // /2019/ è un articolo, non un archivio
            { source: '/:year((?!2019)\\d{4})/', destination: '/blog/', statusCode: 301 },
            { source: '/:year(\\d{4})/:month(\\d{2})/', destination: '/blog/', statusCode: 301 },
            { source: '/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/', destination: '/blog/', statusCode: 301 },
            { source: '/author/:name/', destination: '/blog/', statusCode: 301 },
            { source: '/page/:n(\\d+)/', destination: '/blog/', statusCode: 301 },
            { source: '/blog/page/:n(\\d+)/', destination: '/blog/', statusCode: 301 },
            // Sitemap di Yoast (registrate in Search Console) -> sitemap di Next
            { source: '/sitemap_index.xml', destination: '/sitemap.xml', statusCode: 301 },
            { source: '/:type([a-z_-]+)-sitemap.xml', destination: '/sitemap.xml', statusCode: 301 },
        ]
    },
    async rewrites() {
        return {
            beforeFiles: [
                // Link brevi di WordPress
                { source: '/', has: [{ type: 'query', key: 'p', value: '\\d+' }], destination: '/api/shortlink/' },
                { source: '/', has: [{ type: 'query', key: 'page_id', value: '\\d+' }], destination: '/api/shortlink/' },
            ],
            afterFiles: [{ source: '/favicon.ico', destination: '/icon.png' }],
            fallback: [],
        }
    },
    images: {
        remotePatterns: [
          // Copertina del video in home
          { protocol: 'https', hostname: 'i.ytimg.com', port: '', pathname: '/vi/**' },
          {
            protocol: 'https',
            hostname: 'www.mychicmirror.com',
            port: '',
            pathname: '/wp-content/uploads/**',
          },
          {
            protocol: 'https',
            hostname: 'www.mychicmirror.com',
            port: '',
            pathname: '/assets/**',
          },
        ],
      },
}

module.exports = nextConfig
