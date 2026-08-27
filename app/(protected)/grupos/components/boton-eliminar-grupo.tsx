"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { eliminarGrupo } from "../actions";

export function BotonEliminarGrupo({ grupoId, nombre }: { grupoId: string; nombre: string }) {
  const router = useRouter();
  const [enviando, setEnviando] = React.useState(false);

  async function eliminar() {
    setEnviando(true);
    try {
      await eliminarGrupo(grupoId);
      toast.success("Grupo eliminado.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar el grupo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Eliminar ${nombre}`} />}>
        <Trash2 className="size-4 text-destructive" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar “{nombre}”?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminarán permanentemente sus gastos, repartos, pagos e integrantes. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={enviando}>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={eliminar} disabled={enviando}>
            {enviando ? "Eliminando..." : "Eliminar grupo"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
