/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oseka.gr",
      },
    ],
  },
};

export default nextConfig;
