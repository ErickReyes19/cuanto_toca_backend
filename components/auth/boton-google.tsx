"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { loginConGoogle } from "@/auth";

/** API mínima de Google Identity Services que usamos. */
type GoogleIdentity = {
  accounts: {
    id: {
      initialize(config: {
        client_id: string;
        callback: (respuesta: { credential?: string }) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
        ux_mode?: "popup" | "redirect";
        itp_support?: boolean;
      }): void;
      renderButton(
        contenedor: HTMLElement,
        opciones: {
          type?: "standard" | "icon";
          theme?: "outline" | "filled_blue" | "filled_black";
          size?: "small" | "medium" | "large";
          text?: "signin_with" | "signup_with" | "continue_with";
          shape?: "rectangular" | "pill";
          logo_alignment?: "left" | "center";
          width?: number;
          locale?: string;
        }
      ): void;
      disableAutoSelect(): void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

const SRC = "https://accounts.google.com/gsi/client";

/**
 * Carga el script de Google una sola vez por pestaña, aunque haya varios
 * botones montados. Con `strict-dynamic` en el CSP, un script insertado por
 * nuestro bundle (que ya va firmado con nonce) hereda la confianza.
 */
let cargaGoogle: Promise<void> | null = null;

function cargarGoogle() {
  if (typeof window === "undefined") return Promise.reject(new Error("solo en el navegador"));
  if (window.google?.accounts?.id) return Promise.resolve();

  cargaGoogle ??= new Promise<void>((resolver, rechazar) => {
    const existente = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
    const script = existente ?? document.createElement("script");

    script.addEventListener("load", () => resolver(), { once: true });
    script.addEventListener(
      "error",
      () => {
        cargaGoogle = null;
        rechazar(new Error("No se pudo cargar Google Identity Services"));
      },
      { once: true }
    );

    if (!existente) {
      script.src = SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });

  return cargaGoogle;
}

export function BotonGoogle({
  clientId,
  redirect = "/grupos",
  texto = "continue_with",
}: {
  clientId: string;
  redirect?: string;
  texto?: "signin_with" | "signup_with" | "continue_with";
}) {
  const router = useRouter();
  const contenedor = React.useRef<HTMLDivElement>(null);
  const [estado, setEstado] = React.useState<"cargando" | "listo" | "error">("cargando");
  const [entrando, setEntrando] = React.useState(false);

  // `redirect` y `texto` se leen dentro del callback; con refs evitamos volver
  // a inicializar Google (y a repintar su botón) si el padre re-renderiza.
  const opciones = React.useRef({ redirect, texto });
  React.useEffect(() => {
    opciones.current = { redirect, texto };
  });

  React.useEffect(() => {
    let cancelado = false;

    cargarGoogle()
      .then(() => {
        if (cancelado || !contenedor.current || !window.google) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          ux_mode: "popup",
          itp_support: true,
          cancel_on_tap_outside: true,
          callback: async ({ credential }) => {
            if (!credential) {
              toast.error("Google no devolvió una credencial.");
              return;
            }

            setEntrando(true);
            try {
              const resultado = await loginConGoogle(credential, opciones.current.redirect);

              if (resultado.error) {
                toast.error(resultado.error);
                return;
              }

              toast.success("Sesión iniciada con Google.");
              router.push(resultado.redirect ?? opciones.current.redirect);
              router.refresh();
            } catch {
              toast.error("No pudimos iniciar sesión con Google.");
            } finally {
              setEntrando(false);
            }
          },
        });

        window.google.accounts.id.renderButton(contenedor.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          logo_alignment: "center",
          text: opciones.current.texto,
          locale: "es",
          width: Math.min(400, Math.round(contenedor.current.getBoundingClientRect().width) || 320),
        });

        setEstado("listo");
      })
      .catch(() => {
        if (!cancelado) setEstado("error");
      });

    return () => {
      cancelado = true;
    };
  }, [clientId, router]);

  if (estado === "error") {
    return (
      <p className="rounded-xl border border-dashed px-3 py-2.5 text-center text-xs text-muted-foreground">
        No se pudo cargar el acceso con Google. Revisa tu conexión o entra con tu correo.
      </p>
    );
  }

  return (
    <div className="relative">
      {/* Google pinta su botón dentro de este contenedor. */}
      <div ref={contenedor} className="flex min-h-11 justify-center [color-scheme:light]" />

      {estado === "cargando" ? (
        <div className="pointer-events-none absolute inset-0 animate-pulse rounded-full bg-muted" />
      ) : null}

      {entrando ? (
        <div className="absolute inset-0 grid place-items-center rounded-full bg-background/70 text-xs font-medium">
          Entrando...
        </div>
      ) : null}
    </div>
  );
}
