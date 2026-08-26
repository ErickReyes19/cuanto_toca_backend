import { randomInt } from "node:crypto";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { enviarCorreo, resendEstaConfigurado } from "@/lib/resend";
import {
  generarCodigoAccesoEmailHtml,
  generarCodigoAccesoEmailTexto,
} from "@/lib/templates/codigoAcceso";

/** Minutos de vigencia del código. */
export const VIGENCIA_MINUTOS = 10;
/** Intentos fallidos antes de invalidar el código y obligar a pedir otro. */
const MAX_INTENTOS = 5;
/** Segundos mínimos entre un envío y el siguiente, para no dejar abierto un canal de spam. */
const ESPERA_REENVIO_SEGUNDOS = 60;

/**
 * ¿Está activo el segundo paso por correo?
 *
 * Es una llave de apagado a propósito: si Resend se cae o el dominio deja de
 * verificar, `LOGIN_CODIGO_HABILITADO=false` devuelve el login directo en vez
 * de dejar a todo el mundo fuera de su cuenta.
 */
export function codigoDeAccesoActivo() {
  if (process.env.LOGIN_CODIGO_HABILITADO?.trim().toLowerCase() === "false") return false;
  return resendEstaConfigurado();
}

/** 6 dígitos con `randomInt`, que reparte uniforme (un `% 1000000` sesga). */
function generarCodigo() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** `ana.perez@dominio.com` -> `an•••••@dominio.com`, para confirmar a dónde fue sin exponerlo. */
export function enmascararCorreo(email: string) {
  const [local, dominio] = email.split("@");
  if (!dominio) return "tu correo";

  const visible = local.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(3, local.length - 2))}@${dominio}`;
}

export type ResultadoEmision =
  | { ok: true; enmascarado: string }
  | { ok: false; error: string; esperaSegundos?: number };

/**
 * Genera un código, lo guarda hasheado y lo manda por correo.
 * Invalida los códigos anteriores del usuario: solo el último sirve.
 */
export async function emitirCodigoAcceso(usuario: {
  id: string;
  email: string;
  nombre: string | null;
}): Promise<ResultadoEmision> {
  const ultimo = await prisma.codigoAcceso.findFirst({
    where: { usuarioId: usuario.id, usadoEn: null },
    orderBy: { createAt: "desc" },
    select: { createAt: true },
  });

  if (ultimo) {
    const transcurridos = (Date.now() - ultimo.createAt.getTime()) / 1000;
    if (transcurridos < ESPERA_REENVIO_SEGUNDOS) {
      return {
        ok: false,
        error: "Ya te mandamos un código hace un momento. Revisa tu correo.",
        esperaSegundos: Math.ceil(ESPERA_REENVIO_SEGUNDOS - transcurridos),
      };
    }
  }

  const codigo = generarCodigo();

  // Se envía primero y se guarda después: si el correo falla, no dejamos un
  // código huérfano que invalide el anterior sin que a nadie le llegue nada.
  try {
    await enviarCorreo({
      to: usuario.email,
      subject: `${codigo} es tu código para entrar a Cuánto Toca`,
      html: generarCodigoAccesoEmailHtml(usuario.nombre ?? "", codigo, VIGENCIA_MINUTOS),
      text: generarCodigoAccesoEmailTexto(codigo, VIGENCIA_MINUTOS),
    });
  } catch (error) {
    console.error("No se pudo enviar el código de acceso:", error);
    return { ok: false, error: "No pudimos enviarte el código. Intenta de nuevo en un momento." };
  }

  await prisma.$transaction([
    // Quema los pendientes anteriores para que no queden varios vivos a la vez.
    prisma.codigoAcceso.updateMany({
      where: { usuarioId: usuario.id, usadoEn: null },
      data: { usadoEn: new Date() },
    }),
    prisma.codigoAcceso.create({
      data: {
        usuarioId: usuario.id,
        codigoHash: await bcrypt.hash(codigo, 10),
        expiraEn: new Date(Date.now() + VIGENCIA_MINUTOS * 60_000),
      },
    }),
  ]);

  return { ok: true, enmascarado: enmascararCorreo(usuario.email) };
}

export type ResultadoVerificacion = { ok: true } | { ok: false; error: string };

/**
 * Valida el código contra el último emitido para ese usuario.
 * Cuenta los intentos y lo quema al quinto fallo.
 */
export async function verificarCodigoAcceso(
  usuarioId: string,
  codigo: string
): Promise<ResultadoVerificacion> {
  const limpio = codigo.replace(/\D/g, "");
  if (limpio.length !== 6) return { ok: false, error: "El código son 6 dígitos." };

  const registro = await prisma.codigoAcceso.findFirst({
    where: { usuarioId, usadoEn: null },
    orderBy: { createAt: "desc" },
  });

  if (!registro) {
    return { ok: false, error: "No hay ningún código pendiente. Pide uno nuevo." };
  }

  if (registro.expiraEn.getTime() < Date.now()) {
    await prisma.codigoAcceso.update({
      where: { id: registro.id },
      data: { usadoEn: new Date() },
    });
    return { ok: false, error: "El código caducó. Pide uno nuevo." };
  }

  if (registro.intentos >= MAX_INTENTOS) {
    await prisma.codigoAcceso.update({
      where: { id: registro.id },
      data: { usadoEn: new Date() },
    });
    return { ok: false, error: "Demasiados intentos. Pide un código nuevo." };
  }

  if (!(await bcrypt.compare(limpio, registro.codigoHash))) {
    const actualizado = await prisma.codigoAcceso.update({
      where: { id: registro.id },
      data: { intentos: { increment: 1 } },
      select: { intentos: true },
    });

    const restantes = MAX_INTENTOS - actualizado.intentos;
    return {
      ok: false,
      error:
        restantes > 0
          ? `Código incorrecto. Te ${restantes === 1 ? "queda 1 intento" : `quedan ${restantes} intentos`}.`
          : "Demasiados intentos. Pide un código nuevo.",
    };
  }

  await prisma.codigoAcceso.update({
    where: { id: registro.id },
    data: { usadoEn: new Date() },
  });

  return { ok: true };
}
