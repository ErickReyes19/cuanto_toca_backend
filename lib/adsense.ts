/**
 * Configuración de Google AdSense.
 *
 * Todo sale de variables de entorno: mientras no estén, ni el script ni los
 * bloques se renderizan, así que la página no muestra huecos en blanco
 * mientras esperas la aprobación de Google.
 */

/** `ca-pub-XXXXXXXXXXXXXXXX`, el ID de editor que da AdSense. */
export function getAdsenseClient() {
  return process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT?.trim() || null;
}

/** Sin el prefijo `ca-`: es la forma que pide `ads.txt`. */
export function getAdsensePublisherId() {
  return getAdsenseClient()?.replace(/^ca-/, "") || null;
}

export function adsenseEstaConfigurado() {
  return getAdsenseClient() !== null;
}

/**
 * IDs de cada bloque, tal como los crea AdSense en "Anuncios > Por unidad".
 * Un bloque sin slot no se renderiza, así puedes activarlos de a uno.
 */
export const SLOTS = {
  /** Dentro del contenido, debajo de la calculadora. */
  landing: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_LANDING?.trim() || null,
  /** Banner ancho al cerrar la portada. */
  banner: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_BANNER?.trim() || null,
} as const;
