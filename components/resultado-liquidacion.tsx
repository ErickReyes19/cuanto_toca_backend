import { ArrowRight, PartyPopper } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatearMonto } from "@/lib/split/moneda";
import type { Saldo, Transferencia } from "@/lib/split/tipos";

type Participante = { id: string; nombre: string };

function nombreDe(participantes: Participante[], id: string) {
  return participantes.find((p) => p.id === id)?.nombre ?? "—";
}

function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");
}

export function TablaSaldos({
  participantes,
  saldos,
  moneda,
}: {
  participantes: Participante[];
  saldos: Saldo[];
  moneda: string;
}) {
  return (
    <ul className="divide-y rounded-xl border">
      {saldos.map((saldo) => {
        const nombre = nombreDe(participantes, saldo.participanteId);
        const positivo = saldo.saldoCentavos > 0;
        const cero = saldo.saldoCentavos === 0;

        return (
          <li key={saldo.participanteId} className="flex items-center gap-3 p-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              {iniciales(nombre)}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{nombre}</p>
              <p className="text-xs text-muted-foreground">
                Puso {formatearMonto(saldo.pagadoCentavos, moneda)} · le tocaba{" "}
                {formatearMonto(saldo.debidoCentavos, moneda)}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p
                className={
                  cero
                    ? "font-semibold text-muted-foreground"
                    : positivo
                      ? "font-semibold text-emerald-600 dark:text-emerald-400"
                      : "font-semibold text-destructive"
                }
              >
                {cero
                  ? formatearMonto(0, moneda)
                  : `${positivo ? "+" : "−"}${formatearMonto(Math.abs(saldo.saldoCentavos), moneda)}`}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {cero ? "a mano" : positivo ? "le deben" : "debe"}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function ListaTransferencias({
  participantes,
  transferencias,
  moneda,
}: {
  participantes: Participante[];
  transferencias: Transferencia[];
  moneda: string;
}) {
  if (transferencias.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center">
        <PartyPopper className="size-8 text-emerald-600 dark:text-emerald-400" />
        <p className="font-medium">Todos a mano</p>
        <p className="text-sm text-muted-foreground">
          No hay nada que pagar: las cuentas del grupo están cuadradas.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {transferencias.map((tx, indice) => (
        <li
          key={`${tx.deParticipanteId}-${tx.aParticipanteId}-${indice}`}
          className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border p-3"
        >
          <span className="font-medium">{nombreDe(participantes, tx.deParticipanteId)}</span>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          <span className="font-medium">{nombreDe(participantes, tx.aParticipanteId)}</span>
          <Badge variant="secondary" className="ml-auto tabular-nums">
            {formatearMonto(tx.montoCentavos, moneda)}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
