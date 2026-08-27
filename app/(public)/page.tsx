import { Calculator, Link2, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";

import { getSession } from "@/auth";
import { GoogleAd } from "@/components/google-ad";
import { Button } from "@/components/ui/button";
import { SITIO } from "@/lib/site";
import { Calculadora } from "./components/calculadora";
import { Caracteristica } from "./components/caracteristica";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";

export const metadata: Metadata = {
  title: "Divide gastos entre amigos",
  description: SITIO.descripcion,
  alternates: { canonical: "/" },
};

/** Preguntas que también se publican como FAQPage en el JSON-LD. */
const PREGUNTAS = [
  {
    pregunta: "¿Necesito crear una cuenta para dividir la cuenta?",
    respuesta:
      "No. La calculadora de la portada funciona sin cuenta: agregas a la gente, anotas quién puso qué y te da el resultado. La cuenta solo sirve para guardar el grupo e invitar a los demás por enlace.",
  },
  {
    pregunta: "¿Cómo calculan quién le debe a quién?",
    respuesta:
      "Sacamos el saldo de cada persona (lo que puso menos lo que le tocaba) y luego reducimos los pagos al mínimo posible, para que nadie ande haciendo tres transferencias cuando basta una.",
  },
  {
    pregunta: "¿Sirve si uno paga todo el súper con una sola tarjeta?",
    respuesta:
      "Sí. Puedes anotar cada producto y marcar a quién le corresponde: lo compartido se divide entre todos y lo de una sola persona se le carga completo, aunque el pago haya salido de una sola tarjeta.",
  },
  {
    pregunta: "¿Se pierden centavos al dividir?",
    respuesta:
      "No. Repartimos hasta el último centavo, así que la suma de las partes siempre da exactamente el total del gasto.",
  },
  {
    pregunta: "¿Tiene costo o límite de gastos?",
    respuesta:
      "Es gratis y no hay tope diario ni muro de pago. Puedes agregar todos los gastos que necesites.",
  },
];

export default async function InicioPage() {
  const session = await getSession();
  // El CSP corre con nonce; los bloques de datos también lo llevan.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  const datosEstructurados = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITIO.url}/#website`,
        url: SITIO.url,
        name: SITIO.nombre,
        description: SITIO.descripcion,
        inLanguage: "es",
      },
      {
        "@type": "WebApplication",
        "@id": `${SITIO.url}/#app`,
        name: SITIO.nombre,
        url: SITIO.url,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        inLanguage: "es",
        description: SITIO.descripcion,
        featureList: [
          "Dividir gastos en partes iguales, exactas, por porcentaje o por partes",
          "Tickets de despensa producto por producto",
          "Cálculo del mínimo de pagos para quedar a mano",
          "Enlace de invitación para que cada quien registre lo suyo",
        ],
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITIO.url}/#faq`,
        mainEntity: PREGUNTAS.map(({ pregunta, respuesta }) => ({
          "@type": "Question",
          name: pregunta,
          acceptedAnswer: { "@type": "Answer", text: respuesta },
        })),
      },
    ],
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }}
      />

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

          <GoogleAd slot={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_LANDING} className="mt-10 min-h-0" />

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

          <section id="preguntas" className="mt-12 scroll-mt-20">
            <h2 className="text-2xl font-bold tracking-tight">Preguntas frecuentes</h2>
            <div className="mt-4 divide-y rounded-xl border">
              {PREGUNTAS.map(({ pregunta, respuesta }) => (
                <details key={pregunta} className="group p-4">
                  <summary className="cursor-pointer list-none font-medium marker:content-none">
                    <span className="flex items-start justify-between gap-3">
                      {pregunta}
                      <span
                        aria-hidden
                        className="mt-1 shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-2 text-sm text-muted-foreground">{respuesta}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
