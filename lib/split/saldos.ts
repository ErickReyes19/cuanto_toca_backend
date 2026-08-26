import type { GastoCalculo, PagoCalculo, Saldo } from "./tipos";

/**
 * Saldo neto de cada participante.
 *
 *   saldo = (lo que puso de su bolsa) - (lo que le correspondía)
 *
 * Positivo → le deben. Negativo → debe. La suma de todos los
 * saldos es siempre 0.
 */
export function calcularSaldos(
  participanteIds: string[],
  gastos: GastoCalculo[],
  pagos: PagoCalculo[] = []
): Saldo[] {
  const pagado = new Map<string, number>();
  const debido = new Map<string, number>();

  for (const id of participanteIds) {
    pagado.set(id, 0);
    debido.set(id, 0);
  }

  const sumar = (mapa: Map<string, number>, id: string, monto: number) => {
    if (!mapa.has(id)) return; // participante fuera del grupo: se ignora
    mapa.set(id, mapa.get(id)! + monto);
  };

  for (const gasto of gastos) {
    sumar(pagado, gasto.pagadoPorId, gasto.montoCentavos);
    for (const linea of gasto.reparto) {
      sumar(debido, linea.participanteId, linea.montoCentavos);
    }
  }

  // Una liquidación mueve dinero real: quien paga reduce su deuda,
  // quien cobra reduce lo que le deben.
  for (const pago of pagos) {
    sumar(pagado, pago.deParticipanteId, pago.montoCentavos);
    sumar(debido, pago.aParticipanteId, pago.montoCentavos);
  }

  return participanteIds.map((id) => {
    const pagadoCentavos = pagado.get(id) ?? 0;
    const debidoCentavos = debido.get(id) ?? 0;
    return {
      participanteId: id,
      pagadoCentavos,
      debidoCentavos,
      saldoCentavos: pagadoCentavos - debidoCentavos,
    };
  });
}

export function totalGastado(gastos: GastoCalculo[]): number {
  return gastos.reduce((acc, g) => acc + g.montoCentavos, 0);
}
