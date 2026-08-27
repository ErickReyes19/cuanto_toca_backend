import type { Metadata } from "next";

import { FormularioUnirse } from "../components/formulario-unirse";
import { alternatesDe, diccionario } from "@/lib/i18n";

export const metadata: Metadata = {
  title: diccionario("es").unirse.metaTitulo,
  description: diccionario("es").unirse.metaDescripcion,
  alternates: alternatesDe("unirse", "es"),
};

export default function UnirseConCodigoPage() {
  return <FormularioUnirse />;
}
