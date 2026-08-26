"use client";

import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, MailCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { saveLoginTasksToast } from "@/components/login-tasks-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  cancelarCodigoAction,
  loginWithCredentialsAction,
  reenviarCodigoAction,
  verificarCodigoAction,
} from "../actions";
import { initialLoginState } from "../state";

function BotonEnvio({ etiqueta, cargando }: { etiqueta: string; cargando: string }) {
  const { pending } = useFormStatus();

  return (
    <Button className="h-11 w-full rounded-xl text-sm font-semibold" type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" /> {cargando}
        </>
      ) : (
        etiqueta
      )}
    </Button>
  );
}

function Aviso({ mensaje, tono }: { mensaje: string; tono: "error" | "info" }) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={`rounded-lg px-3 py-2 text-sm ${
        tono === "info" ? "bg-emerald-50 text-emerald-700" : "bg-destructive/10 text-destructive"
      }`}
    >
      {mensaje}
    </p>
  );
}

export default function Login() {
  const router = useRouter();
  const [verPassword, setVerPassword] = useState(false);

  const [estadoLogin, accionLogin] = useActionState(loginWithCredentialsAction, initialLoginState);
  const [estadoCodigo, accionCodigo] = useActionState(verificarCodigoAction, initialLoginState);
  const [estadoReenvio, accionReenvio] = useActionState(reenviarCodigoAction, initialLoginState);

  const enPasoCodigo = estadoLogin.requiereCodigo === true && !estadoCodigo.ok;
  const campoCodigo = useRef<HTMLInputElement>(null);

  // El estado más reciente manda: el del paso 2 pisa al del paso 1.
  const estadoVisible = estadoCodigo.message
    ? estadoCodigo
    : estadoReenvio.message
      ? estadoReenvio
      : estadoLogin;

  const correo = estadoReenvio.correoEnmascarado ?? estadoLogin.correoEnmascarado;

  useEffect(() => {
    const destino = estadoCodigo.ok ? estadoCodigo : estadoLogin.ok ? estadoLogin : null;
    if (!destino?.redirect) return;

    if ((destino.tareasHoy ?? 0) > 0) saveLoginTasksToast(destino.tareasHoy ?? 0);
    router.push(destino.redirect);
  }, [estadoCodigo, estadoLogin, router]);

  // Al entrar al paso 2 el foco va directo al campo del código.
  useEffect(() => {
    if (enPasoCodigo) campoCodigo.current?.focus();
  }, [enPasoCodigo]);

  if (enPasoCodigo) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border bg-muted/40 p-3">
          <MailCheck className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 text-sm">
            <p className="font-medium">Revisa tu correo</p>
            <p className="text-muted-foreground text-pretty">
              Mandamos un código de 6 dígitos{correo ? ` a ${correo}` : ""}. Caduca en 10 minutos.
            </p>
          </div>
        </div>

        <form action={accionCodigo} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="codigo" className="text-sm font-medium">
              Código de verificación
            </label>
            <Input
              ref={campoCodigo}
              id="codigo"
              name="codigo"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              required
              className="h-14 rounded-xl text-center font-mono text-2xl tracking-[0.5em]"
            />
          </div>

          {estadoVisible.message ? (
            <Aviso
              mensaje={estadoVisible.message}
              tono={estadoVisible === estadoReenvio ? "info" : "error"}
            />
          ) : null}

          <BotonEnvio etiqueta="Entrar" cargando="Verificando..." />
        </form>

        <div className="flex items-center justify-between gap-2 text-sm">
          <form action={cancelarCodigoAction}>
            <button
              type="submit"
              onClick={() => router.refresh()}
              className="inline-flex items-center gap-1 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              <ArrowLeft className="size-3.5" /> Usar otra cuenta
            </button>
          </form>

          <form action={accionReenvio}>
            <button
              type="submit"
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Reenviar código
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <form action={accionLogin} className="space-y-4">
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

      {estadoLogin.message ? (
        <Aviso mensaje={estadoLogin.message} tono={estadoLogin.ok ? "info" : "error"} />
      ) : null}

      <BotonEnvio etiqueta="Entrar" cargando="Entrando..." />
    </form>
  );
}
