import { Wallet } from "lucide-react";
import Link from "next/link";

import { casosDeUso, paginasLegales } from "@/lib/contenido";
import { RUTAS, diccionario } from "@/lib/i18n";
import { getIdioma } from "@/lib/i18n/servidor";
import { SITIO } from "@/lib/site";
import { SelectorIdioma } from "./selector-idioma";

export async function SiteFooter() {
  const idioma = await getIdioma();
  const t = diccionario(idioma);
  const inicio = RUTAS.inicio[idioma];

  const columnas = [
    {
      titulo: t.pie.columnaCasos,
      enlaces: casosDeUso(idioma).map((caso) => ({ titulo: caso.enlace, href: caso.ruta })),
    },
    {
      titulo: t.pie.columnaCuenta,
      enlaces: [
        { titulo: t.nav.calculadora, href: `${inicio}#calculadora` },
        { titulo: t.nav.iniciarSesion, href: RUTAS.login[idioma] },
        { titulo: t.nav.crearCuenta, href: RUTAS.registro[idioma] },
        { titulo: t.nav.unirseConCodigo, href: RUTAS.unirse[idioma] },
      ],
    },
    {
      titulo: t.pie.columnaLegal,
      enlaces: paginasLegales(idioma).map((pagina) => ({
        titulo: pagina.enlace,
        href: pagina.ruta,
      })),
    },
  ];

  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href={inicio} className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="size-4" />
            </span>
            {SITIO.nombre}
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{t.pie.lema}</p>

          <SelectorIdioma className="mt-4 -ml-2.5" />
        </div>

        {columnas.map((columna) => (
          <div key={columna.titulo}>
            <p className="text-sm font-medium">{columna.titulo}</p>
            <ul className="mt-3 space-y-2">
              {columna.enlaces.map((enlace) => (
                <li key={enlace.href}>
                  <Link
                    href={enlace.href}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {enlace.titulo}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{t.pie.derechos(new Date().getFullYear())}</p>
          <p>{t.pie.remate}</p>
        </div>
      </div>
    </footer>
  );
}
