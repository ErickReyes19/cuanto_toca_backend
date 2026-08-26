import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/auth";
import { BotonGoogle } from "@/components/auth/boton-google";
import { googleEstaConfigurado } from "@/lib/google";
import { AuthShell, SeparadorAuth } from "../components/auth-shell";
import { FormularioRegistro } from "../components/formulario-registro";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description:
    "Crea tu cuenta gratis en Cuánto Toca para guardar tus grupos, invitar a tus amigos y llevar el control de los gastos compartidos.",
  alternates: { canonical: "/registro" },
  robots: { index: true, follow: true },
};

export default async function RegistroPage() {
  const session = await getSession();
  if (session) redirect("/grupos");

  const conGoogle = googleEstaConfigurado();

  return (
    <AuthShell
      titulo="Crea tu cuenta"
      descripcion="Gratis y sin límite de gastos. Lo que ya calculaste no se pierde."
      pie={
        <span className="text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
            Inicia sesión
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
            <SeparadorAuth texto="o regístrate con tu correo" />
          </>
        ) : null}

        <FormularioRegistro />

        <p className="text-center text-xs text-muted-foreground text-pretty">
          Al crear la cuenta aceptas que guardemos tus grupos y gastos para mostrártelos cuando
          entres.
        </p>
      </div>
    </AuthShell>
  );
}
