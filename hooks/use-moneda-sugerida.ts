"use client";

import * as React from "react";

import { MONEDA_POR_DEFECTO, monedaSugerida } from "@/lib/split/moneda";

/**
 * Moneda sugerida por el locale del navegador, sin romper la hidratación.
 *
 * `monedaSugerida()` NO se puede llamar durante el render del servidor: ahí
 * lee el locale del sistema operativo (que puede ser es-HN) mientras que el
 * navegador reporta otro (es-419), y React aborta la hidratación por el texto
 * distinto. `useSyncExternalStore` usa el snapshot del servidor también en el
 * render de hidratación y recién después toma el valor real del cliente.
 */
export function useMonedaSugerida(): string {
  return React.useSyncExternalStore(
    () => () => {},
    () => monedaSugerida(),
    () => MONEDA_POR_DEFECTO
  );
}
