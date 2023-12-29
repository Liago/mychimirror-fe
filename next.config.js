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
        ],
      },
      sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
      },
}

module.exports = nextConfig
