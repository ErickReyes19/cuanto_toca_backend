"use client";

import { Check, Copy, HandCoins, RefreshCw, Trash2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { enviarConEnter } from "@/lib/formulario";
import { aUnidadMenor, formatearMonto, formatearNumero } from "@/lib/split/moneda";
import type { Transferencia } from "@/lib/split/tipos";
import {
  agregarParticipante,
  eliminarGasto,
  regenerarCodigoInvitacion,
  registrarPago,
} from "../../actions";

type Participante = { id: string; nombre: string };

// ------------------------------------------------------------------

export function PanelInvitacion({
  grupoId,
  codigo,
  esPropietario,
}: {
  grupoId: string;
  codigo: string;
  esPropietario: boolean;
}) {
  const router = useRouter();
  const [codigoActual, setCodigoActual] = React.useState(codigo);
  const [copiado, setCopiado] = React.useState(false);

  // El origin solo existe en el navegador. Leerlo como store externo hace
  // que el render del servidor y la hidratación coincidan sin efectos.
  const origen = React.useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );
  const enlace = origen ? `${origen}/unirse/${codigoActual}` : "";

  async function copiar() {
    try {
      await navigator.clipboard.writeText(enlace);
      setCopiado(true);
      toast.success("Enlace copiado.");
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error("No se pudo copiar. Selecciona el enlace manualmente.");
    }
  }

  async function regenerar() {
    try {
      const { codigoInvitacion } = await regenerarCodigoInvitacion(grupoId);
      setCodigoActual(codigoInvitacion);
      toast.success("Se generó un enlace nuevo. El anterior dejó de servir.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo regenerar el enlace.");
    }
  }

  return (
    <div className="space-y-2 rounded-xl border p-4">
      <p className="text-sm font-medium">Invitar al grupo</p>
      <p className="text-xs text-muted-foreground">
        Comparte el enlace o dicta el código: <span className="font-mono font-semibold">{codigoActual}</span>
      </p>

      <div className="flex gap-2">
        <Input readOnly value={enlace} className="font-mono text-xs" onFocus={(e) => e.target.select()} />
        <Button variant="outline" size="icon" onClick={copiar} aria-label="Copiar enlace">
          {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
        {esPropietario ? (
          <Button variant="ghost" size="icon" onClick={regenerar} aria-label="Generar enlace nuevo">
            <RefreshCw className="size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------

export function AgregarIntegrante({ grupoId }: { grupoId: string }) {
  const router = useRouter();
  const [nombre, setNombre] = React.useState("");
  const [enviando, setEnviando] = React.useState(false);

  async function enviar(event: React.FormEvent) {
    event.preventDefault();
    if (!nombre.trim()) return;

    setEnviando(true);
    try {
      await agregarParticipante(grupoId, nombre);
      setNombre("");
      toast.success("Integrante agregado.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo agregar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="flex gap-2">
      <Input
        placeholder="Agregar integrante por nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        onKeyDown={enviarConEnter}
        maxLength={80}
      />
      <Button type="submit" variant="outline" disabled={enviando || !nombre.trim()}>
        <UserPlus className="size-4" />
      </Button>
    </form>
  );
}

// ------------------------------------------------------------------

export function BotonEliminarGasto({ gastoId }: { gastoId: string }) {
  const router = useRouter();
  const [enviando, setEnviando] = React.useState(false);

  async function eliminar() {
    setEnviando(true);
    try {
      await eliminarGasto(gastoId);
      toast.success("Gasto eliminado.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={eliminar}
      disabled={enviando}
      aria-label="Eliminar gasto"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}

// ------------------------------------------------------------------

/**
 * Registra que una de las transferencias sugeridas ya se pagó.
 * Al hacerlo, los saldos del grupo se recalculan solos.
 */
export function RegistrarPago({
  grupoId,
  moneda,
  participantes,
  sugerencias,
}: {
  grupoId: string;
  moneda: string;
  participantes: Participante[];
  sugerencias: Transferencia[];
}) {
  const router = useRouter();
  const [abierto, setAbierto] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);
  const [de, setDe] = React.useState(sugerencias[0]?.deParticipanteId ?? participantes[0]?.id ?? "");
  const [a, setA] = React.useState(sugerencias[0]?.aParticipanteId ?? participantes[1]?.id ?? "");
  const [monto, setMonto] = React.useState(
    sugerencias[0] ? formatearNumero(sugerencias[0].montoCentavos, moneda) : ""
  );

  function usarSugerencia(tx: Transferencia) {
    setDe(tx.deParticipanteId);
    setA(tx.aParticipanteId);
    setMonto(formatearNumero(tx.montoCentavos, moneda));
    setAbierto(true);
  }

  async function enviar(event: React.FormEvent) {
    event.preventDefault();

    const montoCentavos = aUnidadMenor(monto, moneda);
    if (!montoCentavos || montoCentavos <= 0) return toast.error("Escribe un monto válido.");
    if (de === a) return toast.error("Quien paga y quien cobra deben ser distintos.");

    setEnviando(true);
    try {
      await registrarPago({ grupoId, deParticipanteId: de, aParticipanteId: a, montoCentavos });
      setMonto("");
      setAbierto(false);
      toast.success("Pago registrado.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar el pago.");
    } finally {
      setEnviando(false);
    }
  }

  const etiquetasParticipantes = Object.fromEntries(participantes.map((p) => [p.id, p.nombre]));

  if (participantes.length < 2) return null;

  return (
    <div className="space-y-3">
      {sugerencias.length > 0 && !abierto ? (
        <div className="flex flex-wrap gap-2">
          {sugerencias.map((tx, indice) => (
            <Button
              key={`${tx.deParticipanteId}-${tx.aParticipanteId}-${indice}`}
              variant="outline"
              size="sm"
              onClick={() => usarSugerencia(tx)}
            >
              <Check className="size-4" /> Marcar como pagado:{" "}
              {formatearMonto(tx.montoCentavos, moneda)}
            </Button>
          ))}
        </div>
      ) : null}

      {abierto ? (
        <form onSubmit={enviar} className="space-y-3 rounded-xl border bg-muted/30 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Paga</Label>
              <Select value={de} items={etiquetasParticipantes} onValueChange={(v) => setDe(v ?? "")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {participantes.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Recibe</Label>
              <Select value={a} items={etiquetasParticipantes} onValueChange={(v) => setA(v ?? "")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {participantes.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Monto</Label>
              <Input
                inputMode="decimal"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="text-right tabular-nums"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={enviando}>
              {enviando ? "Guardando..." : "Registrar pago"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setAbierto(true)}>
          <HandCoins className="size-4" /> Registrar otro pago
        </Button>
      )}
    </div>
  );
}
