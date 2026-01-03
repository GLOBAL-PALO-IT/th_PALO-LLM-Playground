/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Enable experimental features for better performance
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Optimize for faster page loads
  swcMinify: true,
  // Enable compression
  compress: true,
}

export default nextConfig
