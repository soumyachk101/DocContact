import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Prisma + bcryptjs are native modules that must stay on the Node server,
  // never bundled into the edge runtime.
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'bcryptjs'],
};

export default nextConfig;
