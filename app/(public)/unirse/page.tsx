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

export default function UnirseConCodigoPage() {
  const router = useRouter();
  const [codigo, setCodigo] = React.useState("");

  function enviar(event: React.FormEvent) {
    event.preventDefault();
    const limpio = codigo.trim().toUpperCase();
    if (limpio) router.push(`/unirse/${encodeURIComponent(limpio)}`);
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="size-5" /> Entrar con código
          </CardTitle>
          <CardDescription>
            Escribe el código que te compartieron para unirte al grupo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={enviar} className="flex gap-2">
            <Input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="Ej. K7M2QPXY"
              onKeyDown={enviarConEnter}
              maxLength={16}
              autoFocus
              className="font-mono tracking-widest uppercase"
            />
            <Button type="submit" disabled={!codigo.trim()}>
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
