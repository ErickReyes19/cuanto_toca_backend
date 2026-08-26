import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormularioRegistro } from "../components/formulario-registro";

export const metadata: Metadata = {
  title: "Crear cuenta · Cuánto Toca",
  description: "Crea tu cuenta gratis para guardar tus grupos e invitar a tus amigos.",
};

export default async function RegistroPage() {
  const session = await getSession();
  if (session) redirect("/grupos");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md">
        <Card className="border-border/70 bg-card shadow-xl shadow-foreground/5">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Crear cuenta</CardTitle>
            <CardDescription>
              Gratis y sin límite de gastos. Lo que ya calculaste no se pierde.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormularioRegistro />
            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="font-medium underline underline-offset-4">
                Inicia sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
