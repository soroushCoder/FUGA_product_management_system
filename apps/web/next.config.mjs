/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' }
    ]
  },
  // lets Next transpile TS from the workspace package
  transpilePackages: ['@fuga/shared']
};
export default nextConfig;
