/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Habilitar SSR con modo standalone
  output: 'standalone', // Esto le dice a Next.js que debe construir la aplicación para un entorno de servidor

  images: {
    unoptimized: true, // Desactiva la optimización de imágenes si usas imágenes externas o no optimizadas en Amplify
    domains: ['newsroomcache.s3.eu-north-1.amazonaws.com'], // Añadir tu dominio de S3 para permitir cargar imágenes desde allí
  },

  env: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION || "eu-north-1",
    S3_BUCKET: process.env.S3_BUCKET || "newsroomcache",
  },

  // Otros ajustes que puedas necesitar
  experimental: {
    appDir: true, // Habilitar App Router (si usas Next.js 13 con el nuevo sistema de directorios de app)
  },
};

module.exports = nextConfig;
