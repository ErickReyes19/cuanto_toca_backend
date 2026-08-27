import type { Metadata } from "next";

import { PantallaInicio, metadatosDeInicio } from "../components/pantalla-inicio";

export const metadata: Metadata = metadatosDeInicio("en");

export default function HomePage() {
  return <PantallaInicio />;
}
