import type { MetadataRoute } from "next";

import { SITIO } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITIO.nombre} · Divide gastos entre amigos`,
    short_name: SITIO.nombreCorto,
    description: SITIO.descripcionCorta,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: SITIO.idioma,
    background_color: SITIO.colorFondo,
    theme_color: SITIO.colorTema,
    categories: ["finance", "productivity", "utilities"],
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
