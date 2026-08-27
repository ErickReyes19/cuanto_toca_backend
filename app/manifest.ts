import type { MetadataRoute } from "next";

import { IDIOMA_POR_DEFECTO, LANG_HTML, diccionario } from "@/lib/i18n";
import { SITIO } from "@/lib/site";

/**
 * El manifest es único para toda la app instalada, así que va en el idioma por
 * defecto. Quien instale desde `/en` seguirá viendo el sitio en inglés: el
 * idioma lo decide la URL de arranque, no el manifest.
 */
export default function manifest(): MetadataRoute.Manifest {
  const t = diccionario(IDIOMA_POR_DEFECTO);

  return {
    name: `${SITIO.nombre} · ${t.sitio.tagline}`,
    short_name: SITIO.nombreCorto,
    description: t.sitio.descripcionCorta,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: LANG_HTML[IDIOMA_POR_DEFECTO],
    background_color: SITIO.colorFondo,
    theme_color: SITIO.colorTema,
    categories: ["finance", "productivity", "utilities"],
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
