import type { Metadata } from "next";

import { PantallaLogin, metadatosDeLogin } from "../../components/pantalla-login";

export const metadata: Metadata = metadatosDeLogin("en");

export default function LoginPage() {
  return <PantallaLogin />;
}
