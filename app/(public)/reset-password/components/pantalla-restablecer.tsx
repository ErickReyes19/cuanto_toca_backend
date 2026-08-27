import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getSession } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RUTAS, diccionario } from "@/lib/i18n";
import { getIdioma } from "@/lib/i18n/servidor";
import ResetPassword from "./form";

/**
 * Cambio de contraseña obligatorio al entrar. La comparten
 * `/reset-password` y `/en/reset-password`.
 */
export async function PantallaRestablecer() {
  const idioma = await getIdioma();
  const t = diccionario(idioma);

  const session = await getSession();
  if (!session?.IdUser || !session.DebeCambiar) {
    redirect(RUTAS.inicio[idioma]);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md">
        <Card className="border-border/70 bg-card shadow-xl shadow-foreground/5">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {t.contrasena.obligatorioTitulo}
            </CardTitle>
            <CardDescription>{t.contrasena.obligatorioDetalle}</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="text-sm text-muted-foreground">{t.contrasena.cargando}</div>
              }
            >
              <ResetPassword username={session.User} />
            </Suspense>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
