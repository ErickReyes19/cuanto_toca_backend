"use client";

import * as React from "react";

import { getAdsenseClient } from "@/lib/adsense";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Un bloque de anuncio de AdSense.
 *
 * Solo pinta el `<ins>`: la carga del script vive en `ScriptAdsense`, que es un
 * componente de servidor porque necesita el nonce del CSP. Separarlos evita
 * además que se duplique el `<script>` cuando hay más de un bloque en la página.
 *
 * Si falta el ID de editor o el slot, no renderiza nada.
 */
export function Anuncio({
  slot,
  formato = "auto",
  className,
  etiqueta = true,
}: {
  slot: string | null;
  formato?: "auto" | "horizontal" | "rectangle" | "fluid";
  className?: string;
  /** Distinguir el anuncio del contenido propio es exigencia de AdSense. */
  etiqueta?: boolean;
}) {
  const cliente = getAdsenseClient();
  const yaSolicitado = React.useRef(false);

  React.useEffect(() => {
    if (!cliente || !slot) return;

    // En modo estricto los efectos corren dos veces; un segundo push sobre el
    // mismo <ins> hace que AdSense tire "already have ads in them".
    if (yaSolicitado.current) return;
    yaSolicitado.current = true;

    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // Un bloqueador de anuncios puede impedirlo; la app sigue funcionando.
    }
  }, [cliente, slot]);

  if (!cliente || !slot) return null;

  return (
    <div className={className} aria-label="Publicidad">
      {etiqueta ? (
        <p className="mb-1 text-center text-[10px] tracking-wide text-muted-foreground uppercase">
          Publicidad
        </p>
      ) : null}
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={cliente}
        data-ad-slot={slot}
        data-ad-format={formato}
        data-full-width-responsive="true"
      />
    </div>
  );
}
