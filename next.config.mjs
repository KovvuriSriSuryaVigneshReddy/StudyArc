/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  swcMinify: true,
  webpack: (config) => {
    // Handle canvas/node-specific packages if needed
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
