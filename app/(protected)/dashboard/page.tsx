import {
  ArrowRight,
  Boxes,
  LayoutDashboard,
  ListCheck,
  Receipt,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatearMonto } from "@/lib/split/moneda";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.IdUser) redirect("/login?next=/dashboard");

  const permisos = session.Permiso ?? [];

  // Un grupo cuenta como "mío" si lo creé o si participo con mi cuenta.
  const misGrupos = {
    archivado: false,
    OR: [
      { propietarioId: session.IdUser },
      { participantes: { some: { usuarioId: session.IdUser } } },
    ],
  };

  const [totalGrupos, gruposDelSistema, totalGastos, grupos] = await Promise.all([
    prisma.grupo.count({ where: misGrupos }),
    prisma.grupo.count(),
    prisma.gasto.count({ where: { grupo: misGrupos } }),
    prisma.grupo.findMany({
      where: misGrupos,
      orderBy: { updateAt: "desc" },
      take: 5,
      select: {
        id: true,
        nombre: true,
        moneda: true,
        _count: { select: { participantes: true } },
        gastos: { select: { montoCentavos: true } },
      },
    }),
  ]);

  const [totalUsuarios, totalRoles, totalPermisos] = await Promise.all([
    permisos.includes("ver_usuarios") ? prisma.usuarios.count() : null,
    permisos.includes("ver_roles") ? prisma.rol.count({ where: { activo: true } }) : null,
    permisos.includes("ver_permisos")
      ? prisma.permiso.count({ where: { activo: true } })
      : null,
  ]);

  return (
    <div className="space-y-6">
      <HeaderComponent
        Icon={LayoutDashboard}
        screenName={`Hola, ${session.Nombre?.trim() || session.User}`}
        description="Resumen de tus grupos y de los módulos a los que tienes acceso."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Indicador
          Icon={Receipt}
          titulo="Grupos activos"
          valor={totalGrupos}
          detalle="Grupos donde participas"
          href="/grupos"
        />
        <Indicador
          Icon={Receipt}
          titulo="Gastos registrados"
          valor={totalGastos}
          detalle="En todos tus grupos"
          href="/grupos"
        />
        <Indicador
          Icon={Boxes}
          titulo="Grupos en el sistema"
          valor={gruposDelSistema}
          detalle="Total creados por todas las cuentas"
          href="/grupos"
        />
        {totalUsuarios !== null ? (
          <Indicador
            Icon={Users}
            titulo="Usuarios"
            valor={totalUsuarios}
            detalle="Cuentas registradas"
            href="/usuarios"
          />
        ) : null}
        {totalRoles !== null ? (
          <Indicador
            Icon={ShieldCheck}
            titulo="Roles"
            valor={totalRoles}
            detalle="Roles activos"
            href="/roles"
          />
        ) : null}
        {totalPermisos !== null ? (
          <Indicador
            Icon={ListCheck}
            titulo="Permisos"
            valor={totalPermisos}
            detalle="Permisos activos"
            href="/permisos"
          />
        ) : null}
      </div>

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
              <Button
                className="mt-4"
                nativeButton={false}
                render={<Link href="/grupos" />}
              >
                Crear mi primer grupo
              </Button>
            </div>
          ) : (
            grupos.map((grupo) => {
              const total = grupo.gastos.reduce((suma, g) => suma + g.montoCentavos, 0);

              return (
                <Link
                  key={grupo.id}
                  href={`/grupos/${grupo.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{grupo.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {grupo._count.participantes} participante(s) ·{" "}
                      {grupo.gastos.length} gasto(s)
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="secondary">{formatearMonto(total, grupo.moneda)}</Badge>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Indicador({
  Icon,
  titulo,
  valor,
  detalle,
  href,
}: {
  Icon: LucideIcon;
  titulo: string;
  valor: number;
  detalle: string;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="h-full transition-colors hover:bg-muted/40">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Icon className="size-4" />
            {titulo}
          </CardDescription>
          <CardTitle className="text-3xl tabular-nums">{valor}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{detalle}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
