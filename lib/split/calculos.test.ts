import assert from "node:assert/strict";
import test from "node:test";

import { simplificarDeudas } from "./liquidacion";
import { repartirGasto } from "./reparto";
import { calcularSaldos } from "./saldos";

test("los repartos conservan exactamente el total, incluso con residuos", () => {
  const casos = [
    { tipoReparto: "IGUAL" as const, entradas: [{ participanteId: "a" }, { participanteId: "b" }, { participanteId: "c" }] },
    { tipoReparto: "EXACTO" as const, entradas: [{ participanteId: "a", valor: 34 }, { participanteId: "b", valor: 33 }, { participanteId: "c", valor: 33 }] },
    { tipoReparto: "PORCENTAJE" as const, entradas: [{ participanteId: "a", valor: 3333 }, { participanteId: "b", valor: 3333 }, { participanteId: "c", valor: 3334 }] },
    { tipoReparto: "PARTES" as const, entradas: [{ participanteId: "a", valor: 1 }, { participanteId: "b", valor: 2 }, { participanteId: "c", valor: 3 }] },
  ];

  for (const caso of casos) {
    const resultado = repartirGasto({ montoCentavos: 100, ...caso });
    assert.equal(resultado.ok, true);
    if (resultado.ok) {
      assert.equal(resultado.lineas.reduce((total, linea) => total + linea.montoCentavos, 0), 100);
    }
  }
});

test("varios pagadores, reparto y liquidación conservan saldos correctos", () => {
  const saldos = calcularSaldos(
    ["ana", "beto", "carla"],
    [{
      id: "gasto-1",
      montoCentavos: 100,
      pagadores: [
        { participanteId: "ana", montoCentavos: 60 },
        { participanteId: "beto", montoCentavos: 40 },
      ],
      reparto: [
        { participanteId: "ana", montoCentavos: 34 },
        { participanteId: "beto", montoCentavos: 33 },
        { participanteId: "carla", montoCentavos: 33 },
      ],
    }]
  );

  assert.deepEqual(saldos.map((saldo) => saldo.saldoCentavos), [26, 7, -33]);
  assert.deepEqual(simplificarDeudas(saldos), [
    { deParticipanteId: "carla", aParticipanteId: "ana", montoCentavos: 26 },
    { deParticipanteId: "carla", aParticipanteId: "beto", montoCentavos: 7 },
  ]);

  const saldados = calcularSaldos(["ana", "beto", "carla"], [
    {
      id: "gasto-1",
      montoCentavos: 100,
      pagadores: [
        { participanteId: "ana", montoCentavos: 60 },
        { participanteId: "beto", montoCentavos: 40 },
      ],
      reparto: [
        { participanteId: "ana", montoCentavos: 34 },
        { participanteId: "beto", montoCentavos: 33 },
        { participanteId: "carla", montoCentavos: 33 },
      ],
    },
  ], [
    { deParticipanteId: "carla", aParticipanteId: "ana", montoCentavos: 26 },
    { deParticipanteId: "carla", aParticipanteId: "beto", montoCentavos: 7 },
  ]);
  assert.deepEqual(saldados.map((saldo) => saldo.saldoCentavos), [0, 0, 0]);
});
