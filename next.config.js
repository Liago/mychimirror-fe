/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
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
      sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
      },
}

module.exports = nextConfig
