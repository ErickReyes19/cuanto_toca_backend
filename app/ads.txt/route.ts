import { getAdsensePublisherId } from "@/lib/adsense";

/**
 * `/ads.txt` es el archivo con el que AdSense comprueba que el inventario de
 * este dominio es legítimo. Sin él, los anuncios no se sirven.
 *
 * Va como route handler y no como archivo estático en `public/` para que el ID
 * de editor viaje en una variable de entorno y no quede escrito en el repo.
 */
export async function GET() {
  const publisherId = getAdsensePublisherId();

  if (!publisherId) {
    // Mejor 404 que un archivo con un ID inventado: AdSense lo tomaría como
    // inventario mal declarado.
    return new Response("Not Found", { status: 404 });
  }

  // f08c47fec0942fa0 es el identificador de certificación de Google, fijo.
  const contenido = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(contenido, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      // El rastreador lo relee seguido; un día de caché es suficiente.
      "cache-control": "public, max-age=86400",
    },
  });
}
