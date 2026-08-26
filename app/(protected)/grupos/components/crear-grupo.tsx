"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MONEDAS, monedaSugerida } from "@/lib/split/moneda";
import { crearGrupo } from "../actions";

/** Base UI muestra el valor crudo si no se le pasa el mapa de etiquetas. */
const ETIQUETAS_MONEDA = Object.fromEntries(
  MONEDAS.map((m) => [m.codigo, `${m.codigo} · ${m.nombre}`])
);

export function CrearGrupo({ nombreUsuario }: { nombreUsuario: string }) {
  const router = useRouter();
  const [abierto, setAbierto] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);

  const [nombre, setNombre] = React.useState("");
  const [moneda, setMoneda] = React.useState("USD");
  const [integrante, setIntegrante] = React.useState("");
  // El primero de la lista es siempre quien crea el grupo.
  const [integrantes, setIntegrantes] = React.useState<string[]>([nombreUsuario]);

  // La moneda se sugiere al abrir el diálogo, no con un efecto: así el
  // usuario puede cambiarla y no se le reescribe sola en cada render.
  function cambiarApertura(siguiente: boolean) {
    if (siguiente) setMoneda(monedaSugerida());
    setAbierto(siguiente);
  }

  function agregar() {
    const limpio = integrante.trim();
    if (!limpio) return;
    setIntegrantes((actual) => [...actual, limpio]);
    setIntegrante("");
  }

  async function enviar(event: React.FormEvent) {
    event.preventDefault();
    if (!nombre.trim()) {
      toast.error("Ponle un nombre al grupo.");
      return;
    }

    setEnviando(true);
    try {
      const grupo = await crearGrupo({
        nombre: nombre.trim(),
        moneda,
        participantes: integrantes,
      });
      toast.success("Grupo creado.");
      setAbierto(false);
      setNombre("");
      setIntegrantes([nombreUsuario]);
      router.push(`/grupos/${grupo.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el grupo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={cambiarApertura}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" /> Nuevo grupo
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={enviar}>
          <DialogHeader>
            <DialogTitle>Nuevo grupo</DialogTitle>
            <DialogDescription>
              Los integrantes sin cuenta se agregan solo por nombre; después puedes invitarlos
              con un enlace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="grupo-nombre">Nombre</Label>
              <Input
                id="grupo-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Viaje a la playa"
                maxLength={120}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="grupo-moneda">Moneda</Label>
              <Select
                value={moneda}
                items={ETIQUETAS_MONEDA}
                onValueChange={(valor) => setMoneda(valor ?? moneda)}
              >
                <SelectTrigger id="grupo-moneda">
                  <SelectValue placeholder="Moneda" />
                </SelectTrigger>
                <SelectContent>
                  {MONEDAS.map((m) => (
                    <SelectItem key={m.codigo} value={m.codigo}>
                      {m.codigo} · {m.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="grupo-integrante">Integrantes</Label>
              <div className="flex gap-2">
                <Input
                  id="grupo-integrante"
                  value={integrante}
                  onChange={(e) => setIntegrante(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter agrega el integrante, no envía el formulario del diálogo.
                    if (e.key === "Enter") {
                      e.preventDefault();
                      agregar();
                    }
                  }}
                  placeholder="Nombre"
                  maxLength={80}
                />
                <Button type="button" variant="outline" onClick={agregar} disabled={!integrante.trim()}>
                  <Plus className="size-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {integrantes.map((nombreIntegrante, indice) => (
                  <Badge key={`${nombreIntegrante}-${indice}`} variant="secondary" className="gap-1.5 py-1.5 pr-1.5 pl-3">
                    {nombreIntegrante}
                    {indice === 0 ? (
                      <span className="text-[10px] text-muted-foreground">(tú)</span>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Quitar a ${nombreIntegrante}`}
                        onClick={() => setIntegrantes((a) => a.filter((_, i) => i !== indice))}
                        className="rounded-full p-0.5 hover:bg-foreground/10"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Creando..." : "Crear grupo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
