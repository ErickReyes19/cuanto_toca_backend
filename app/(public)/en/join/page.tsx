import type { Metadata } from "next";

import { alternatesDe, diccionario } from "@/lib/i18n";
import { FormularioUnirse } from "../../components/formulario-unirse";

export const metadata: Metadata = {
  title: diccionario("en").unirse.metaTitulo,
  description: diccionario("en").unirse.metaDescripcion,
  alternates: alternatesDe("unirse", "en"),
};

export default function JoinPage() {
  return <FormularioUnirse />;
}
