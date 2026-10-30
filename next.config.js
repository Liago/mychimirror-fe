/** @type {import('next').NextConfig} */

const nextConfig = {
    // Gli URL di WordPress finiscono tutti con "/": restano identici per la SEO
    trailingSlash: true,
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
