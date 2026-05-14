import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Tells Next.js to generate static files in the "out" folder
  output: "export",

  // Silence the "multiple lockfiles" warning by pointing to this folder as root
  outputFileTracingRoot: path.join(__dirname),

  // Optional: set basePath or assetPrefix if you're hosting in a subdirectory
  // basePath: "/myapp",
  // assetPrefix: "/myapp/",
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
