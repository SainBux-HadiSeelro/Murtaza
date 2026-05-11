/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    dangerouslyAllowSVG: false,
    remotePatterns: [],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable filesystem cache in dev — prevents corrupt .pack.gz errors
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
