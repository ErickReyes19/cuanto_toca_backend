import { headers } from "next/headers";

import { getAdsenseClient } from "@/lib/adsense";

/**
 * Carga el script de AdSense.
 *
 * Se renderiza como `<script async>` normal y no con `next/script`: React 19 lo
 * eleva solo al `<head>` y lo deduplica, y —lo importante— queda escrito en el
 * HTML que sirve el servidor. Con `next/script` la etiqueta la inyecta el
 * runtime después de hidratar, y la verificación de dominio de AdSense, que lee
 * el HTML tal cual, no la encontraba.
 *
 * El `nonce` es obligatorio: con `strict-dynamic` en el CSP, este script queda
 * marcado como confiable y todo lo que inyecte después hereda esa confianza.
 * Sin él, el navegador lo bloquea y no se ve ni un anuncio.
 *
 * Solo se monta en las páginas que muestran anuncios: no tiene sentido pagar la
 * descarga en el login ni dentro del panel.
 */
export async function ScriptAdsense() {
  const cliente = getAdsenseClient();
  if (!cliente) return null;

  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <script
      async
      nonce={nonce}
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cliente}`}
    />
  );
}
