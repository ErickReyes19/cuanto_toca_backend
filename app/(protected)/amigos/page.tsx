import { UsersRound } from "lucide-react";
import { redirect } from "next/navigation";

import { getSession } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { obtenerAmigos } from "@/app/(protected)/grupos/actions";

export default async function AmigosPage() {
  const session = await getSession();
  if (!session?.IdUser) redirect("/login?next=/amigos");
  const amigos = await obtenerAmigos();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Amigos</h1>
        <p className="text-sm text-muted-foreground">
          Se agregan automáticamente cuando ambos tienen cuenta y coinciden en un grupo.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Tu lista de amigos</CardTitle>
          <CardDescription>Úsalos al crear un grupo para agregarlos más rápido.</CardDescription>
        </CardHeader>
        <CardContent>
          {amigos.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              <UsersRound className="mx-auto mb-2 size-8" /> Aún no tienes amigos. Invita a alguien a un grupo para empezar.
            </div>
          ) : (
            <ul className="divide-y rounded-xl border">
              {amigos.map((amigo) => (
                <li key={amigo.id} className="flex items-center gap-3 p-3">
                  <Avatar><AvatarImage src={amigo.fotoUrl ?? undefined} alt={amigo.nombre} /><AvatarFallback>{amigo.nombre.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                  <span className="font-medium">{amigo.nombre}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
