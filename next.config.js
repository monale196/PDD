/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ⚠️ NO necesitamos "standalone"; Amplify ejecuta serverless automáticamente
  // output: "standalone",

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

  // ⚠️ NO expongas las variables al cliente
  // ⚠️ Amplify las va a inyectar SOLO en serverless functions
  env: {},

  // ❌ eliminar por completo experimental.appDir — Next 16 ya no lo soporta
  // experimental: {
  //   appDir: true,
  // },
};

module.exports = nextConfig;