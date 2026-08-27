import { Receipt, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import { Badge } from "@/components/ui/badge";
import { formatearMonto } from "@/lib/split/moneda";
import { obtenerAmigos, obtenerGrupos } from "./actions";
import { CrearGrupo } from "./components/crear-grupo";
import { BotonEliminarGrupo } from "./components/boton-eliminar-grupo";
import { ImportarBorrador } from "./components/importar-borrador";

export default async function GruposPage() {
  const session = await getSession();
  if (!session?.IdUser) redirect("/login?next=/grupos");

  const [grupos, amigos] = await Promise.all([obtenerGrupos(), obtenerAmigos()]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <HeaderComponent
          Icon={Users}
          screenName="Mis grupos"
          description="Cada grupo lleva sus propios gastos y su liquidación."
        />
        <CrearGrupo nombreUsuario={session.Nombre?.trim() || session.User} amigos={amigos} />
      </div>

      <ImportarBorrador />

      {grupos.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <Receipt className="mx-auto mb-3 size-10 text-muted-foreground" />
          <p className="font-medium">Todavía no tienes grupos</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea uno para empezar a registrar gastos, o{" "}
            <Link href="/" className="underline underline-offset-4">
              prueba la calculadora rápida
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {grupos.map((grupo) => (
            <li key={grupo.id}>
              <div className="flex items-center gap-3 rounded-xl border p-4 transition hover:bg-muted/40">
                <Link href={`/grupos/${grupo.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{grupo.nombre}</p>
                      {grupo.esPropietario ? (
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          Tuyo
                        </Badge>
                      ) : null}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {grupo.tipo === "DESPENSA_FAMILIAR" ? "Despensa familiar" : "Viajes y reuniones"} · {grupo.totalParticipantes} integrantes · {grupo.totalGastos} gastos
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {formatearMonto(grupo.totalCentavos, grupo.moneda)}
                  </span>
                </Link>
                {grupo.esPropietario ? (
                  <BotonEliminarGrupo grupoId={grupo.id} nombre={grupo.nombre} />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
