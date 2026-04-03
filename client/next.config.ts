import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed custom turbopack root to prevent watcher recursion loops on Windows.
  // Next.js correctly limits file watching to the directory containing this config.
};

export default nextConfig;
