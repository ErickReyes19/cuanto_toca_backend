import type { Metadata } from "next";

import { PantallaRegistro, metadatosDeRegistro } from "../components/pantalla-registro";

export const metadata: Metadata = metadatosDeRegistro("es");

export default function RegistroPage() {
  return <PantallaRegistro />;
}
