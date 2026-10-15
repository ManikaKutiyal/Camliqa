/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable the webpack build worker so build errors surface reliably in logs.
  // (Some environments swallow worker stderr, resulting in "webpack errors" with no details.)
  experimental: {
    webpackBuildWorker: false
  },
  webpack(config, { dev }) {
    // Work around intermittent webpack filesystem cache rename ENOENTs in dev.
    if (dev) config.cache = false;
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "m.media-amazon.com", pathname: "/**" },
      { protocol: "https", hostname: "media.istockphoto.com", pathname: "/**" },
      { protocol: "https", hostname: "www.camliqa.com", pathname: "/**" },
      { protocol: "https", hostname: "images.apollo247.in", pathname: "/**" },
      { protocol: "https", hostname: "www.shutterstock.com", pathname: "/**" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/**" },
      { protocol: "https", hostname: "*.supabase.in", pathname: "/**" },
      { protocol: "https", hostname: "www.arganiernoir.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "images.openai.com",
      },
      { protocol: "https", hostname: "terrapintrading.co.uk", pathname: "/**" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "static.toiimg.com", pathname: "/**" },
      { protocol: "https", hostname: "5.imimg.com", pathname: "/**" },
      { protocol: "https", hostname: "www.loveorganically.in", pathname: "/**" },
      { protocol: "https", hostname: "pixabay.com", pathname: "/**" },
      { protocol: "https", hostname: "*.pixabay.com", pathname: "/**" },
    ]
  }
};

export default nextConfig;
