import { Calculator, Link2, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { RUTAS, diccionario } from "@/lib/i18n";
import { getIdioma } from "@/lib/i18n/servidor";
import { SITIO } from "@/lib/site";
import { SelectorIdioma } from "./selector-idioma";

const ICONOS = [Calculator, Link2, ShieldCheck];

/**
 * Marco de las pantallas de sesión: panel de marca a la izquierda en escritorio
 * y la tarjeta del formulario a la derecha. En móvil solo se ve la tarjeta.
 */
export async function AuthShell({
  titulo,
  descripcion,
  children,
  pie,
}: {
  titulo: string;
  descripcion: string;
  children: ReactNode;
  pie?: ReactNode;
}) {
  const idioma = await getIdioma();
  const t = diccionario(idioma);
  const inicio = RUTAS.inicio[idioma];

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Panel de marca */}
      <aside className="relative hidden overflow-hidden bg-stone-950 p-10 text-stone-50 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-24 size-96 rounded-full bg-stone-100/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -bottom-28 size-80 rounded-full bg-stone-100/5 blur-3xl"
        />

        <Link href={inicio} className="relative flex w-fit items-center gap-2.5 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-xl bg-stone-50 text-stone-950">
            <Wallet className="size-5" />
          </span>
          {SITIO.nombre}
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold tracking-tight text-balance">{t.auth.titular}</h2>
          <p className="mt-3 text-stone-300">{t.auth.bajada}</p>

          <ul className="mt-8 space-y-4">
            {t.auth.ventajas.map((ventaja, indice) => {
              const Icon = ICONOS[indice] ?? Calculator;
              return (
                <li key={ventaja.titulo} className="flex gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-stone-50/10">
                    <Icon className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{ventaja.titulo}</span>
                    <span className="block text-sm text-stone-400">{ventaja.detalle}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="relative text-xs text-stone-500">
          © {new Date().getFullYear()} {SITIO.nombre}
        </p>
      </aside>

      {/* Formulario */}
      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <Link
            href={inicio}
            className="mb-8 flex items-center justify-center gap-2 font-semibold lg:hidden"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Wallet className="size-5" />
            </span>
            {SITIO.nombre}
          </Link>

          <div className="mb-6 space-y-1.5 text-center lg:text-left">
            <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
            <p className="text-sm text-muted-foreground text-pretty">{descripcion}</p>
          </div>

          {children}

          {pie ? <div className="mt-6 text-center text-sm">{pie}</div> : null}

          <div className="mt-8 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Link href={inicio} className="underline underline-offset-4 hover:text-foreground">
              {t.auth.volverAlInicio}
            </Link>
            <span aria-hidden>·</span>
            <SelectorIdioma className="px-1.5 py-1 text-xs" />
          </div>
        </div>
      </main>
    </div>
  );
}

/** Separador "o" entre el acceso con Google y el formulario de correo. */
export function SeparadorAuth({ texto }: { texto: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">{texto}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
