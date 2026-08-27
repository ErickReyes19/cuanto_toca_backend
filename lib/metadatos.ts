import type { Metadata } from "next";

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  TU APARTADO PARA METADATOS
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Este archivo existe para que agregues verificaciones y meta tags sin tener
 * que tocar `app/layout.tsx`. Todo lo que pongas aquí se aplica a TODAS las
 * páginas del sitio.
 *
 * Para metadatos de UNA sola página (título, descripción, canonical), eso va en
 * el `export const metadata` de esa página, no aquí.
 */

/**
 * Verificaciones de propiedad del sitio, método "meta tag".
 *
 * OJO: Search Console tiene dos métodos y no se mezclan.
 *   - Archivo HTML  -> ya está en `public/googlee05bba71a76e1331.html`.
 *                      Con ese basta, no necesitas nada aquí.
 *   - Meta tag      -> si algún día usas ese método, Google te da un código
 *                      como "abc123..." y lo pegas en `google` de abajo.
 *
 * Puedes tener los dos activos sin problema.
 */
export const VERIFICACIONES: Metadata["verification"] = {
  // google: "pega-aqui-el-codigo-del-meta-tag",
  // yandex: "...",
  // yahoo: "...",
  other: {
    // Otras plataformas que piden su propio meta tag de verificación:
    // "facebook-domain-verification": "...",
    // "p:domain_verify": "...",            // Pinterest
    // "msvalidate.01": "...",              // Bing Webmaster Tools
  },
};

/**
 * Meta tags sueltos que no encajan en ninguna categoría de Next.
 * Se vuelcan tal cual como <meta name="clave" content="valor" />.
 */
export const METADATOS_EXTRA: Record<string, string> = {
  // Evita que el navegador ofrezca traducir una app que ya está en español.
  google: "notranslate",

  // Ejemplos de lo que podrías agregar:
  // "apple-mobile-web-app-title": "Cuánto Toca",
  // "author": "Tu nombre",
};

/**
 * Redes sociales del proyecto. Se usan en el JSON-LD para que Google las
 * asocie a la marca. Deja el arreglo vacío si todavía no tienes.
 */
export const REDES_SOCIALES: string[] = [
  // "https://x.com/cuantotoca",
  // "https://www.instagram.com/cuantotoca",
];
