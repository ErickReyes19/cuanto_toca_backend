import { Wallet } from "lucide-react";
import Link from "next/link";

import { CASOS_DE_USO, PAGINAS_LEGALES } from "@/lib/contenido";

const COLUMNAS = [
  {
    titulo: "Cómo dividir",
    enlaces: CASOS_DE_USO.map((caso) => ({ titulo: caso.enlace, href: caso.ruta })),
  },
  {
    titulo: "Cuenta",
    enlaces: [
      { titulo: "Calculadora", href: "/#calculadora" },
      { titulo: "Iniciar sesión", href: "/login" },
      { titulo: "Crear cuenta", href: "/registro" },
      { titulo: "Unirse con código", href: "/unirse" },
    ],
  },
  {
    titulo: "Legal",
    enlaces: PAGINAS_LEGALES.map((pagina) => ({ titulo: pagina.enlace, href: pagina.ruta })),
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="size-4" />
            </span>
            Cuánto Toca
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Divide gastos entre amigos y descubre el número exacto de pagos para
            quedar a mano.
          </p>
        </div>

        {COLUMNAS.map((columna) => (
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
          <p>© {new Date().getFullYear()} Cuánto Toca. Todos los derechos reservados.</p>
          <p>Hecho para dividir la cuenta sin pleitos.</p>
        </div>
      </div>
    </footer>
  );
}
