import { ArrowLeft, Receipt } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getSession } from "@/auth";
import { ListaTransferencias, TablaSaldos } from "@/components/resultado-liquidacion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { simplificarDeudas } from "@/lib/split/liquidacion";
import { formatearMonto } from "@/lib/split/moneda";
import { calcularSaldos, totalGastado } from "@/lib/split/saldos";
import { obtenerCategorias, obtenerGrupo } from "../actions";
import {
  AgregarIntegrante,
  BotonEliminarGasto,
  PanelInvitacion,
  RegistrarPago,
} from "./components/acciones-grupo";
import { NuevoGasto } from "./components/nuevo-gasto";

export default async function GrupoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;

  if (!session?.IdUser) redirect(`/login?next=/grupos/${id}`);

  const grupo = await obtenerGrupo(id).catch(() => null);
  if (!grupo) notFound();

  const categorias = await obtenerCategorias();

  const participanteIds = grupo.participantes.map((p) => p.id);
  const saldos = calcularSaldos(participanteIds, grupo.gastos, grupo.pagos);
  const transferencias = simplificarDeudas(saldos);
  const total = totalGastado(grupo.gastos);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6">
      <Link
        href="/grupos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Mis grupos
      </Link>

      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{grupo.nombre}</h1>
        <p className="text-sm text-muted-foreground">
          {grupo.participantes.length} integrantes · {grupo.gastos.length} gastos · Total{" "}
          <span className="font-semibold text-foreground">{formatearMonto(total, grupo.moneda)}</span>{" "}
          ({grupo.moneda})
        </p>
      </header>

      <PanelInvitacion
        grupoId={grupo.id}
        codigo={grupo.codigoInvitacion}
        esPropietario={grupo.esPropietario}
      />

      <Card>
        <CardHeader>
          <CardTitle>Cuánto le toca a cada quien</CardTitle>
          <CardDescription>
            {transferencias.length === 0
              ? "El grupo está cuadrado."
              : `Con ${transferencias.length} ${transferencias.length === 1 ? "pago" : "pagos"} quedan a mano.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <TablaSaldos participantes={grupo.participantes} saldos={saldos} moneda={grupo.moneda} />

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Quién le paga a quién</h3>
            <ListaTransferencias
              participantes={grupo.participantes}
              transferencias={transferencias}
              moneda={grupo.moneda}
            />
            <RegistrarPago
              grupoId={grupo.id}
              moneda={grupo.moneda}
              participantes={grupo.participantes}
              sugerencias={transferencias}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrantes</CardTitle>
          <CardDescription>
            Quien entre por el enlace puede reclamar su nombre en la lista.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {grupo.participantes.map((p) => (
              <Badge key={p.id} variant={p.tieneCuenta ? "default" : "secondary"} className="py-1.5">
                {p.nombre}
                {p.tieneCuenta ? <span className="ml-1.5 text-[10px] opacity-80">con cuenta</span> : null}
              </Badge>
            ))}
          </div>
          <AgregarIntegrante grupoId={grupo.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gastos</CardTitle>
          <CardDescription>Registra quién puso qué y cómo se divide.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <NuevoGasto
            grupoId={grupo.id}
            moneda={grupo.moneda}
            participantes={grupo.participantes}
            categorias={categorias}
          />

          {grupo.gastos.length === 0 ? (
            <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Todavía no hay gastos en este grupo.
            </p>
          ) : (
            <ul className="divide-y rounded-xl border">
              {grupo.gastos.map((gasto) => (
                <li key={gasto.id} className="flex items-center gap-3 p-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Receipt className="size-4 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{gasto.descripcion}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Pagó {gasto.pagadoPorNombre}
                      {gasto.categoria ? ` · ${gasto.categoria.nombre}` : ""} ·{" "}
                      {new Date(gasto.fecha).toLocaleDateString("es-419", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {formatearMonto(gasto.montoCentavos, grupo.moneda)}
                  </span>
                  <BotonEliminarGasto gastoId={gasto.id} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {grupo.pagos.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Pagos registrados</CardTitle>
            <CardDescription>Liquidaciones que ya se hicieron entre integrantes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y rounded-xl border">
              {grupo.pagos.map((pago) => (
                <li key={pago.id} className="flex items-center gap-3 p-3 text-sm">
                  <span className="flex-1 truncate">
                    <span className="font-medium">{pago.deNombre}</span> le pagó a{" "}
                    <span className="font-medium">{pago.aNombre}</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {formatearMonto(pago.montoCentavos, grupo.moneda)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
