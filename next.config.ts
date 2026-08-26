import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // No anunciar la versión del framework en cada respuesta.
  poweredByHeader: false,
};

export default nextConfig;
