import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";

import { LANG_HTML, LOCALE_OG, RUTAS, diccionario } from "@/lib/i18n";
import { getIdioma } from "@/lib/i18n/servidor";
import { METADATOS_EXTRA, VERIFICACIONES } from "@/lib/metadatos";
import { SITIO } from "@/lib/site";
import "./globals.css";

/**
 * Los metadatos base cambian con el idioma de la URL, así que se generan por
 * petición en vez de exportarse como constante. Cada página sigue pudiendo
 * pisar el título, la descripción y el canonical con su propio `metadata`.
 */
export async function generateMetadata(): Promise<Metadata> {
  const idioma = await getIdioma();
  const t = diccionario(idioma);
  const titulo = `${SITIO.nombre} · ${t.sitio.tagline}`;

  return {
    // Base para resolver las URLs relativas de canonical, og:image, etc.
    metadataBase: new URL(SITIO.url),
    title: {
      default: titulo,
      template: `%s · ${SITIO.nombre}`,
    },
    description: t.sitio.descripcion,
    applicationName: SITIO.nombre,
    keywords: [...t.sitio.palabrasClave],
    authors: [{ name: SITIO.nombre, url: SITIO.url }],
    creator: SITIO.nombre,
    publisher: SITIO.nombre,
    category: "finance",
    alternates: {
      canonical: RUTAS.inicio[idioma],
      languages: {
        es: RUTAS.inicio.es,
        "en-US": RUTAS.inicio.en,
        "x-default": RUTAS.inicio.es,
      },
    },
    openGraph: {
      type: "website",
      siteName: SITIO.nombre,
      locale: LOCALE_OG[idioma],
      url: `${SITIO.url}${RUTAS.inicio[idioma]}`,
      title: titulo,
      description: t.sitio.descripcion,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITIO.nombre }],
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: t.sitio.descripcionCorta,
      images: ["/opengraph-image"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    formatDetection: {
      telephone: false,
      address: false,
      email: false,
    },
    // Verificaciones y meta tags propios: se editan en lib/metadatos.ts, no aquí.
    verification: VERIFICACIONES,
    other: METADATOS_EXTRA,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: SITIO.colorFondo },
    { media: "(prefers-color-scheme: dark)", color: SITIO.colorTema },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const idioma = await getIdioma();

  return (
    <html lang={LANG_HTML[idioma]} suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
