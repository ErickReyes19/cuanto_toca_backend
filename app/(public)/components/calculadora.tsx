"use client";

import { Plus, Save, Trash2, Users, Wallet } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { ListaTransferencias, TablaSaldos } from "@/components/resultado-liquidacion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { simplificarDeudas } from "@/lib/split/liquidacion";
import { MONEDAS, aUnidadMenor, formatearMonto } from "@/lib/split/moneda";
import { repartirGasto } from "@/lib/split/reparto";
import { calcularSaldos, totalGastado } from "@/lib/split/saldos";
import { escribirLocal, useAlmacenamientoLocal } from "@/hooks/use-almacenamiento-local";
import { useMonedaSugerida } from "@/hooks/use-moneda-sugerida";
import type { GastoCalculo } from "@/lib/split/tipos";
import { enviarConEnter } from "@/lib/formulario";

export const CLAVE_BORRADOR = "cuanto-toca:grupo-local";

export type ParticipanteLocal = { id: string; nombre: string };

export type GastoLocal = {
  id: string;
  descripcion: string;
  montoCentavos: number;
  pagadoPorId: string;
  /** Entre quiénes se divide (partes iguales) */
  participanteIds: string[];
};

export type GrupoLocal = {
  nombre: string;
  moneda: string;
  participantes: ParticipanteLocal[];
  gastos: GastoLocal[];
};

const nuevoId = () =>
  globalThis.crypto?.randomUUID?.() ?? `tmp-${Math.random().toString(36).slice(2)}`;

/** Base UI muestra el valor crudo si no se le pasa el mapa de etiquetas. */
const ETIQUETAS_MONEDA = Object.fromEntries(
  MONEDAS.map((m) => [m.codigo, `${m.codigo} · ${m.nombre}`])
);

function grupoVacio(moneda: string): GrupoLocal {
  return { nombre: "", moneda, participantes: [], gastos: [] };
}

export function Calculadora() {
  // El borrador vive en localStorage, no en estado de React: así sobrevive
  // recargas y no hace falta ningún efecto de sincronización.
  const crudo = useAlmacenamientoLocal(CLAVE_BORRADOR);
  const monedaLocal = useMonedaSugerida();

  const grupo = React.useMemo<GrupoLocal>(() => {
    if (crudo) {
      try {
        const guardado = JSON.parse(crudo) as GrupoLocal;
        if (Array.isArray(guardado?.participantes) && Array.isArray(guardado?.gastos)) {
          return guardado;
        }
      } catch {
        // borrador corrupto: se empieza limpio
      }
    }
    return grupoVacio(monedaLocal);
  }, [crudo, monedaLocal]);

  const setGrupo = React.useCallback(
    (actualizar: (actual: GrupoLocal) => GrupoLocal) => {
      escribirLocal(CLAVE_BORRADOR, JSON.stringify(actualizar(grupo)));
    },
    [grupo]
  );

  const { participantes, gastos, moneda } = grupo;

  const gastosCalculo = React.useMemo<GastoCalculo[]>(() => {
    const idsValidos = new Set(participantes.map((p) => p.id));

    return gastos.flatMap((gasto) => {
      const entre = gasto.participanteIds.filter((id) => idsValidos.has(id));
      if (!idsValidos.has(gasto.pagadoPorId) || entre.length === 0) return [];

      const resultado = repartirGasto({
        montoCentavos: gasto.montoCentavos,
        tipoReparto: "IGUAL",
        entradas: entre.map((id) => ({ participanteId: id })),
      });
      if (!resultado.ok) return [];

      return [
        {
          id: gasto.id,
          montoCentavos: gasto.montoCentavos,
          pagadoPorId: gasto.pagadoPorId,
          reparto: resultado.lineas,
        },
      ];
    });
  }, [gastos, participantes]);

  const saldos = React.useMemo(
    () => calcularSaldos(participantes.map((p) => p.id), gastosCalculo),
    [participantes, gastosCalculo]
  );
  const transferencias = React.useMemo(() => simplificarDeudas(saldos), [saldos]);
  const total = totalGastado(gastosCalculo);

  function agregarParticipante(nombre: string) {
    const limpio = nombre.trim();
    if (!limpio) return;
    if (participantes.length >= 50) {
      toast.error("Máximo 50 integrantes en la calculadora.");
      return;
    }
    setGrupo((g) => ({
      ...g,
      participantes: [...g.participantes, { id: nuevoId(), nombre: limpio }],
    }));
  }

  function quitarParticipante(id: string) {
    setGrupo((g) => ({
      ...g,
      participantes: g.participantes.filter((p) => p.id !== id),
      // Se limpian las referencias para que ningún gasto quede huérfano.
      gastos: g.gastos
        .filter((gasto) => gasto.pagadoPorId !== id)
        .map((gasto) => ({
          ...gasto,
          participanteIds: gasto.participanteIds.filter((pid) => pid !== id),
        })),
    }));
  }

  function agregarGasto(gasto: GastoLocal) {
    setGrupo((g) => ({ ...g, gastos: [gasto, ...g.gastos] }));
  }

  function quitarGasto(id: string) {
    setGrupo((g) => ({ ...g, gastos: g.gastos.filter((gasto) => gasto.id !== id) }));
  }

  function limpiarTodo() {
    setGrupo(() => grupoVacio(moneda));
    toast.success("Se borró el cálculo.");
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" /> 1. El grupo
          </CardTitle>
          <CardDescription>
            Ponle nombre, elige la moneda y agrega a quienes salieron.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
            <Input
              placeholder="Ej. Playa con los muchachos"
              value={grupo.nombre}
              onChange={(e) => setGrupo((g) => ({ ...g, nombre: e.target.value }))}
              maxLength={120}
            />
            <Select
              value={moneda}
              items={ETIQUETAS_MONEDA}
              onValueChange={(valor) => setGrupo((g) => ({ ...g, moneda: valor ?? g.moneda }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Moneda" />
              </SelectTrigger>
              <SelectContent>
                {MONEDAS.map((m) => (
                  <SelectItem key={m.codigo} value={m.codigo}>
                    {m.codigo} · {m.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <FormularioParticipante onAgregar={agregarParticipante} />

          {participantes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {participantes.map((p) => (
                <Badge key={p.id} variant="secondary" className="gap-1.5 py-1.5 pr-1.5 pl-3">
                  {p.nombre}
                  <button
                    type="button"
                    onClick={() => quitarParticipante(p.id)}
                    aria-label={`Quitar a ${p.nombre}`}
                    className="rounded-full p-0.5 hover:bg-foreground/10"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Todavía no hay nadie. Agrega al menos dos personas.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="size-5" /> 2. Los gastos
          </CardTitle>
          <CardDescription>Quién puso qué. Cada gasto se divide entre quienes marques.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {participantes.length < 2 ? (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Agrega al menos dos integrantes para empezar a registrar gastos.
            </p>
          ) : (
            <FormularioGasto
              participantes={participantes}
              moneda={moneda}
              onAgregar={agregarGasto}
            />
          )}

          {gastos.length > 0 ? (
            <ul className="divide-y rounded-xl border">
              {gastos.map((gasto) => {
                const quienPago = participantes.find((p) => p.id === gasto.pagadoPorId);
                return (
                  <li key={gasto.id} className="flex items-center gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{gasto.descripcion}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        Pagó {quienPago?.nombre ?? "—"} · entre {gasto.participanteIds.length}{" "}
                        {gasto.participanteIds.length === 1 ? "persona" : "personas"}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold tabular-nums">
                      {formatearMonto(gasto.montoCentavos, moneda)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => quitarGasto(gasto.id)}
                      aria-label="Eliminar gasto"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle>3. Cuánto le toca a cada quien</CardTitle>
              <CardDescription>
                {gastosCalculo.length > 0
                  ? `Total del grupo: ${formatearMonto(total, moneda)}`
                  : "Registra gastos para ver el resultado."}
              </CardDescription>
            </div>
            {gastos.length > 0 || participantes.length > 0 ? (
              <Button variant="ghost" size="sm" onClick={limpiarTodo}>
                Empezar de nuevo
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {gastosCalculo.length === 0 ? (
            <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Aquí va a aparecer el saldo de cada persona y la lista de pagos mínimos para quedar
              a mano.
            </p>
          ) : (
            <>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Saldos</h3>
                <TablaSaldos participantes={participantes} saldos={saldos} moneda={moneda} />
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                  Quién le paga a quién ({transferencias.length}{" "}
                  {transferencias.length === 1 ? "transferencia" : "transferencias"})
                </h3>
                <ListaTransferencias
                  participantes={participantes}
                  transferencias={transferencias}
                  moneda={moneda}
                />
              </div>

              <div className="flex flex-col gap-2 rounded-xl border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">¿Guardar este grupo?</p>
                  <p className="text-sm text-muted-foreground">
                    Crea una cuenta gratis y no pierdes nada de lo que ya llevas.
                  </p>
                </div>
                <Button nativeButton={false} render={<Link href="/registro" />} className="shrink-0">
                  <Save className="size-4" /> Guardar e invitar
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FormularioParticipante({ onAgregar }: { onAgregar: (nombre: string) => void }) {
  const [nombre, setNombre] = React.useState("");

  function enviar(event: React.FormEvent) {
    event.preventDefault();
    onAgregar(nombre);
    setNombre("");
  }

  return (
    <form onSubmit={enviar} className="flex gap-2">
      <Input
        placeholder="Nombre del integrante"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        onKeyDown={enviarConEnter}
        maxLength={80}
      />
      <Button type="submit" variant="outline" disabled={!nombre.trim()}>
        <Plus className="size-4" /> Agregar
      </Button>
    </form>
  );
}

function FormularioGasto({
  participantes,
  moneda,
  onAgregar,
}: {
  participantes: ParticipanteLocal[];
  moneda: string;
  onAgregar: (gasto: GastoLocal) => void;
}) {
  const [descripcion, setDescripcion] = React.useState("");
  const [monto, setMonto] = React.useState("");
  const [pagadoPorId, setPagadoPorId] = React.useState(participantes[0]?.id ?? "");
  const [entre, setEntre] = React.useState<string[]>(() => participantes.map((p) => p.id));

  // Las selecciones se depuran durante el render en vez de con un efecto:
  // si alguien sale del grupo, deja de contar sin provocar otro render.
  const ids = participantes.map((p) => p.id);
  const entreValido = entre.filter((id) => ids.includes(id));
  const pagadoValido = ids.includes(pagadoPorId) ? pagadoPorId : (ids[0] ?? "");
  const etiquetasParticipantes = Object.fromEntries(participantes.map((p) => [p.id, p.nombre]));

  function alternar(id: string) {
    setEntre((actual) =>
      actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id]
    );
  }

  function enviar(event: React.FormEvent) {
    event.preventDefault();

    const montoCentavos = aUnidadMenor(monto, moneda);
    if (montoCentavos === null || montoCentavos <= 0) {
      toast.error("Escribe un monto válido mayor a cero.");
      return;
    }
    if (!descripcion.trim()) {
      toast.error("Describe el gasto (ej. 'Comida').");
      return;
    }
    if (!pagadoValido) {
      toast.error("Indica quién pagó.");
      return;
    }
    if (entreValido.length === 0) {
      toast.error("Marca entre quiénes se divide.");
      return;
    }

    onAgregar({
      id: nuevoId(),
      descripcion: descripcion.trim(),
      montoCentavos,
      pagadoPorId: pagadoValido,
      participanteIds: entreValido,
    });

    setDescripcion("");
    setMonto("");
  }

  return (
    <form onSubmit={enviar} className="space-y-3 rounded-xl border bg-muted/30 p-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_140px]">
        <Input
          placeholder="¿En qué se gastó? Ej. Refrescos"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          onKeyDown={enviarConEnter}
          maxLength={160}
        />
        <Input
          inputMode="decimal"
          placeholder="0.00"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          onKeyDown={enviarConEnter}
          className="text-right tabular-nums"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground">¿Quién pagó?</label>
        <Select
          value={pagadoValido}
          items={etiquetasParticipantes}
          onValueChange={(valor) => setPagadoPorId(valor ?? "")}
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
        <label className="text-xs font-semibold text-muted-foreground">
          Se divide entre ({entreValido.length})
        </label>
        <div className="flex flex-wrap gap-2">
          {participantes.map((p) => {
            const activo = entreValido.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => alternar(p.id)}
                aria-pressed={activo}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  activo
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {p.nombre}
              </button>
            );
          })}
        </div>
      </div>

      <Button type="submit" className="w-full">
        <Plus className="size-4" /> Agregar gasto
      </Button>
    </form>
  );
}
