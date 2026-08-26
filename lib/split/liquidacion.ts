import type { Saldo, Transferencia } from "./tipos";

/**
 * Convierte los saldos en el menor número práctico de transferencias.
 *
 * Estrategia voraz: en cada paso se empareja a quien más debe con
 * quien más le deben y se salda el mínimo de ambos. Cada iteración
 * deja al menos a una persona en cero, así que el resultado nunca
 * supera n-1 transferencias.
 *
 * El óptimo exacto es NP-hard (se reduce a Sum of Subsets), por eso
 * los productos del rubro usan esta misma heurística: en grupos
 * reales da el óptimo o queda a una transferencia de él.
 */
export function simplificarDeudas(saldos: Saldo[]): Transferencia[] {
  const deudores = saldos
    .filter((s) => s.saldoCentavos < 0)
    .map((s) => ({ id: s.participanteId, monto: -s.saldoCentavos }));

  const acreedores = saldos
    .filter((s) => s.saldoCentavos > 0)
    .map((s) => ({ id: s.participanteId, monto: s.saldoCentavos }));

  // Orden estable: monto descendente y, en empate, por id.
  const porMonto = (a: { id: string; monto: number }, b: { id: string; monto: number }) =>
    b.monto - a.monto || a.id.localeCompare(b.id);

  deudores.sort(porMonto);
  acreedores.sort(porMonto);

  const transferencias: Transferencia[] = [];
  let i = 0;
  let j = 0;

  while (i < deudores.length && j < acreedores.length) {
    const deudor = deudores[i];
    const acreedor = acreedores[j];
    const monto = Math.min(deudor.monto, acreedor.monto);

    if (monto > 0) {
      transferencias.push({
        deParticipanteId: deudor.id,
        aParticipanteId: acreedor.id,
        montoCentavos: monto,
      });
    }

    deudor.monto -= monto;
    acreedor.monto -= monto;

    if (deudor.monto === 0) i += 1;
    if (acreedor.monto === 0) j += 1;
  }

  return transferencias;
}

/** true si ya no hay nada que saldar. */
export function estaSaldado(saldos: Saldo[]): boolean {
  return saldos.every((s) => s.saldoCentavos === 0);
}
