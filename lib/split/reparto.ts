import type { EntradaReparto, LineaReparto, TipoReparto } from "./tipos";

export type ResultadoReparto =
  | { ok: true; lineas: LineaReparto[] }
  | { ok: false; error: string };

/**
 * Reparte un monto entre pesos usando el método del resto mayor
 * (Hamilton): a cada quien el piso de su proporción y luego se
 * entrega el residuo, de a una unidad, a quien tenga la fracción
 * más alta. Garantiza que la suma sea EXACTAMENTE el total.
 */
function repartirPorPesos(montoCentavos: number, pesos: number[]): number[] {
  const totalPesos = pesos.reduce((acc, p) => acc + p, 0);
  if (totalPesos <= 0) return pesos.map(() => 0);

  const exactos = pesos.map((p) => (montoCentavos * p) / totalPesos);
  const asignados = exactos.map(Math.floor);
  let residuo = montoCentavos - asignados.reduce((acc, n) => acc + n, 0);

  const porFraccion = exactos
    .map((valor, indice) => ({ indice, fraccion: valor - Math.floor(valor) }))
    // Fracción más alta primero; empate se resuelve por orden de captura
    // para que el resultado sea siempre reproducible.
    .sort((a, b) => b.fraccion - a.fraccion || a.indice - b.indice);

  let cursor = 0;
  while (residuo > 0 && porFraccion.length > 0) {
    asignados[porFraccion[cursor % porFraccion.length].indice] += 1;
    residuo -= 1;
    cursor += 1;
  }

  return asignados;
}

/**
 * Valida las líneas de "quién puso el dinero".
 * La suma tiene que dar exactamente el total del gasto: si no, los saldos
 * dejarían de cuadrar y la liquidación mentiría.
 */
/**
 * Por qué falló la validación de pagadores.
 *
 * Va junto al `error` en español para que quien muestre el mensaje pueda
 * traducirlo sin tener que comparar cadenas. El panel sigue usando `error`
 * tal cual; las pantallas públicas, que son bilingües, usan el código.
 */
export type MotivoPagadores = "SIN_PAGADORES" | "REPETIDO" | "MONTO_CERO" | "NO_CUADRA";

export function validarPagadores(
  montoCentavos: number,
  pagadores: Array<{ participanteId: string; montoCentavos: number }>
): { ok: true } | { ok: false; error: string; motivo: MotivoPagadores } {
  if (pagadores.length === 0) {
    return { ok: false, motivo: "SIN_PAGADORES", error: "Indica quién puso el dinero." };
  }

  const ids = new Set(pagadores.map((p) => p.participanteId));
  if (ids.size !== pagadores.length) {
    return {
      ok: false,
      motivo: "REPETIDO",
      error: "Hay una persona repetida entre quienes pagaron.",
    };
  }

  if (pagadores.some((p) => !Number.isInteger(p.montoCentavos) || p.montoCentavos <= 0)) {
    return {
      ok: false,
      motivo: "MONTO_CERO",
      error: "Cada quien debe poner un monto mayor a cero.",
    };
  }

  const suma = pagadores.reduce((total, p) => total + p.montoCentavos, 0);
  if (suma !== montoCentavos) {
    const diferencia = montoCentavos - suma;
    return {
      ok: false,
      motivo: "NO_CUADRA",
      error:
        diferencia > 0
          ? `Falta asignar ${diferencia} de lo que se pagó.`
          : `Lo aportado se pasa por ${Math.abs(diferencia)} del total.`,
    };
  }

  return { ok: true };
}

/** Divide un monto en n partes iguales, exactas al centavo. */
export function repartirIgual(montoCentavos: number, n: number): number[] {
  if (n <= 0) return [];
  return repartirPorPesos(montoCentavos, new Array(n).fill(1));
}

/**
 * Resuelve el reparto de un gasto a montos exactos.
 * La suma de las líneas siempre es igual a `montoCentavos`.
 */
export function repartirGasto(params: {
  montoCentavos: number;
  tipoReparto: TipoReparto;
  entradas: EntradaReparto[];
}): ResultadoReparto {
  const { montoCentavos, tipoReparto, entradas } = params;

  if (!Number.isInteger(montoCentavos) || montoCentavos <= 0) {
    return { ok: false, error: "El monto debe ser un número mayor a cero." };
  }
  if (entradas.length === 0) {
    return { ok: false, error: "Selecciona al menos un participante." };
  }

  const ids = new Set(entradas.map((e) => e.participanteId));
  if (ids.size !== entradas.length) {
    return { ok: false, error: "Hay participantes repetidos en el reparto." };
  }

  switch (tipoReparto) {
    case "IGUAL": {
      const montos = repartirIgual(montoCentavos, entradas.length);
      return {
        ok: true,
        lineas: entradas.map((entrada, i) => ({
          participanteId: entrada.participanteId,
          montoCentavos: montos[i],
          pesoEntrada: null,
        })),
      };
    }

    case "EXACTO": {
      const montos = entradas.map((e) => e.valor ?? 0);
      if (montos.some((m) => !Number.isInteger(m) || m < 0)) {
        return { ok: false, error: "Los montos exactos deben ser números válidos." };
      }

      const suma = montos.reduce((acc, m) => acc + m, 0);
      if (suma !== montoCentavos) {
        const diferencia = montoCentavos - suma;
        return {
          ok: false,
          error:
            diferencia > 0
              ? `Faltan ${diferencia} por asignar para llegar al total.`
              : `Te pasaste por ${Math.abs(diferencia)} del total.`,
        };
      }

      return {
        ok: true,
        lineas: entradas.map((entrada, i) => ({
          participanteId: entrada.participanteId,
          montoCentavos: montos[i],
          pesoEntrada: null,
        })),
      };
    }

    case "PORCENTAJE": {
      const bps = entradas.map((e) => e.valor ?? 0);
      if (bps.some((b) => !Number.isInteger(b) || b < 0)) {
        return { ok: false, error: "Los porcentajes deben ser números válidos." };
      }

      const suma = bps.reduce((acc, b) => acc + b, 0);
      if (suma !== 10_000) {
        return {
          ok: false,
          error: `Los porcentajes deben sumar 100% (llevas ${(suma / 100).toFixed(2)}%).`,
        };
      }

      const montos = repartirPorPesos(montoCentavos, bps);
      return {
        ok: true,
        lineas: entradas.map((entrada, i) => ({
          participanteId: entrada.participanteId,
          montoCentavos: montos[i],
          pesoEntrada: bps[i],
        })),
      };
    }

    case "PARTES": {
      const partes = entradas.map((e) => e.valor ?? 0);
      if (partes.some((p) => !Number.isInteger(p) || p < 0)) {
        return { ok: false, error: "Las partes deben ser números enteros." };
      }
      if (partes.reduce((acc, p) => acc + p, 0) <= 0) {
        return { ok: false, error: "Asigna al menos una parte a alguien." };
      }

      const montos = repartirPorPesos(montoCentavos, partes);
      return {
        ok: true,
        lineas: entradas.map((entrada, i) => ({
          participanteId: entrada.participanteId,
          montoCentavos: montos[i],
          pesoEntrada: partes[i],
        })),
      };
    }
  }
}
