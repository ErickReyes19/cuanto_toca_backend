import { headers } from "next/headers";
import Link from "next/link";
import type { ReactNode } from "react";

import { getSession } from "@/auth";
import { Anuncio } from "@/components/anuncios/anuncio";
import { ScriptAdsense } from "@/components/anuncios/script-adsense";
import { SLOTS } from "@/lib/adsense";
import { casosRelacionados } from "@/lib/contenido";
import { HREFLANG, type ClavePagina, RUTAS, alternatesDe, diccionario } from "@/lib/i18n";
import { getIdioma } from "@/lib/i18n/servidor";
import { urlAbsoluta } from "@/lib/site";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export type Pregunta = { pregunta: string; respuesta: string };

/**
 * Metadatos de una página de contenido, iguales en los dos idiomas salvo el
 * texto. Cada `page.tsx` la llama desde su `generateMetadata`.
 */
export function metadatosDeContenido(clave: ClavePagina, idioma: "es" | "en") {
  const pagina = diccionario(idioma).paginas[clave];

  return {
    title: pagina.metaTitulo,
    description: pagina.entradilla,
    alternates: alternatesDe(clave, idioma),
  };
}

/**
 * Molde de las páginas de contenido: mismo encabezado, pie, anuncios y datos
 * estructurados para todas. Cada página aporta solo su texto, que es lo que
 * de verdad las diferencia.
 *
 * El título y la entradilla salen del diccionario a partir de `clave`, así que
 * la versión en español y la inglesa no pueden quedar diciendo cosas distintas
 * en el `<h1>` y en el `<title>`.
 */
export async function PaginaContenido({
  clave,
  preguntas,
  children,
  conRelacionadas = false,
  conFecha = false,
}: {
  clave: ClavePagina;
  preguntas?: Pregunta[];
  children: ReactNode;
  /** Enlaza a los otros casos de uso. Los legales no lo necesitan. */
  conRelacionadas?: boolean;
  /** "Última actualización" al inicio. Solo lo usan privacidad y términos. */
  conFecha?: boolean;
}) {
  const idioma = await getIdioma();
  const t = diccionario(idioma);
  const { titulo, entradilla } = t.paginas[clave];

  const ruta = RUTAS[clave][idioma];
  const url = urlAbsoluta(ruta);
  const relacionadas = conRelacionadas ? casosRelacionados(clave, idioma) : [];

  const session = await getSession();
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  const grafo: Array<Record<string, unknown>> = [
    {
      "@type": "WebPage",
      "@id": `${url}#pagina`,
      url,
      name: titulo,
      description: entradilla,
      inLanguage: HREFLANG[idioma],
      isPartOf: { "@id": `${urlAbsoluta(RUTAS.inicio[idioma])}/#website` },
    },
  ];

  if (preguntas?.length) {
    grafo.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
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
            {conFecha ? (
              <p className="text-sm text-muted-foreground">
                {t.articulo.ultimaActualizacion(t.articulo.fechaLegales)}
              </p>
            ) : null}
            {children}
          </div>

          {preguntas?.length ? (
            <section className="mt-12">
              <h2 className="text-2xl font-bold tracking-tight">{t.articulo.preguntasFrecuentes}</h2>
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

          {relacionadas.length ? (
            <nav className="mt-12 rounded-xl border p-4">
              <h2 className="text-sm font-semibold">{t.articulo.tambienTeSirve}</h2>
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
