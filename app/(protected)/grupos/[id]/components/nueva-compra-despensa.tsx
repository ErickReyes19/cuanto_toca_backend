"use client";

import { Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { aUnidadMenor, formatearMonto, getMoneda } from "@/lib/split/moneda";
import {
  SelectorPagadores,
  resolverPagadores,
  type Pagador,
} from "@/components/grupos/selector-pagadores";
import { validarPagadores } from "@/lib/split/reparto";
import { crearCompraDespensa } from "../../actions";

type Participante = { id: string; nombre: string };
type Linea = { id: string; descripcion: string; monto: string; participanteIds: string[] };
const nuevaLinea = (participanteIds: string[]): Linea => ({ id: crypto.randomUUID(), descripcion: "", monto: "", participanteIds });

/** Formulario de ticket: cada producto se asigna a una o varias personas. */
export function NuevaCompraDespensa({ grupoId, moneda, participantes }: { grupoId: string; moneda: string; participantes: Participante[] }) {
  const [descripcion, setDescripcion] = React.useState("Compra de supermercado");
  const [pagadores, setPagadores] = React.useState<Pagador[]>(
    participantes[0] ? [{ participanteId: participantes[0].id, montoCentavos: 0 }] : []
  );
  const [lineas, setLineas] = React.useState<Linea[]>(() => [nuevaLinea(participantes.map((p) => p.id))]);
  const [enviando, setEnviando] = React.useState(false);
  const etiquetas = Object.fromEntries(participantes.map((p) => [p.id, p.nombre]));
  const decimales = getMoneda(moneda).decimales;
  const total = lineas.reduce((suma, linea) => suma + (aUnidadMenor(linea.monto, moneda) ?? 0), 0);

  function actualizar(id: string, cambio: Partial<Linea>) { setLineas((actual) => actual.map((l) => l.id === id ? { ...l, ...cambio } : l)); }
  function alternar(linea: Linea, participanteId: string) {
    actualizar(linea.id, { participanteIds: linea.participanteIds.includes(participanteId)
      ? linea.participanteIds.filter((id) => id !== participanteId)
      : [...linea.participanteIds, participanteId] });
  }
  async function enviar(event: React.FormEvent) {
    event.preventDefault();
    const payload = lineas.map(({ descripcion: nombre, monto, participanteIds }) => ({
      descripcion: nombre.trim(), montoCentavos: aUnidadMenor(monto, moneda) ?? 0, participanteIds,
    }));
    if (!descripcion.trim()) return toast.error("Describe la compra.");
    if (payload.some((l) => !l.descripcion || l.montoCentavos <= 0 || l.participanteIds.length === 0)) {
      return toast.error("Completa cada producto con su monto y a quién corresponde.");
    }
    if (pagadores.length === 0) return toast.error("Marca quién puso el dinero.");
    const revision = validarPagadores(total, resolverPagadores(pagadores, total));
    if (!revision.ok) return toast.error(revision.error);
    setEnviando(true);
    try {
      await crearCompraDespensa({
        grupoId,
        descripcion: descripcion.trim(),
        pagadores: resolverPagadores(pagadores, total),
        lineas: payload,
      });
      setDescripcion("Compra de supermercado"); setLineas([nuevaLinea(participantes.map((p) => p.id))]);
      toast.success("Ticket guardado y repartido automáticamente.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo guardar el ticket."); }
    finally { setEnviando(false); }
  }

  return <form onSubmit={enviar} className="space-y-4 rounded-xl border bg-muted/30 p-4">
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1.5"><Label htmlFor="compra-descripcion">Compra</Label><Input id="compra-descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={160} /></div>
      <SelectorPagadores participantes={participantes} moneda={moneda} totalCentavos={total} pagadores={pagadores} onChange={setPagadores} />
    </div>
    <div className="space-y-2"><div className="flex items-center justify-between"><Label>Productos</Label><span className="text-sm font-semibold tabular-nums">Total: {formatearMonto(total, moneda)}</span></div>
      {lineas.map((linea, indice) => <div key={linea.id} className="rounded-lg border bg-background p-3 space-y-2">
        <div className="flex gap-2"><Input aria-label={`Producto ${indice + 1}`} placeholder="Ej. Leche" value={linea.descripcion} onChange={(e) => actualizar(linea.id, { descripcion: e.target.value })} maxLength={160} /><Input aria-label={`Monto de ${linea.descripcion || `producto ${indice + 1}`}`} inputMode="decimal" placeholder={decimales ? "0.00" : "0"} value={linea.monto} onChange={(e) => actualizar(linea.id, { monto: e.target.value })} className="w-28 text-right tabular-nums" />{lineas.length > 1 && <Button type="button" variant="ghost" size="icon" aria-label="Quitar producto" onClick={() => setLineas((a) => a.filter((l) => l.id !== linea.id))}><Trash2 className="size-4" /></Button>}</div>
        <div className="flex flex-wrap gap-1.5">{participantes.map((p) => { const activo = linea.participanteIds.includes(p.id); return <button key={p.id} type="button" onClick={() => alternar(linea, p.id)} aria-pressed={activo} className={`rounded-full border px-2.5 py-1 text-xs ${activo ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{p.nombre}</button>; })}</div>
      </div>)}
      <Button type="button" variant="outline" className="w-full" onClick={() => setLineas((a) => [...a, nuevaLinea(participantes.map((p) => p.id))])}><Plus className="size-4" /> Agregar producto</Button>
    </div>
    <p className="text-xs text-muted-foreground">Cada producto se divide en partes iguales solo entre las personas seleccionadas. Guardaremos un único gasto total para calcular las deudas.</p>
    <Button type="submit" className="w-full" disabled={enviando}><Plus className="size-4" /> {enviando ? "Guardando..." : "Guardar ticket"}</Button>
  </form>;
}
