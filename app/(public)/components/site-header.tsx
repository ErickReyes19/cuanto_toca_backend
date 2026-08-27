import { Link2, Wallet } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { RUTAS, diccionario } from "@/lib/i18n";
import { getIdioma } from "@/lib/i18n/servidor";
import { SITIO } from "@/lib/site";
import { SelectorIdioma } from "./selector-idioma";

export async function SiteHeader({ autenticado }: { autenticado: boolean }) {
  const idioma = await getIdioma();
  const t = diccionario(idioma);
  const inicio = RUTAS.inicio[idioma];

  // Los anclas se quedan en español a propósito: son ids del DOM, no texto
  // visible, y cambiarlos por idioma rompería los enlaces ya compartidos.
  const enlaces = [
    { titulo: t.nav.calculadora, href: `${inicio}#calculadora` },
    { titulo: t.nav.comoFunciona, href: `${inicio}#caracteristicas` },
    { titulo: t.nav.unirseConCodigo, href: RUTAS.unirse[idioma] },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-4 px-4">
        <Link href={inicio} className="flex shrink-0 items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wallet className="size-4" />
          </span>
          <span>{SITIO.nombre}</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {enlaces.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {enlace.titulo}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
          <SelectorIdioma />

          {autenticado ? (
            <Button size="sm" nativeButton={false} render={<Link href="/dashboard" />}>
              {t.nav.irAlPanel}
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                nativeButton={false}
                render={<Link href={RUTAS.unirse[idioma]} />}
              >
                <Link2 className="size-4" /> {t.nav.tengoCodigo}
              </Button>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href={RUTAS.login[idioma]} />}
              >
                {t.nav.iniciarSesion}
              </Button>
              <Button
                size="sm"
                className="hidden sm:inline-flex"
                nativeButton={false}
                render={<Link href={RUTAS.registro[idioma]} />}
              >
                {t.nav.crearCuenta}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
