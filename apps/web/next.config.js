/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ai-file-cleanup/ui', '@ai-file-cleanup/core'],
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  async rewrites() {
    return []
  },
}

module.exports = nextConfig