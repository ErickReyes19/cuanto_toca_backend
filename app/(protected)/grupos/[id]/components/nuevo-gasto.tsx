"use client";

import { Plus } from "lucide-react";
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
import { aUnidadMenor, formatearMonto, getMoneda } from "@/lib/split/moneda";
import { repartirGasto } from "@/lib/split/reparto";
import type { TipoReparto } from "@/lib/split/tipos";
import { crearGasto } from "../../actions";
import { enviarConEnter } from "@/lib/formulario";

type Participante = { id: string; nombre: string };
type Categoria = { id: string; slug: string; nombre: string };

const MODOS: Array<{ valor: TipoReparto; etiqueta: string; ayuda: string }> = [
  { valor: "IGUAL", etiqueta: "Partes iguales", ayuda: "Se divide en partes iguales entre los marcados." },
  { valor: "EXACTO", etiqueta: "Montos exactos", ayuda: "Escribe cuánto le toca a cada quien. Debe sumar el total." },
  { valor: "PORCENTAJE", etiqueta: "Porcentajes", ayuda: "Escribe el % de cada quien. Debe sumar 100%." },
  { valor: "PARTES", etiqueta: "Por partes", ayuda: "Ej. 2 partes para quien comió doble, 1 para el resto." },
];

export function NuevoGasto({
  grupoId,
  moneda,
  participantes,
  categorias,
}: {
  grupoId: string;
  moneda: string;
  participantes: Participante[];
  categorias: Categoria[];
}) {
  const router = useRouter();
  const [enviando, setEnviando] = React.useState(false);

  const [descripcion, setDescripcion] = React.useState("");
  const [monto, setMonto] = React.useState("");
  const [pagadoPorId, setPagadoPorId] = React.useState(participantes[0]?.id ?? "");
  const [categoriaId, setCategoriaId] = React.useState<string>("");
  const [tipoReparto, setTipoReparto] = React.useState<TipoReparto>("IGUAL");
  const [entre, setEntre] = React.useState<string[]>(participantes.map((p) => p.id));
  const [valores, setValores] = React.useState<Record<string, string>>({});

  const montoCentavos = aUnidadMenor(monto, moneda) ?? 0;
  const decimales = getMoneda(moneda).decimales;

  /** Convierte lo escrito por el usuario al entero que espera el motor. */
  function valorDe(participanteId: string): number | undefined {
    const crudo = valores[participanteId]?.trim();
    if (!crudo) return tipoReparto === "IGUAL" ? undefined : 0;

    if (tipoReparto === "EXACTO") return aUnidadMenor(crudo, moneda) ?? 0;
    if (tipoReparto === "PORCENTAJE") return Math.round(Number(crudo.replace(",", ".")) * 100) || 0;
    if (tipoReparto === "PARTES") return Math.trunc(Number(crudo)) || 0;
    return undefined;
  }

  const entradas = entre.map((id) => ({ participanteId: id, valor: valorDe(id) }));

  // Vista previa en vivo: el mismo cálculo que hará el servidor.
  const vistaPrevia =
    montoCentavos > 0 && entre.length > 0
      ? repartirGasto({ montoCentavos, tipoReparto, entradas })
      : null;

  function alternar(id: string) {
    setEntre((actual) =>
      actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id]
    );
  }

  async function enviar(event: React.FormEvent) {
    event.preventDefault();

    if (!descripcion.trim()) return toast.error("Describe el gasto.");
    if (montoCentavos <= 0) return toast.error("Escribe un monto válido.");
    if (!pagadoPorId) return toast.error("Indica quién pagó.");
    if (entre.length === 0) return toast.error("Marca entre quiénes se divide.");
    if (vistaPrevia && !vistaPrevia.ok) return toast.error(vistaPrevia.error);

    setEnviando(true);
    try {
      await crearGasto({
        grupoId,
        descripcion: descripcion.trim(),
        montoCentavos,
        pagadoPorId,
        tipoReparto,
        categoriaId: categoriaId || null,
        reparto: entradas,
      });

      setDescripcion("");
      setMonto("");
      setValores({});
      toast.success("Gasto agregado.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo agregar el gasto.");
    } finally {
      setEnviando(false);
    }
  }

  const modoActual = MODOS.find((m) => m.valor === tipoReparto)!;
  // Base UI muestra el valor crudo (el id) si no recibe el mapa de etiquetas.
  const etiquetasParticipantes = Object.fromEntries(participantes.map((p) => [p.id, p.nombre]));
  const etiquetasCategorias = Object.fromEntries(categorias.map((c) => [c.id, c.nombre]));

  return (
    <form onSubmit={enviar} className="space-y-4 rounded-xl border bg-muted/30 p-4">
      <div className="grid gap-2 sm:grid-cols-[1fr_150px]">
        <Input
          placeholder="¿En qué se gastó?"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          onKeyDown={enviarConEnter}
          maxLength={160}
        />
        <Input
          inputMode="decimal"
          placeholder={decimales === 0 ? "0" : "0.00"}
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          onKeyDown={enviarConEnter}
          className="text-right tabular-nums"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>¿Quién pagó?</Label>
          <Select
            value={pagadoPorId}
            items={etiquetasParticipantes}
            onValueChange={(v) => setPagadoPorId(v ?? "")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona" />
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
          <Label>Categoría</Label>
          <Select
            value={categoriaId}
            items={etiquetasCategorias}
            onValueChange={(v) => setCategoriaId(v ?? "")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sin categoría" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Cómo se divide</Label>
        <div className="flex flex-wrap gap-1.5">
          {MODOS.map((modo) => (
            <button
              key={modo.valor}
              type="button"
              onClick={() => setTipoReparto(modo.valor)}
              aria-pressed={tipoReparto === modo.valor}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                tipoReparto === modo.valor
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {modo.etiqueta}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{modoActual.ayuda}</p>
      </div>

      <div className="space-y-2">
        <Label>Entre quiénes ({entre.length})</Label>
        <ul className="divide-y rounded-lg border bg-background">
          {participantes.map((p) => {
            const activo = entre.includes(p.id);
            const linea = vistaPrevia?.ok
              ? vistaPrevia.lineas.find((l) => l.participanteId === p.id)
              : undefined;

            return (
              <li key={p.id} className="flex items-center gap-3 p-2.5">
                <button
                  type="button"
                  onClick={() => alternar(p.id)}
                  aria-pressed={activo}
                  className={`size-5 shrink-0 rounded border transition ${
                    activo ? "border-primary bg-primary" : "border-input bg-background"
                  }`}
                  aria-label={`${activo ? "Quitar" : "Incluir"} a ${p.nombre}`}
                />
                <span className={`flex-1 truncate text-sm ${activo ? "" : "text-muted-foreground"}`}>
                  {p.nombre}
                </span>

                {activo && tipoReparto !== "IGUAL" ? (
                  <Input
                    inputMode="decimal"
                    value={valores[p.id] ?? ""}
                    onChange={(e) =>
                      setValores((actual) => ({ ...actual, [p.id]: e.target.value }))
                    }
                    placeholder={tipoReparto === "PORCENTAJE" ? "%" : tipoReparto === "PARTES" ? "1" : "0"}
                    className="h-8 w-24 text-right tabular-nums"
                  />
                ) : null}

                {activo && linea ? (
                  <span className="w-24 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
                    {formatearMonto(linea.montoCentavos, moneda)}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>

        {vistaPrevia && !vistaPrevia.ok ? (
          <p className="text-xs font-medium text-destructive">{vistaPrevia.error}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={enviando}>
        <Plus className="size-4" /> {enviando ? "Guardando..." : "Agregar gasto"}
      </Button>
    </form>
  );
}
