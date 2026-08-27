import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/auth";
import { BotonGoogle } from "@/components/auth/boton-google";
import { RUTAS, alternatesDe, diccionario, type Idioma } from "@/lib/i18n";
import { getIdioma } from "@/lib/i18n/servidor";
import { googleEstaConfigurado } from "@/lib/google";
import { AuthShell, SeparadorAuth } from "./auth-shell";
import { FormularioRegistro } from "./formulario-registro";

/** Metadatos del registro en un idioma. Los usan `/registro` y `/en/signup`. */
export function metadatosDeRegistro(idioma: Idioma) {
  const t = diccionario(idioma);

  return {
    title: t.registro.metaTitulo,
    description: t.registro.metaDescripcion,
    alternates: alternatesDe("registro", idioma),
    robots: { index: true, follow: true },
  };
}

export async function PantallaRegistro() {
  const idioma = await getIdioma();
  const t = diccionario(idioma);

  const session = await getSession();
  if (session) redirect("/grupos");

  const conGoogle = googleEstaConfigurado();

  return (
    <AuthShell
      titulo={t.registro.titulo}
      descripcion={t.registro.descripcion}
      pie={
        <span className="text-muted-foreground">
          {t.registro.yaTienesCuenta}{" "}
          <Link
            href={RUTAS.login[idioma]}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {t.registro.iniciaSesion}
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
              texto="signup_with"
            />
            <SeparadorAuth texto={t.auth.separadorRegistro} />
          </>
        ) : null}

        <FormularioRegistro />

        <p className="text-center text-xs text-muted-foreground text-pretty">{t.registro.nota}</p>
      </div>
    </AuthShell>
  );
}
