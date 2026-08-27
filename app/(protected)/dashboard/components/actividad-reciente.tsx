import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearMonto } from "@/lib/split/moneda";
import type { GrupoReciente } from "../actions";

/** Últimos grupos con movimiento, con su total en la moneda de cada uno. */
export function ActividadReciente({ grupos }: { grupos: GrupoReciente[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad reciente</CardTitle>
        <CardDescription>Los últimos grupos que se movieron.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {grupos.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="font-medium">Todavía no tienes grupos</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Crea uno para empezar a registrar gastos.
            </p>
            <Button className="mt-4" nativeButton={false} render={<Link href="/grupos" />}>
              Crear mi primer grupo
            </Button>
          </div>
        ) : (
          grupos.map((grupo) => (
            <Link
              key={grupo.id}
              href={`/grupos/${grupo.id}`}
              className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{grupo.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {grupo.participantes} participante(s) · {grupo.gastos} gasto(s)
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="secondary">
                  {formatearMonto(grupo.totalCentavos, grupo.moneda)}
                </Badge>
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
