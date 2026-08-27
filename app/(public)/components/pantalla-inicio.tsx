import { Calculator, Link2, ShieldCheck } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

import { getSession } from "@/auth";
import { Anuncio } from "@/components/anuncios/anuncio";
import { ScriptAdsense } from "@/components/anuncios/script-adsense";
import { SLOTS } from "@/lib/adsense";
import { Button } from "@/components/ui/button";
import { HREFLANG, RUTAS, diccionario } from "@/lib/i18n";
import { getIdioma } from "@/lib/i18n/servidor";
import { SITIO, urlAbsoluta } from "@/lib/site";
import { Calculadora } from "./calculadora";
import { Caracteristica } from "./caracteristica";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

const ICONOS = [Calculator, Link2, ShieldCheck];

/**
 * Portada. La comparten `/` (español) y `/en` (inglés); el idioma llega por la
 * URL, así que solo hay un componente y dos páginas finas con sus metadatos.
 */
export async function PantallaInicio() {
  const idioma = await getIdioma();
  const t = diccionario(idioma);

  const session = await getSession();
  // El CSP corre con nonce; los bloques de datos también lo llevan.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  const url = urlAbsoluta(RUTAS.inicio[idioma]);

  const datosEstructurados = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: SITIO.nombre,
        description: t.sitio.descripcion,
        inLanguage: HREFLANG[idioma],
      },
      {
        "@type": "WebApplication",
        "@id": `${url}/#app`,
        name: SITIO.nombre,
        url,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        inLanguage: HREFLANG[idioma],
        description: t.sitio.descripcion,
        featureList: [...t.portada.funciones],
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}/#faq`,
        mainEntity: t.portada.preguntas.map(({ pregunta, respuesta }) => ({
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

      <ScriptAdsense />

      <SiteHeader autenticado={Boolean(session?.IdUser)} />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
          <section className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="size-3.5" /> {t.portada.insignia}
              </p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {t.portada.titular}
              </h1>
              <p className="mt-2 max-w-xl text-muted-foreground">{t.portada.bajada}</p>
            </div>

            <div className="flex shrink-0 gap-2">
              {session ? (
                <Button nativeButton={false} render={<Link href="/grupos" />}>
                  {t.nav.misGrupos}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link href={RUTAS.unirse[idioma]} />}
                >
                  <Link2 className="size-4" /> {t.nav.tengoCodigo}
                </Button>
              )}
            </div>
          </section>

          <section id="calculadora" className="scroll-mt-20">
            <Calculadora />
          </section>

          <Anuncio slot={SLOTS.landing} className="mt-10" />

          <section id="caracteristicas" className="mt-10 grid scroll-mt-20 gap-4 sm:grid-cols-3">
            {t.portada.caracteristicas.map((caracteristica, indice) => (
              <Caracteristica
                key={caracteristica.titulo}
                Icon={ICONOS[indice] ?? Calculator}
                titulo={caracteristica.titulo}
                detalle={caracteristica.detalle}
              />
            ))}
          </section>

          <section id="preguntas" className="mt-12 scroll-mt-20">
            <h2 className="text-2xl font-bold tracking-tight">
              {t.articulo.preguntasFrecuentes}
            </h2>
            <div className="mt-4 divide-y rounded-xl border">
              {t.portada.preguntas.map(({ pregunta, respuesta }) => (
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

          <Anuncio slot={SLOTS.banner} formato="horizontal" className="mt-12" />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

/**
 * Metadatos de la portada en un idioma. Los usan `/` y `/en`.
 *
 * A propósito no declara `openGraph`: Next no fusiona ese bloque campo por
 * campo, lo reemplaza entero. Definirlo aquí borraría `og:image`, `og:type` y
 * `og:locale`, que el layout raíz ya arma con el idioma correcto.
 */
export function metadatosDeInicio(idioma: "es" | "en") {
  const t = diccionario(idioma);

  return {
    title: t.portada.metaTitulo,
    description: t.sitio.descripcion,
    alternates: {
      canonical: RUTAS.inicio[idioma],
      languages: {
        es: RUTAS.inicio.es,
        "en-US": RUTAS.inicio.en,
        "x-default": RUTAS.inicio.es,
      },
    },
  };
}
