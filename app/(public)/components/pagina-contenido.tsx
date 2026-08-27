import { headers } from "next/headers";
import Link from "next/link";
import type { ReactNode } from "react";

import { getSession } from "@/auth";
import { Anuncio } from "@/components/anuncios/anuncio";
import { ScriptAdsense } from "@/components/anuncios/script-adsense";
import { SLOTS } from "@/lib/adsense";
import { SITIO } from "@/lib/site";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export type Pregunta = { pregunta: string; respuesta: string };

/**
 * Molde de las páginas de contenido: mismo encabezado, pie, anuncios y datos
 * estructurados para todas. Cada página aporta solo su texto, que es lo que
 * de verdad las diferencia.
 */
export async function PaginaContenido({
  ruta,
  titulo,
  entradilla,
  preguntas,
  children,
  relacionadas,
}: {
  /** Ruta absoluta, para el canonical y el JSON-LD. */
  ruta: string;
  titulo: string;
  entradilla: string;
  preguntas?: Pregunta[];
  children: ReactNode;
  relacionadas?: Array<{ href: string; titulo: string }>;
}) {
  const session = await getSession();
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  const grafo: Array<Record<string, unknown>> = [
    {
      "@type": "WebPage",
      "@id": `${SITIO.url}${ruta}#pagina`,
      url: `${SITIO.url}${ruta}`,
      name: titulo,
      description: entradilla,
      inLanguage: "es",
      isPartOf: { "@id": `${SITIO.url}/#website` },
    },
  ];

  if (preguntas?.length) {
    grafo.push({
      "@type": "FAQPage",
      "@id": `${SITIO.url}${ruta}#faq`,
      mainEntity: preguntas.map(({ pregunta, respuesta }) => ({
        "@type": "Question",
        name: pregunta,
        acceptedAnswer: { "@type": "Answer", text: respuesta },
      })),
    });
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ "@context": "https://schema.org", "@graph": grafo }),
        }}
      />
      <ScriptAdsense />

      <SiteHeader autenticado={Boolean(session?.IdUser)} />

      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{titulo}</h1>
          <p className="mt-3 text-lg text-muted-foreground text-pretty">{entradilla}</p>

          <div className="mt-8 space-y-6 leading-relaxed [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
            {children}
          </div>

          {preguntas?.length ? (
            <section className="mt-12">
              <h2 className="text-2xl font-bold tracking-tight">Preguntas frecuentes</h2>
              <div className="mt-4 divide-y rounded-xl border">
                {preguntas.map(({ pregunta, respuesta }) => (
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
          ) : null}

          {relacionadas?.length ? (
            <nav className="mt-12 rounded-xl border p-4">
              <h2 className="text-sm font-semibold">También te puede servir</h2>
              <ul className="mt-3 space-y-2">
                {relacionadas.map((enlace) => (
                  <li key={enlace.href}>
                    <Link
                      href={enlace.href}
                      className="text-sm underline underline-offset-4 hover:text-foreground"
                    >
                      {enlace.titulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <Anuncio slot={SLOTS.banner} formato="horizontal" className="mt-12" />
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
