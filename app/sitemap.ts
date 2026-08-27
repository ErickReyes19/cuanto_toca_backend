import type { MetadataRoute } from "next";

import { IDIOMAS, RUTAS } from "@/lib/i18n";
import { PAGINAS_INDEXABLES, urlAbsoluta, urlsPorIdioma } from "@/lib/site";

/**
 * Sitemap con las dos versiones de cada página.
 *
 * Cada entrada declara sus alternativas en `alternates.languages`, que es como
 * Google entiende que `/dividir-la-despensa` y `/en/split-grocery-bill` son la
 * misma página en dos idiomas y no contenido duplicado.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();

  return PAGINAS_INDEXABLES.flatMap(({ clave, prioridad, frecuencia }) => {
    const alternativas = urlsPorIdioma(clave);

    return IDIOMAS.map((idioma) => ({
      url: urlAbsoluta(RUTAS[clave][idioma]),
      lastModified: ahora,
      changeFrequency: frecuencia,
      priority: prioridad,
      alternates: {
        languages: {
          es: alternativas.es,
          "en-US": alternativas.en,
          "x-default": alternativas.es,
        },
      },
    }));
  });
}
