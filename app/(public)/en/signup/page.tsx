import type { Metadata } from "next";

import { PantallaRegistro, metadatosDeRegistro } from "../../components/pantalla-registro";

export const metadata: Metadata = metadatosDeRegistro("en");

export default function SignupPage() {
  return <PantallaRegistro />;
}
