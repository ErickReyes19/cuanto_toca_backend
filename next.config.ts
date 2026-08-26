import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // No anunciar la versión del framework en cada respuesta.
  poweredByHeader: false,

  /**
   * El cliente de Prisma se genera en `lib/generated/prisma`, fuera de
   * node_modules. El análisis de dependencias de Next sigue los `import`, pero
   * el motor de consultas es un binario que se carga en tiempo de ejecución
   * (`.so.node`), así que nadie lo importa y no llega al bundle de la función.
   *
   * Sin esto, en Vercel truena con:
   *   PrismaClientInitializationError: could not locate the Query Engine for
   *   runtime "rhel-openssl-3.0.x"
   */
  outputFileTracingIncludes: {
    "/**": ["./lib/generated/prisma/**/*"],
    "/*": ["./lib/generated/prisma/**/*"],
  },
};

export default nextConfig;
