import { Calculator, Link2, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { getSession } from "@/auth";
import { Button } from "@/components/ui/button";
import { Calculadora } from "./components/calculadora";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";

export const metadata: Metadata = {
  title: "Cuánto Toca · Divide gastos entre amigos",
  description:
    "Calcula quién le debe a quién después de una salida. Gratis, sin cuenta y sin límites de gastos por día.",
};

export default async function InicioPage() {
  const session = await getSession();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader autenticado={Boolean(session?.IdUser)} />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
          <section className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="size-3.5" /> Gratis y sin límite de gastos
              </p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                ¿Cuánto le toca a cada quien?
              </h1>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Anota quién puso qué y te decimos el número exacto de pagos para quedar a mano. No
                necesitas cuenta para calcular.
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              {session ? (
                <Button nativeButton={false} render={<Link href="/grupos" />}>Mis grupos</Button>
              ) : (
                <Button variant="outline" nativeButton={false} render={<Link href="/unirse" />}>
                  <Link2 className="size-4" /> Tengo un código
                </Button>
              )}
            </div>
          </section>

          <section id="calculadora" className="scroll-mt-20">
            <Calculadora />
          </section>

          <section id="caracteristicas" className="mt-10 grid scroll-mt-20 gap-4 sm:grid-cols-3">
            <Caracteristica
              Icon={Calculator}
              titulo="Cálculo exacto"
              detalle="Repartimos hasta el último centavo: la suma siempre cuadra con el total."
            />
            <Caracteristica
              Icon={Link2}
              titulo="Enlace para unirse"
              detalle="Comparte un código por WhatsApp y cada quien registra lo que puso."
            />
            <Caracteristica
              Icon={ShieldCheck}
              titulo="Sin trabas"
              detalle="Agrega los gastos que necesites. No hay tope diario ni muro de pago."
            />
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Caracteristica({
  Icon,
  titulo,
  detalle,
}: {
  Icon: typeof Calculator;
  titulo: string;
  detalle: string;
}) {
  return (
    <div className="rounded-xl border p-4">
      <Icon className="mb-2 size-5 text-primary" />
      <p className="font-medium">{titulo}</p>
      <p className="text-sm text-muted-foreground">{detalle}</p>
    </div>
  );
}
