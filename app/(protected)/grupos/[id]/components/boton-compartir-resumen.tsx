"use client";

import { Check, Share2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type Transferencia = { deNombre: string; aNombre: string; monto: string };

export function BotonCompartirResumen({
  nombreGrupo,
  moneda,
  total,
  transferencias,
}: {
  nombreGrupo: string;
  moneda: string;
  total: string;
  transferencias: Transferencia[];
}) {
  const [copiado, setCopiado] = React.useState(false);
  const texto = [
    `Resumen de cuentas · ${nombreGrupo}`,
    `Total registrado: ${total} (${moneda})`,
    transferencias.length === 0
      ? "Las cuentas están saldadas."
      : "Para saldar:\n" + transferencias.map((t) => `• ${t.deNombre} le paga ${t.monto} a ${t.aNombre}`).join("\n"),
  ].join("\n\n");

  async function compartir() {
    try {
      if (navigator.share) await navigator.share({ title: `Cuentas de ${nombreGrupo}`, text: texto });
      else {
        await navigator.clipboard.writeText(texto);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
        toast.success("Resumen copiado para compartir.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("No se pudo compartir el resumen.");
    }
  }

  return <Button variant="outline" size="sm" onClick={compartir}><Share2 className="size-4" /> {copiado ? <><Check className="size-4" /> Copiado</> : "Compartir resumen"}</Button>;
}
