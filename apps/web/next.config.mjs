/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@mayan/shared"],
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;
