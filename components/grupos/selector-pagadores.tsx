"use client";

import { Users } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { aUnidadMenor, formatearMonto, getMoneda } from "@/lib/split/moneda";

export type Pagador = { participanteId: string; montoCentavos: number };
type Participante = { id: string; nombre: string };

/**
 * "¿Quién puso el dinero?" con soporte para varios.
 *
 * El caso común (una sola persona paga todo) se mantiene en un toque: si hay
 * un único seleccionado no se pide monto, se le asigna el total. Los campos
 * por persona solo aparecen cuando de verdad pagaron entre varios.
 */
export function SelectorPagadores({
  participantes,
  moneda,
  totalCentavos,
  pagadores,
  onChange,
}: {
  participantes: Participante[];
  moneda: string;
  totalCentavos: number;
  pagadores: Pagador[];
  onChange: (pagadores: Pagador[]) => void;
}) {
  const decimales = getMoneda(moneda).decimales;
  const varios = pagadores.length > 1;
  const asignado = pagadores.reduce((suma, p) => suma + p.montoCentavos, 0);
  const diferencia = totalCentavos - asignado;

  /**
   * El texto tal cual lo escribe la persona.
   *
   * No se puede usar el monto formateado como `value` del input: reformatear en
   * cada tecla hace que el siguiente dígito se pegue a un texto ya formateado
   * ("2" -> "2.00" -> "2.000") y el parser lo relee como separador de miles.
   * Tecleando "20" terminabas con 2000.
   */
  const [textos, setTextos] = React.useState<Record<string, string>>({});

  /**
   * Qué se muestra en el campo.
   *
   * Se resuelve durante el render, sin efectos: si lo escrito sigue valiendo
   * el mismo monto, se respeta tal cual (así "12." no se convierte en "12.00"
   * mientras se teclea); si el monto cambió desde fuera —el botón de repartir,
   * otro total— se muestra el valor nuevo ya formateado.
   */
  function textoDe(pagador: Pagador) {
    const escrito = textos[pagador.participanteId];

    if (escrito !== undefined && (aUnidadMenor(escrito, moneda) ?? 0) === pagador.montoCentavos) {
      return escrito;
    }

    return pagador.montoCentavos
      ? (pagador.montoCentavos / 10 ** decimales).toFixed(decimales)
      : "";
  }

  function alternar(id: string) {
    const yaEsta = pagadores.some((p) => p.participanteId === id);

    if (yaEsta) {
      // Nunca dejamos la lista vacía: alguien tuvo que poner el dinero.
      if (pagadores.length === 1) return;
      onChange(pagadores.filter((p) => p.participanteId !== id));
      return;
    }

    onChange([...pagadores, { participanteId: id, montoCentavos: 0 }]);
  }

  function escribirMonto(id: string, crudo: string) {
    setTextos((actual) => ({ ...actual, [id]: crudo }));
    onChange(
      pagadores.map((p) =>
        p.participanteId === id ? { ...p, montoCentavos: aUnidadMenor(crudo, moneda) ?? 0 } : p
      )
    );
  }

  /** Reparte el total en partes iguales entre quienes ya están marcados. */
  function repartirEntreLosMarcados() {
    if (pagadores.length === 0 || totalCentavos <= 0) return;

    const base = Math.floor(totalCentavos / pagadores.length);
    const sobra = totalCentavos - base * pagadores.length;

    onChange(pagadores.map((p, i) => ({ ...p, montoCentavos: base + (i < sobra ? 1 : 0) })));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium">¿Quién puso el dinero?</span>
        {varios ? (
          <button
            type="button"
            onClick={repartirEntreLosMarcados}
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Repartir en partes iguales
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {participantes.map((p) => {
          const activo = pagadores.some((x) => x.participanteId === p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => alternar(p.id)}
              aria-pressed={activo}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                activo
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {p.nombre}
            </button>
          );
        })}
      </div>

      {varios ? (
        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          {pagadores.map((pagador) => {
            const persona = participantes.find((p) => p.id === pagador.participanteId);
            return (
              <div key={pagador.participanteId} className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm">{persona?.nombre ?? "—"}</span>
                <Input
                  aria-label={`Cuánto puso ${persona?.nombre ?? ""}`}
                  inputMode="decimal"
                  placeholder={decimales ? "0.00" : "0"}
                  value={textoDe(pagador)}
                  onChange={(e) => escribirMonto(pagador.participanteId, e.target.value)}
                  className="w-28 text-right tabular-nums"
                />
              </div>
            );
          })}

          <p className={`text-xs ${diferencia === 0 ? "text-muted-foreground" : "text-destructive"}`}>
            {diferencia === 0
              ? `Cuadra con el total: ${formatearMonto(totalCentavos, moneda)}`
              : diferencia > 0
                ? `Faltan ${formatearMonto(diferencia, moneda)} por asignar.`
                : `Se pasan por ${formatearMonto(Math.abs(diferencia), moneda)}.`}
          </p>
        </div>
      ) : (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="size-3.5" />
          Marca a más de una persona si pagaron entre varios.
        </p>
      )}
    </div>
  );
}

/**
 * Resuelve la lista final antes de enviar.
 * Con un solo pagador el monto es el total, sin que nadie tenga que escribirlo.
 */
export function resolverPagadores(pagadores: Pagador[], totalCentavos: number): Pagador[] {
  if (pagadores.length === 1) {
    return [{ participanteId: pagadores[0].participanteId, montoCentavos: totalCentavos }];
  }
  return pagadores;
}
