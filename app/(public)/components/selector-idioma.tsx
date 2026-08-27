"use client";

import { Languages } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CODIGO_IDIOMA, HREFLANG, IDIOMAS, NOMBRE_IDIOMA, rutaEquivalente } from "@/lib/i18n";
import { useIdioma } from "@/lib/i18n/cliente";
import { cn } from "@/lib/utils";

/**
 * Cambio de idioma.
 *
 * Enlaza a la MISMA página en el otro idioma, no a la portada: desde
 * `/dividir-la-despensa` lleva a `/en/split-grocery-bill`, y desde
 * `/unirse/K7M2QPXY` a `/en/join/K7M2QPXY` sin perder el código.
 *
 * Es un `<a>` de verdad, con `hreflang`, para que los buscadores lo sigan y
 * asocien las dos versiones. Un botón con `router.push` no serviría para eso.
 *
 * Nunca se esconde: quien cae en la versión equivocada tiene que poder salir
 * de ella sin recorrer la página hasta el pie. En móvil se encoge al código
 * ("ES" / "EN") en vez de desaparecer.
 */
export function SelectorIdioma({ className }: { className?: string }) {
  const pathname = usePathname();
  const { idioma } = useIdioma();

  const otro = IDIOMAS.find((valor) => valor !== idioma) ?? idioma;
  const destino = rutaEquivalente(pathname, otro);

  return (
    <Link
      href={destino}
      hrefLang={HREFLANG[otro]}
      lang={HREFLANG[otro]}
      // El idioma es una preferencia del visitante, no contenido que valga la
      // pena rastrear dos veces desde cada página.
      rel="nofollow"
      aria-label={`${NOMBRE_IDIOMA[otro]}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className
      )}
    >
      <Languages className="size-4 shrink-0" />
      <span className="hidden sm:inline">{NOMBRE_IDIOMA[otro]}</span>
      <span className="sm:hidden">{CODIGO_IDIOMA[otro]}</span>
    </Link>
  );
}
