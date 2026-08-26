import type { MetadataRoute } from "next";

import { RUTAS_PUBLICAS, SITIO } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();

  return RUTAS_PUBLICAS.map(({ ruta, prioridad, frecuencia }) => ({
    url: `${SITIO.url}${ruta === "/" ? "" : ruta}`,
    lastModified: ahora,
    changeFrequency: frecuencia,
    priority: prioridad,
  }));
}
