import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // !! 警告 !!
    // 在生产环境中不建议禁用类型检查
    ignoreBuildErrors: true,
  },
  eslint: {
    // 同时也禁用 ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
