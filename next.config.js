/** @type {import('next').NextConfig} */

const nextConfig = {
    // Gli URL di WordPress finiscono tutti con "/": restano identici per la SEO
    trailingSlash: true,
    // C'è un package-lock.json in /Users/.../Projects: la root del progetto è questa cartella
    turbopack: { root: __dirname },
    async redirects() {
        return [
            // Doppione di /contacts/ (la pagina nel menu)
            { source: '/contatti/', destination: '/contacts/', statusCode: 301 },
        ]
    },
    images: {
        remotePatterns: [
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
