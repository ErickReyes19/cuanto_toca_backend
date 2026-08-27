"use client";

import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, MailCheck, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDiccionario } from "@/lib/i18n/cliente";
import {
  cancelarRegistroAction,
  reenviarCodigoRegistroAction,
  registrarUsuario,
  verificarCodigoRegistroAction,
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

export function FormularioRegistro() {
  const t = useDiccionario();
  const router = useRouter();
  const [verPassword, setVerPassword] = useState(false);

  const [estadoAlta, accionAlta] = useActionState(registrarUsuario, initialLoginState);
  const [estadoCodigo, accionCodigo] = useActionState(verificarCodigoRegistroAction, initialLoginState);
  const [estadoReenvio, accionReenvio] = useActionState(reenviarCodigoRegistroAction, initialLoginState);

  const enPasoCodigo = estadoAlta.requiereCodigo === true && !estadoCodigo.ok;
  const campoCodigo = useRef<HTMLInputElement>(null);

  const estadoVisible = estadoCodigo.message
    ? estadoCodigo
    : estadoReenvio.message
      ? estadoReenvio
      : estadoAlta;

  const correo = estadoReenvio.correoEnmascarado ?? estadoAlta.correoEnmascarado;

  useEffect(() => {
    const destino = estadoCodigo.ok ? estadoCodigo : estadoAlta.ok ? estadoAlta : null;
    if (destino?.redirect) router.push(destino.redirect);
  }, [estadoCodigo, estadoAlta, router]);

  useEffect(() => {
    if (enPasoCodigo) campoCodigo.current?.focus();
  }, [enPasoCodigo]);

  if (enPasoCodigo) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border bg-muted/40 p-3">
          <MailCheck className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 text-sm">
            <p className="font-medium">{t.registro.confirmaCorreo}</p>
            <p className="text-muted-foreground text-pretty">
              {t.registro.codigoEnviado(correo ?? null)}
            </p>
          </div>
        </div>

        <form action={accionCodigo} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="codigo-registro" className="text-sm font-medium">
              {t.login.codigoVerificacion}
            </label>
            <Input
              ref={campoCodigo}
              id="codigo-registro"
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

          <BotonEnvio etiqueta={t.registro.crearMiCuenta} cargando={t.login.verificando} />
        </form>

        <div className="flex items-center justify-between gap-2 text-sm">
          <form action={cancelarRegistroAction}>
            <button
              type="submit"
              onClick={() => router.refresh()}
              className="inline-flex items-center gap-1 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              <ArrowLeft className="size-3.5" /> {t.registro.usarOtroCorreo}
            </button>
          </form>

          <form action={accionReenvio}>
            <button
              type="submit"
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {t.login.reenviarCodigo}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <form action={accionAlta} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="nombre" className="text-sm font-medium">
          {t.registro.tuNombre}
        </label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="nombre"
            name="nombre"
            autoComplete="name"
            placeholder={t.registro.nombrePlaceholder}
            required
            maxLength={100}
            className="h-11 rounded-xl pl-9"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          {t.registro.correo}
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t.registro.correoPlaceholder}
            required
            className="h-11 rounded-xl pl-9"
          />
        </div>
        <p className="text-xs text-muted-foreground">{t.registro.correoAyuda}</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contrasena" className="text-sm font-medium">
          {t.registro.contrasena}
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="contrasena"
            name="contrasena"
            type={verPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            placeholder={t.registro.contrasenaPlaceholder}
            className="h-11 rounded-xl pr-10 pl-9"
          />
          <button
            type="button"
            onClick={() => setVerPassword((v) => !v)}
            aria-label={verPassword ? t.login.ocultarContrasena : t.login.mostrarContrasena}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            {verPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {estadoAlta.message && !estadoAlta.ok ? (
        <Aviso mensaje={estadoAlta.message} tono="error" />
      ) : null}

      <BotonEnvio
        etiqueta={t.registro.crearCuentaGratis}
        cargando={t.registro.enviandoCodigo}
      />
    </form>
  );
}
