import type { Metadata } from "next";

import { PantallaInicio, metadatosDeInicio } from "./components/pantalla-inicio";

export const metadata: Metadata = metadatosDeInicio("es");

export default function InicioPage() {
  return <PantallaInicio />;
}
