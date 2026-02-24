/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ⚠️ Desactivar Turbopack para que Tailwind funcione en Amplify
  experimental: {
    turbo: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "newsroomcache.s3.eu-north-1.amazonaws.com",
        pathname: "/**",
      },
    ],
    unoptimized: true,
  },

  // No expongas variables sensibles al cliente
  env: {},
};

module.exports = nextConfig;