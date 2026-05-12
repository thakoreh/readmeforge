import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  outputFileTracingRoot: __dirname,
  images: { unoptimized: true },
  basePath: "/readmeforge",
  trailingSlash: true,
};

export default nextConfig;
