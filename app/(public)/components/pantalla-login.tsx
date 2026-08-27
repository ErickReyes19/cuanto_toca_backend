import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getSession } from "@/auth";
import { BotonGoogle } from "@/components/auth/boton-google";
import { RUTAS, alternatesDe, diccionario, type Idioma } from "@/lib/i18n";
import { getIdioma } from "@/lib/i18n/servidor";
import { googleEstaConfigurado } from "@/lib/google";
import Login from "./formLogin";
import { AuthShell, SeparadorAuth } from "./auth-shell";

/** Metadatos del login en un idioma. Los usan `/login` y `/en/login`. */
export function metadatosDeLogin(idioma: Idioma) {
  const t = diccionario(idioma);

  return {
    title: t.login.metaTitulo,
    description: t.login.metaDescripcion,
    alternates: alternatesDe("login", idioma),
    robots: { index: true, follow: true },
  };
}

export async function PantallaLogin() {
  const idioma = await getIdioma();
  const t = diccionario(idioma);

  const session = await getSession();
  if (session?.DebeCambiar) redirect(RUTAS.restablecer[idioma]);
  if (session) redirect("/grupos");

  const conGoogle = googleEstaConfigurado();

  return (
    <AuthShell
      titulo={t.login.titulo}
      descripcion={t.login.descripcion}
      pie={
        <span className="text-muted-foreground">
          {t.login.sinCuenta}{" "}
          <Link
            href={RUTAS.registro[idioma]}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {t.login.crearGratis}
          </Link>
        </span>
      }
    >
      <div className="space-y-4">
        {conGoogle ? (
          <>
            <BotonGoogle
              clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
              redirect="/grupos"
              texto="signin_with"
            />
            <SeparadorAuth texto={t.auth.separadorCorreo} />
          </>
        ) : null}

        <Suspense fallback={<div className="h-56 animate-pulse rounded-2xl bg-muted" />}>
          <Login />
        </Suspense>

        <p className="text-center text-sm">
          <Link
            href={RUTAS.olvide[idioma]}
            className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {t.login.olvidasteContrasena}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
