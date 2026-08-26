import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";

import { SITIO } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  // Base para resolver las URLs relativas de canonical, og:image, etc.
  metadataBase: new URL(SITIO.url),
  title: {
    default: `${SITIO.nombre} · Divide gastos entre amigos`,
    template: `%s · ${SITIO.nombre}`,
  },
  description: SITIO.descripcion,
  applicationName: SITIO.nombre,
  keywords: [...SITIO.palabrasClave],
  authors: [{ name: SITIO.nombre, url: SITIO.url }],
  creator: SITIO.nombre,
  publisher: SITIO.nombre,
  category: "finance",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITIO.nombre,
    locale: SITIO.locale,
    url: SITIO.url,
    title: `${SITIO.nombre} · Divide gastos entre amigos`,
    description: SITIO.descripcion,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITIO.nombre }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITIO.nombre} · Divide gastos entre amigos`,
    description: SITIO.descripcionCorta,
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
  // Evita que el navegador ofrezca traducir una app que ya está en español.
  other: {
    "google": "notranslate",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: SITIO.colorFondo },
    { media: "(prefers-color-scheme: dark)", color: SITIO.colorTema },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={SITIO.idioma} suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
