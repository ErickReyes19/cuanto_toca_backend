import type { MetadataRoute } from "next";

import { RUTAS_PRIVADAS, SITIO } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Nada detrás de sesión, ni los enlaces de invitación de un solo uso.
        disallow: RUTAS_PRIVADAS,
      },
    ],
    sitemap: `${SITIO.url}/sitemap.xml`,
    host: SITIO.url,
  };
}
