"use client";

import Script from "next/script";
import * as React from "react";

/**
 * Espacio publicitario de AdSense, inactivo hasta configurar ambos valores
 * públicos. Debe montarse solo tras el consentimiento para publicidad.
 */
export function GoogleAd({ slot, className }: { slot: string | undefined; className?: string }) {
  const client = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;
  const [listo, setListo] = React.useState(false);

  React.useEffect(() => {
    if (!client || !slot || !listo) return;
    try {
      ((window.adsbygoogle = window.adsbygoogle || [])).push({});
    } catch {
      // AdSense puede bloquearse por extensiones; la app sigue funcionando.
    }
  }, [client, slot, listo]);

  if (!client || !slot) return null;
  return (
    <div className={className} aria-label="Publicidad">
      <Script
        id="google-adsense"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
        onLoad={() => setListo(true)}
      />
      <ins className="adsbygoogle block" data-ad-client={client} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
    </div>
  );
}

declare global {
  interface Window { adsbygoogle: unknown[]; }
}
