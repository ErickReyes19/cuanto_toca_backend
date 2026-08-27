"use client";

import { Link2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { enviarConEnter } from "@/lib/formulario";
import { RUTAS } from "@/lib/i18n";
import { useIdioma } from "@/lib/i18n/cliente";
import { SelectorIdioma } from "./selector-idioma";

/**
 * Caja para entrar a un grupo con el código que te compartieron. Vive aparte
 * de la página para que `/unirse` y `/en/join` puedan ser páginas de servidor
 * con sus propios metadatos.
 */
export function FormularioUnirse() {
  const { idioma, t } = useIdioma();
  const router = useRouter();
  const [codigo, setCodigo] = React.useState("");

  function enviar(event: React.FormEvent) {
    event.preventDefault();
    const limpio = codigo.trim().toUpperCase();
    if (limpio) {
      router.push(`${RUTAS.unirse[idioma]}/${encodeURIComponent(limpio)}`);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="size-5" /> {t.unirse.titulo}
          </CardTitle>
          <CardDescription>{t.unirse.descripcion}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={enviar} className="flex gap-2">
            <Input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder={t.unirse.codigoPlaceholder}
              onKeyDown={enviarConEnter}
              maxLength={16}
              autoFocus
              className="font-mono tracking-widest uppercase"
            />
            <Button type="submit" disabled={!codigo.trim()}>
              {t.unirse.entrar}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Esta pantalla no lleva encabezado, así que el cambio de idioma va
          aquí: es una página indexada en los dos idiomas. */}
      <div className="mt-4 flex justify-center">
        <SelectorIdioma />
      </div>
    </div>
  );
}
