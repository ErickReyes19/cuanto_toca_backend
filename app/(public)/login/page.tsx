import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getSession } from "@/auth";
import { BotonGoogle } from "@/components/auth/boton-google";
import { googleEstaConfigurado } from "@/lib/google";
import Login from "../components/formLogin";
import { AuthShell, SeparadorAuth } from "../components/auth-shell";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Entra a tu cuenta de Cuánto Toca para ver tus grupos y gastos compartidos.",
  alternates: { canonical: "/login" },
  robots: { index: true, follow: true },
};

export default async function LoginPage() {
  const session = await getSession();
  if (session?.DebeCambiar) redirect("/reset-password");
  if (session) redirect("/grupos");

  const conGoogle = googleEstaConfigurado();

  return (
    <AuthShell
      titulo="Bienvenido de vuelta"
      descripcion="Entra para seguir dividiendo gastos con tu gente."
      pie={
        <span className="text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="font-medium text-foreground underline underline-offset-4">
            Crear una gratis
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
            <SeparadorAuth />
          </>
        ) : null}

        <Suspense
          fallback={<div className="h-56 animate-pulse rounded-2xl bg-muted" />}
        >
          <Login />
        </Suspense>

        <p className="text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
