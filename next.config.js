/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { turbo: false },
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
  env: {},
};
module.exports = nextConfig;