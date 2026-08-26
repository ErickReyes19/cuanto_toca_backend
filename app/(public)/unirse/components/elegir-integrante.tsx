"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { unirseAGrupo } from "@/app/(protected)/grupos/actions";
import { Button } from "@/components/ui/button";

type Participante = { id: string; nombre: string; disponible: boolean };

export function ElegirIntegrante({
  codigo,
  participantes,
}: {
  codigo: string;
  participantes: Participante[];
}) {
  const router = useRouter();
  const [enviando, setEnviando] = React.useState(false);
  const [seleccion, setSeleccion] = React.useState<string | null>(null);

  const disponibles = participantes.filter((p) => p.disponible);

  async function unirse(participanteId?: string) {
    setEnviando(true);
    try {
      const { grupoId } = await unirseAGrupo(codigo, participanteId);
      toast.success("Ya estás en el grupo.");
      router.push(`/grupos/${grupoId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo unir al grupo.");
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-4">
      {disponibles.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">¿Cuál de estos eres tú?</p>
          <div className="flex flex-wrap gap-2">
            {disponibles.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSeleccion(p.id === seleccion ? null : p.id)}
                aria-pressed={seleccion === p.id}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  seleccion === p.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-muted"
                }`}
              >
                {p.nombre}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Todos los integrantes de la lista ya tienen cuenta vinculada. Puedes entrar como
          alguien nuevo.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Button onClick={() => unirse(seleccion ?? undefined)} disabled={enviando}>
          {enviando
            ? "Entrando..."
            : seleccion
              ? `Soy ${disponibles.find((p) => p.id === seleccion)?.nombre}`
              : "Entrar como integrante nuevo"}
        </Button>

        {seleccion ? (
          <Button variant="ghost" onClick={() => setSeleccion(null)} disabled={enviando}>
            Mejor entro como alguien nuevo
          </Button>
        ) : null}
      </div>
    </div>
  );
}
