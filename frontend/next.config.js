/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 开发环境不需要代理，因为后端已配置 CORS
  // Development environment doesn't need proxy since backend has CORS configured
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://localhost:3001/api/v1/:path*',
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
