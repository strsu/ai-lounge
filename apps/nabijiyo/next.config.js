/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['blogfiles.pstatic.net', 'k.kakaocdn.net'],
  },
  output: 'standalone',
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false }

    // Ignore browser-only modules on the server
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      })
    }

    return config
  },
  // Node.js 런타임 설정
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'mohae.uk', '*.mohae.uk'],
    },
  },
}

module.exports = nextConfig
