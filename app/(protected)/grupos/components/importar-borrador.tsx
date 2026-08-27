"use client";

import { Import, X } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { CLAVE_BORRADOR, type GrupoLocal } from "@/app/(public)/components/calculadora";
import { Button } from "@/components/ui/button";
import { escribirLocal, useAlmacenamientoLocal } from "@/hooks/use-almacenamiento-local";
import { formatearMonto } from "@/lib/split/moneda";
import { repartirGasto } from "@/lib/split/reparto";
import { importarGrupoLocal } from "../actions";

/**
 * Si el usuario venía usando la calculadora sin cuenta, aquí se le
 * ofrece convertir ese borrador en un grupo real. Es el puente del
 * embudo anónimo -> registrado.
 */
export function ImportarBorrador() {
  const router = useRouter();
  const [enviando, setEnviando] = React.useState(false);
  const crudo = useAlmacenamientoLocal(CLAVE_BORRADOR);

  const borrador = React.useMemo<GrupoLocal | null>(() => {
    if (!crudo) return null;
    try {
      const guardado = JSON.parse(crudo) as GrupoLocal;
      if (guardado?.participantes?.length && guardado?.gastos?.length) return guardado;
    } catch {
      // borrador corrupto: no se ofrece importar
    }
    return null;
  }, [crudo]);

  function descartar() {
    escribirLocal(CLAVE_BORRADOR, null);
  }

  async function importar() {
    if (!borrador) return;
    setEnviando(true);

    try {
      // El reparto se resuelve aquí para mandarlo ya cuadrado al servidor.
      const gastos = borrador.gastos.flatMap((gasto) => {
        const resultado = repartirGasto({
          montoCentavos: gasto.montoCentavos,
          tipoReparto: "IGUAL",
          entradas: gasto.participanteIds.map((id) => ({ participanteId: id })),
        });
        if (!resultado.ok) return [];

        return [
          {
            descripcion: gasto.descripcion,
            montoCentavos: gasto.montoCentavos,
            pagadores: gasto.pagadores,
            categoriaSlug: null,
            reparto: resultado.lineas.map((linea) => ({
              participanteId: linea.participanteId,
              montoCentavos: linea.montoCentavos,
            })),
          },
        ];
      });

      const { grupoId } = await importarGrupoLocal({
        nombre: borrador.nombre.trim() || "Mi grupo",
        moneda: borrador.moneda,
        tipo: borrador.tipo ?? "VIAJE_REUNION",
        participantes: borrador.participantes,
        gastos,
      });

      descartar();
      toast.success("Grupo guardado en tu cuenta.");
      router.push(`/grupos/${grupoId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el grupo.");
    } finally {
      setEnviando(false);
    }
  }

  if (!borrador) return null;

  const total = borrador.gastos.reduce((acc, g) => acc + g.montoCentavos, 0);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium">Tienes un cálculo sin guardar</p>
        <p className="text-sm text-muted-foreground">
          {borrador.nombre.trim() || "Grupo sin nombre"} · {borrador.participantes.length}{" "}
          integrantes · {borrador.gastos.length} gastos ·{" "}
          {formatearMonto(total, borrador.moneda)}
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        <Button variant="ghost" size="sm" onClick={descartar} disabled={enviando}>
          <X className="size-4" /> Descartar
        </Button>
        <Button size="sm" onClick={importar} disabled={enviando}>
          <Import className="size-4" /> {enviando ? "Guardando..." : "Guardar en mi cuenta"}
        </Button>
      </div>
    </div>
  );
}
