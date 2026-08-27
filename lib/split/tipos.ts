export const TIPOS_REPARTO = ["IGUAL", "EXACTO", "PORCENTAJE", "PARTES"] as const;
export type TipoReparto = (typeof TIPOS_REPARTO)[number];

/** Una línea del reparto tal como la captura el usuario. */
export type EntradaReparto = {
  participanteId: string;
  /**
   * Según el tipo de reparto:
   * - IGUAL: se ignora (participa con peso 1)
   * - EXACTO: monto en unidad menor
   * - PORCENTAJE: puntos base (12.5% = 1250)
   * - PARTES: número de partes (1, 2, 3...)
   */
  valor?: number;
};

/** Una línea del reparto ya resuelta a dinero exacto. */
export type LineaReparto = {
  participanteId: string;
  montoCentavos: number;
  pesoEntrada: number | null;
};

/** Una línea de "quién puso el dinero". */
export type LineaPagador = {
  participanteId: string;
  montoCentavos: number;
};

export type GastoCalculo = {
  id: string;
  montoCentavos: number;
  /**
   * Quiénes pusieron el dinero y cuánto cada uno. Es una lista porque un
   * gasto se puede cubrir entre varios; la suma es igual a `montoCentavos`.
   */
  pagadores: LineaPagador[];
  reparto: Array<{ participanteId: string; montoCentavos: number }>;
};

export type PagoCalculo = {
  deParticipanteId: string;
  aParticipanteId: string;
  montoCentavos: number;
};

export type Saldo = {
  participanteId: string;
  /** Lo que puso de su bolsa (gastos pagados + liquidaciones enviadas) */
  pagadoCentavos: number;
  /** Lo que le correspondía (su parte de los gastos + liquidaciones recibidas) */
  debidoCentavos: number;
  /** pagado - debido. Positivo = le deben. Negativo = debe. */
  saldoCentavos: number;
};

export type Transferencia = {
  deParticipanteId: string;
  aParticipanteId: string;
  montoCentavos: number;
};
