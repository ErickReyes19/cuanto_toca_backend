import { Link2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { verGrupoPorCodigo } from "@/app/(protected)/grupos/actions";
import { getSession } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ElegirIntegrante } from "../components/elegir-integrante";

export default async function UnirsePage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const grupo = await verGrupoPorCodigo(codigo);

  if (!grupo) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <Link2 className="size-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Este enlace ya no sirve</h1>
        <p className="text-sm text-muted-foreground">
          Puede que el grupo se haya archivado o que quien lo creó haya generado un enlace nuevo.
          Pídele el código actualizado.
        </p>
        <Button nativeButton={false} render={<Link href="/" />}>Ir a la calculadora</Button>
      </div>
    );
  }

  const session = await getSession();
  if (!session?.IdUser) {
    redirect(`/login?next=/unirse/${encodeURIComponent(codigo)}`);
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Unirte a “{grupo.nombre}”</CardTitle>
          <CardDescription>
            {grupo.totalGastos} gastos registrados · moneda {grupo.moneda}. Si ya estás en la
            lista, reclama tu nombre para que los saldos queden a tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ElegirIntegrante codigo={codigo} participantes={grupo.participantes} />
        </CardContent>
      </Card>
    </div>
  );
}
