"use client";

import { Eye, EyeOff, KeyRound, Loader2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { saveLoginTasksToast } from "@/components/login-tasks-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginWithCredentialsAction } from "../actions";
import { initialLoginState } from "../state";

function BotonEntrar() {
  const { pending } = useFormStatus();

  return (
    <Button className="h-11 w-full rounded-xl text-sm font-semibold" type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" /> Entrando...
        </>
      ) : (
        "Entrar"
      )}
    </Button>
  );
}

export default function Login() {
  const router = useRouter();
  const [verPassword, setVerPassword] = useState(false);
  const [estado, accion] = useActionState(loginWithCredentialsAction, initialLoginState);

  useEffect(() => {
    if (estado.ok && estado.redirect) {
      if ((estado.tareasHoy ?? 0) > 0) saveLoginTasksToast(estado.tareasHoy ?? 0);
      router.push(estado.redirect);
    }
  }, [estado.ok, estado.redirect, estado.tareasHoy, router]);

  return (
    <form action={accion} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="identifier" className="text-sm font-medium">
          Usuario o correo
        </label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="identifier"
            name="identifier"
            autoComplete="username"
            placeholder="tu_usuario o tu-correo@dominio.com"
            required
            className="h-11 rounded-xl pl-9"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contrasena" className="text-sm font-medium">
          Contraseña
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="contrasena"
            name="contrasena"
            type={verPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Tu contraseña"
            required
            className="h-11 rounded-xl pr-10 pl-9"
          />
          <button
            type="button"
            onClick={() => setVerPassword((v) => !v)}
            aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            {verPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {estado.message ? (
        <p
          role="status"
          aria-live="polite"
          className={`rounded-lg px-3 py-2 text-sm ${
            estado.ok
              ? "bg-emerald-50 text-emerald-700"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {estado.message}
        </p>
      ) : null}

      <BotonEntrar />
    </form>
  );
}
