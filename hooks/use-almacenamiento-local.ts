"use client";

import * as React from "react";

/**
 * `localStorage` expuesto como store externo para `useSyncExternalStore`.
 *
 * Leerlo así (en vez de con un efecto que hace setState) evita renders en
 * cascada, no rompe la hidratación —en el servidor el snapshot es `null`—
 * y mantiene sincronizadas todas las pestañas abiertas.
 */

const oyentes = new Set<() => void>();

function emitir() {
  for (const oyente of oyentes) oyente();
}

function suscribir(alCambiar: () => void) {
  // El evento `storage` solo avisa a las OTRAS pestañas, así que además
  // llevamos nuestra propia lista para la pestaña actual.
  oyentes.add(alCambiar);
  window.addEventListener("storage", alCambiar);

  return () => {
    oyentes.delete(alCambiar);
    window.removeEventListener("storage", alCambiar);
  };
}

export function leerLocal(clave: string): string | null {
  try {
    return window.localStorage.getItem(clave);
  } catch {
    // Modo privado o cookies bloqueadas.
    return null;
  }
}

export function escribirLocal(clave: string, valor: string | null) {
  try {
    if (valor === null) window.localStorage.removeItem(clave);
    else window.localStorage.setItem(clave, valor);
  } catch {
    // Sin almacenamiento la app sigue viva, solo no persiste.
  }
  emitir();
}

/**
 * Devuelve el valor crudo (string) de una clave. Se entrega sin parsear
 * a propósito: un string es estable entre renders, mientras que devolver
 * un objeto nuevo haría que `useSyncExternalStore` entre en bucle.
 */
export function useAlmacenamientoLocal(clave: string): string | null {
  return React.useSyncExternalStore(
    suscribir,
    () => leerLocal(clave),
    () => null
  );
}
