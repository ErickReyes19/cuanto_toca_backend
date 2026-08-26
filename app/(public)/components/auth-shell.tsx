import { Calculator, Link2, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const VENTAJAS = [
  {
    Icon: Calculator,
    titulo: "Cálculo exacto",
    detalle: "Hasta el último centavo. La suma siempre cuadra con el total.",
  },
  {
    Icon: Link2,
    titulo: "Invita por enlace",
    detalle: "Comparte un código y cada quien registra lo que puso.",
  },
  {
    Icon: ShieldCheck,
    titulo: "Sin costo ni topes",
    detalle: "Todos los gastos que necesites, sin muro de pago.",
  },
];

/**
 * Marco de las pantallas de sesión: panel de marca a la izquierda en escritorio
 * y la tarjeta del formulario a la derecha. En móvil solo se ve la tarjeta.
 */
export function AuthShell({
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

        <Link href="/" className="relative flex w-fit items-center gap-2.5 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-xl bg-stone-50 text-stone-950">
            <Wallet className="size-5" />
          </span>
          Cuánto Toca
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold tracking-tight text-balance">
            Deja de sacar cuentas en el grupo de WhatsApp.
          </h2>
          <p className="mt-3 text-stone-300">
            Anota quién puso qué y te decimos el número exacto de pagos para que todos queden a
            mano.
          </p>

          <ul className="mt-8 space-y-4">
            {VENTAJAS.map(({ Icon, titulo: t, detalle }) => (
              <li key={t} className="flex gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-stone-50/10">
                  <Icon className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{t}</span>
                  <span className="block text-sm text-stone-400">{detalle}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-stone-500">
          © {new Date().getFullYear()} Cuánto Toca
        </p>
      </aside>

      {/* Formulario */}
      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 flex items-center justify-center gap-2 font-semibold lg:hidden"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Wallet className="size-5" />
            </span>
            Cuánto Toca
          </Link>

          <div className="mb-6 space-y-1.5 text-center lg:text-left">
            <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
            <p className="text-sm text-muted-foreground text-pretty">{descripcion}</p>
          </div>

          {children}

          {pie ? <div className="mt-6 text-center text-sm">{pie}</div> : null}

          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link href="/" className="underline underline-offset-4 hover:text-foreground">
              Volver al inicio
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

/** Separador "o" entre el acceso con Google y el formulario de correo. */
export function SeparadorAuth({ texto = "o continúa con tu correo" }: { texto?: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">{texto}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
