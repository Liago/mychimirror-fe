/** @type {import('next').NextConfig} */

// Indicizzazione permessa solo sul dominio vero (da attivare al go-live):
// su staging e anteprime ogni risposta ha X-Robots-Tag: noindex
const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'

// Dal go-live WordPress sta su cms.: gli URL storici dei suoi file e delle sue API
// (presenti nei contenuti e usati da altri client) continuano a funzionare su www
const wordpressOrigin = new URL(
    process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL || 'https://www.mychicmirror.com'
).origin
const wordpressMoved = wordpressOrigin !== 'https://www.mychicmirror.com'
// Next ignora maiuscole e minuscole: /API/ deve restare limitato ai file .php
// per non catturare le route /api/ dell'app
const wordpressRewrites = [
    { source: '/wp-content/:path*', destination: `${wordpressOrigin}/wp-content/:path*` },
    { source: '/wp-json/:path*', destination: `${wordpressOrigin}/wp-json/:path*` },
    { source: '/wc-api/:path*', destination: `${wordpressOrigin}/wc-api/:path*` },
    { source: '/API/:file(.+\\.php)', destination: `${wordpressOrigin}/API/:file` },
]

// Link rotti nelle pagine dei Racconti di Fragola: portano al capitolo vero
const fragola = '/category/books/i-racconti-di-fragola'
const chapterRedirects = [
    ['/i-racconti-di-fragola-capitolo-1/', `${fragola}/01-capitolo-uno/`],
    ['/i-racconti-di-fragola-capitolo-ii/', `${fragola}/02-capitolo-due/`],
    ['/i-racconti-di-fragola-capitolo-iii/', `${fragola}/03-capitolo-tre/`],
    ['/i-racconti-di-fragola-capitolo-iv/', `${fragola}/04-capitolo-quattro/`],
    ['/i-racconti-di-fragola-capitolo-v/', `${fragola}/05-capitolo-cinque/`],
    [`${fragola}/0-epilogo/`, `${fragola}/06-epilogo/`],
].flatMap(([source, destination]) => [
    { source, destination, statusCode: 301 },
    { source: `/en${source}`, destination: `/en${destination}`, statusCode: 301 },
])

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
        return [
            { source: '/:path*', headers },
            // Gli indirizzi vercel.app non vanno indicizzati nemmeno dopo il go-live
            {
                source: '/:path*',
                has: [{ type: 'host', value: '.*\\.vercel\\.app' }],
                headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
            },
        ]
    },
    async redirects() {
        return [
            // Doppione di /contacts/ (la pagina nel menu)
            { source: '/contatti/', destination: '/contacts/', statusCode: 301 },
            { source: '/en/contatti/', destination: '/en/contacts/', statusCode: 301 },
            ...chapterRedirects,
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
            // Accesso al pannello di WordPress
            ...(wordpressMoved
                ? [
                      { source: '/wp-admin/:path*', destination: `${wordpressOrigin}/wp-admin/:path*`, statusCode: 302 },
                      { source: '/wp-login.php', destination: `${wordpressOrigin}/wp-login.php`, statusCode: 302 },
                  ]
                : []),
        ]
    },
    async rewrites() {
        return {
            beforeFiles: [
                // Link brevi di WordPress
                { source: '/', has: [{ type: 'query', key: 'p', value: '\\d+' }], destination: '/api/shortlink/' },
                { source: '/', has: [{ type: 'query', key: 'page_id', value: '\\d+' }], destination: '/api/shortlink/' },
                ...(wordpressMoved ? wordpressRewrites : []),
            ],
            afterFiles: [{ source: '/favicon.ico', destination: '/icon.png' }],
            fallback: [],
        }
    },
    images: {
        remotePatterns: [
          // Copertina del video in home
          { protocol: 'https', hostname: 'i.ytimg.com', port: '', pathname: '/vi/**' },
          { protocol: 'https', hostname: 'cms.mychicmirror.com', port: '', pathname: '/wp-content/uploads/**' },
          { protocol: 'https', hostname: 'cms.mychicmirror.com', port: '', pathname: '/assets/**' },
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
