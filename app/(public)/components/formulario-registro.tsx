"use client";

import { Eye, EyeOff, KeyRound, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registrarUsuario } from "../actions";
import { initialLoginState } from "../state";

function BotonRegistro() {
  const { pending } = useFormStatus();

  return (
    <Button className="h-10 w-full rounded-xl font-bold" type="submit" disabled={pending}>
      {pending ? "Creando cuenta..." : "Crear cuenta gratis"}
    </Button>
  );
}

export function FormularioRegistro() {
  const router = useRouter();
  const [verPassword, setVerPassword] = useState(false);
  const [estado, accion] = useActionState(registrarUsuario, initialLoginState);

  useEffect(() => {
    if (estado.ok && estado.redirect) router.push(estado.redirect);
  }, [estado.ok, estado.redirect, router]);

  return (
    <form action={accion} className="space-y-3">
      <div className="space-y-2">
        <label htmlFor="nombre" className="text-sm font-semibold">
          Tu nombre
        </label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="nombre" name="nombre" placeholder="Ana Ramírez" required maxLength={100} className="h-10 rounded-xl pl-9" />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold">
          Correo
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="email" name="email" type="email" placeholder="tu-correo@dominio.com" required className="h-10 rounded-xl pl-9" />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="contrasena" className="text-sm font-semibold">
          Contraseña
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="contrasena"
            name="contrasena"
            type={verPassword ? "text" : "password"}
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            className="h-10 rounded-xl pr-10 pl-9"
          />
          <button
            type="button"
            onClick={() => setVerPassword((v) => !v)}
            aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
          >
            {verPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {estado.message && !estado.ok ? (
        <p className="text-sm text-destructive">{estado.message}</p>
      ) : null}

      <BotonRegistro />
    </form>
  );
}
