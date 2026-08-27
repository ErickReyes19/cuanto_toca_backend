import { IDIOMAS, type ClaveRuta, type Idioma, RUTAS } from "@/lib/i18n";

/**
 * Datos del sitio en un solo lugar: los usan el metadata del layout, el
 * sitemap, el robots.txt, el manifest y el JSON-LD de la portada.
 *
 * Aquí solo va lo que no cambia con el idioma. Los textos —descripción,
 * palabras clave, tagline— viven en `lib/i18n/diccionarios`.
 */

function normalizarUrl(valor: string | undefined) {
  const url = valor?.trim() || "http://localhost:3000";
  return url.replace(/\/+$/, "");
}

export const SITIO = {
  nombre: "Cuánto Toca",
  nombreCorto: "CuántoToca",
  url: normalizarUrl(process.env.NEXT_PUBLIC_APP_URL),
  /** Color de la barra del navegador en móvil y del manifest. */
  colorTema: "#0c0a09",
  colorFondo: "#ffffff",
} as const;

type EntradaSitemap = {
  clave: ClaveRuta;
  prioridad: number;
  frecuencia: "weekly" | "monthly" | "yearly";
};

/**
 * Páginas públicas que sí queremos en el sitemap y abiertas a los buscadores.
 * Se listan por clave: el sitemap saca de ahí la URL de cada idioma.
 */
export const PAGINAS_INDEXABLES: EntradaSitemap[] = [
  { clave: "inicio", prioridad: 1, frecuencia: "weekly" },

  // Contenido: lo que de verdad puede traer tráfico de búsqueda.
  { clave: "viaje", prioridad: 0.9, frecuencia: "monthly" },
  { clave: "despensa", prioridad: 0.9, frecuencia: "monthly" },
  { clave: "restaurante", prioridad: 0.9, frecuencia: "monthly" },
  { clave: "roommates", prioridad: 0.9, frecuencia: "monthly" },

  { clave: "registro", prioridad: 0.6, frecuencia: "monthly" },
  { clave: "unirse", prioridad: 0.5, frecuencia: "monthly" },
  { clave: "login", prioridad: 0.4, frecuencia: "monthly" },

  // Legales: poco tráfico, pero AdSense y los buscadores esperan encontrarlas.
  { clave: "privacidad", prioridad: 0.3, frecuencia: "yearly" },
  { clave: "terminos", prioridad: 0.3, frecuencia: "yearly" },
  { clave: "contacto", prioridad: 0.4, frecuencia: "yearly" },
];

/** URL absoluta de una ruta relativa. */
export function urlAbsoluta(ruta: string) {
  return `${SITIO.url}${ruta === "/" ? "" : ruta}`;
}

/** Las dos versiones de una página como URLs absolutas, para el `hreflang`. */
export function urlsPorIdioma(clave: ClaveRuta): Record<Idioma, string> {
  return Object.fromEntries(
    IDIOMAS.map((idioma) => [idioma, urlAbsoluta(RUTAS[clave][idioma])])
  ) as Record<Idioma, string>;
}

/**
 * Todo lo que queda detrás de sesión o es de un solo uso. No debe indexarse ni
 * aparecer en el sitemap, en ninguno de los dos idiomas.
 */
export const RUTAS_PRIVADAS = [
  "/dashboard",
  "/grupos",
  "/usuarios",
  "/roles",
  "/permisos",
  "/reset-password",
  "/forgot-password",
  "/unirse/",
  "/en/reset-password",
  "/en/forgot-password",
  "/en/join/",
];
