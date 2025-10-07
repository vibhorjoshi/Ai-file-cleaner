/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ai-file-cleanup/ui', '@ai-file-cleanup/core'],
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
  },
  async rewrites() {
    const apiUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig