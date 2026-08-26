import { Link2, Wallet } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const ENLACES = [
  { titulo: "Calculadora", href: "/#calculadora" },
  { titulo: "Cómo funciona", href: "/#caracteristicas" },
  { titulo: "Unirse con código", href: "/unirse" },
];

export function SiteHeader({ autenticado }: { autenticado: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wallet className="size-4" />
          </span>
          <span>Cuánto Toca</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {ENLACES.map((enlace) => (
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
          {autenticado ? (
            <Button size="sm" nativeButton={false} render={<Link href="/dashboard" />}>
              Ir al panel
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                nativeButton={false}
                render={<Link href="/unirse" />}
              >
                <Link2 className="size-4" /> Tengo un código
              </Button>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Iniciar sesión
              </Button>
              <Button
                size="sm"
                className="hidden sm:inline-flex"
                nativeButton={false}
                render={<Link href="/registro" />}
              >
                Crear cuenta
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
