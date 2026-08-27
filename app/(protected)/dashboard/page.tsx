import { Boxes, LayoutDashboard, ListCheck, Receipt, ShieldCheck, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { getSession } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import { obtenerResumenPanel } from "./actions";
import { ActividadReciente } from "./components/actividad-reciente";
import { Indicador } from "./components/indicador";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.IdUser) redirect("/login?next=/dashboard");

  const resumen = await obtenerResumenPanel();

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
          valor={resumen.misGrupos}
          detalle="Grupos donde participas"
          href="/grupos"
        />
        <Indicador
          Icon={Receipt}
          titulo="Gastos registrados"
          valor={resumen.misGastos}
          detalle="En todos tus grupos"
          href="/grupos"
        />
        <Indicador
          Icon={Boxes}
          titulo="Grupos en el sistema"
          valor={resumen.gruposDelSistema}
          detalle="Total creados por todas las cuentas"
          href="/grupos"
        />

        {resumen.totalUsuarios !== null ? (
          <Indicador
            Icon={Users}
            titulo="Usuarios"
            valor={resumen.totalUsuarios}
            detalle="Cuentas registradas"
            href="/usuarios"
          />
        ) : null}
        {resumen.totalRoles !== null ? (
          <Indicador
            Icon={ShieldCheck}
            titulo="Roles"
            valor={resumen.totalRoles}
            detalle="Roles activos"
            href="/roles"
          />
        ) : null}
        {resumen.totalPermisos !== null ? (
          <Indicador
            Icon={ListCheck}
            titulo="Permisos"
            valor={resumen.totalPermisos}
            detalle="Permisos activos"
            href="/permisos"
          />
        ) : null}
      </div>

      <ActividadReciente grupos={resumen.gruposRecientes} />
    </div>
  );
}
