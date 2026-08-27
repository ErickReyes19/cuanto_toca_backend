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
import { RUTAS, diccionario } from "@/lib/i18n";
import { getIdioma } from "@/lib/i18n/servidor";
import { ElegirIntegrante } from "./elegir-integrante";

/**
 * Pantalla de un enlace de invitación. La comparten `/unirse/[codigo]` y
 * `/en/join/[codigo]`: el idioma sale de la URL, así que un enlace compartido
 * en inglés llega en inglés y el mismo código en español llega en español.
 */
export async function PantallaUnirse({ codigo }: { codigo: string }) {
  const idioma = await getIdioma();
  const t = diccionario(idioma);
  const grupo = await verGrupoPorCodigo(codigo);

  if (!grupo) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <Link2 className="size-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold">{t.unirse.enlaceMuerto}</h1>
        <p className="text-sm text-muted-foreground">{t.unirse.enlaceMuertoDetalle}</p>
        <Button nativeButton={false} render={<Link href={RUTAS.inicio[idioma]} />}>
          {t.unirse.irCalculadora}
        </Button>
      </div>
    );
  }

  const session = await getSession();
  if (!session?.IdUser) {
    const destino = `${RUTAS.unirse[idioma]}/${encodeURIComponent(codigo)}`;
    redirect(`${RUTAS.login[idioma]}?next=${encodeURIComponent(destino)}`);
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{t.unirse.unirteA(grupo.nombre)}</CardTitle>
          <CardDescription>
            {t.unirse.resumenGrupo(grupo.totalGastos, grupo.moneda)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ElegirIntegrante codigo={codigo} participantes={grupo.participantes} />
        </CardContent>
      </Card>
    </div>
  );
}
