import React from "react";

import { ProveedorIdioma } from "@/lib/i18n/cliente";
import { getIdioma } from "@/lib/i18n/servidor";
import "../globals-landing.css";

/**
 * Marco de las pantallas públicas. Además de fijar la paleta clara, es donde
 * entra el idioma al árbol de cliente: la calculadora y los formularios lo
 * leen del contexto en vez de recibirlo por props.
 */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const idioma = await getIdioma();

  return (
    <ProveedorIdioma idioma={idioma}>
      <div className="public-light min-h-screen bg-white text-foreground">{children}</div>
    </ProveedorIdioma>
  );
}
