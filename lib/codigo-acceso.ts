import { randomInt } from "node:crypto";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { enviarCorreo, resendEstaConfigurado } from "@/lib/resend";
import {
  generarCodigoAccesoEmailHtml,
  generarCodigoAccesoEmailTexto,
} from "@/lib/templates/codigoAcceso";
import { getDiccionario } from "@/lib/i18n/servidor";

/** Minutos de vigencia del código. */
export const VIGENCIA_MINUTOS = 10;
/** Intentos fallidos antes de invalidar el código y obligar a pedir otro. */
export const MAX_INTENTOS = 5;
/** Segundos mínimos entre un envío y el siguiente, para no dejar abierto un canal de spam. */
export const ESPERA_REENVIO_SEGUNDOS = 60;

/** Para no repetir el mismo aviso en cada login del mismo proceso. */
let yaAvisamosDeLaConfig = false;

/**
 * ¿Está activo el segundo paso por correo?
 *
 * Es una llave de apagado a propósito: si Resend se cae o el dominio deja de
 * verificar, `LOGIN_CODIGO_HABILITADO=false` devuelve el login directo en vez
 * de dejar a todo el mundo fuera de su cuenta.
 *
 * Pero degradar en silencio es peor que fallar: si falta configuración, lo
 * decimos en los logs con el nombre exacto de la variable. Un typo en el
 * nombre de la variable se ve igual que "apagado a propósito", y así no.
 */
export function codigoDeAccesoActivo() {
  if (process.env.LOGIN_CODIGO_HABILITADO?.trim().toLowerCase() === "false") {
    if (!yaAvisamosDeLaConfig) {
      yaAvisamosDeLaConfig = true;
      console.warn(
        "[login] Código por correo APAGADO por LOGIN_CODIGO_HABILITADO=false. " +
          "Quita esa variable (o ponla en true) para que vuelva a pedir código."
      );
    }
    return false;
  }

  if (resendEstaConfigurado()) return true;

  if (!yaAvisamosDeLaConfig) {
    yaAvisamosDeLaConfig = true;

    const faltantes = [
      !process.env.RESEND_API_KEY?.trim() && "RESEND_API_KEY",
      !process.env.RESEND_FROM?.trim() && "RESEND_FROM",
    ].filter(Boolean);

    console.warn(
      `[login] Código por correo DESACTIVADO: falta ${faltantes.join(" y ")}. ` +
        "Se está entrando solo con contraseña. Revisa el nombre exacto de la " +
        "variable en tu proveedor de hosting."
    );
  }

  return false;
}

/** 6 dígitos con `randomInt`, que reparte uniforme (un `% 1000000` sesga). */
export function generarCodigo() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** Manda el código. Lo comparten el login y el registro. */
export async function enviarCodigoPorCorreo(
  email: string,
  nombre: string | null,
  codigo: string
) {
  await enviarCorreo({
    to: email,
    subject: `${codigo} es tu código para entrar a Cuánto Toca`,
    html: generarCodigoAccesoEmailHtml(nombre ?? "", codigo, VIGENCIA_MINUTOS),
    text: generarCodigoAccesoEmailTexto(codigo, VIGENCIA_MINUTOS),
  });
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
      console.warn(
        `[login] no se envió código: ya se mandó uno hace ${Math.round(transcurridos)}s ` +
          `(espera mínima ${ESPERA_REENVIO_SEGUNDOS}s).`
      );
      return {
        ok: false,
        error: (await getDiccionario()).errores.codigoReciente,
        esperaSegundos: Math.ceil(ESPERA_REENVIO_SEGUNDOS - transcurridos),
      };
    }
  }

  const codigo = generarCodigo();

  // Se envía primero y se guarda después: si el correo falla, no dejamos un
  // código huérfano que invalide el anterior sin que a nadie le llegue nada.
  try {
    await enviarCodigoPorCorreo(usuario.email, usuario.nombre, codigo);
  } catch (error) {
    console.error("No se pudo enviar el código de acceso:", error);
    return { ok: false, error: (await getDiccionario()).errores.codigoNoEnviado };
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

  console.info(`[login] código enviado a ${enmascararCorreo(usuario.email)}`);
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
  if (limpio.length !== 6) return { ok: false, error: (await getDiccionario()).errores.codigoSeisDigitos };

  const registro = await prisma.codigoAcceso.findFirst({
    where: { usuarioId, usadoEn: null },
    orderBy: { createAt: "desc" },
  });

  if (!registro) {
    return { ok: false, error: (await getDiccionario()).errores.codigoSinPendiente };
  }

  if (registro.expiraEn.getTime() < Date.now()) {
    await prisma.codigoAcceso.update({
      where: { id: registro.id },
      data: { usadoEn: new Date() },
    });
    return { ok: false, error: (await getDiccionario()).errores.codigoCaducado };
  }

  if (registro.intentos >= MAX_INTENTOS) {
    await prisma.codigoAcceso.update({
      where: { id: registro.id },
      data: { usadoEn: new Date() },
    });
    return { ok: false, error: (await getDiccionario()).errores.codigoDemasiadosIntentos };
  }

  if (!(await bcrypt.compare(limpio, registro.codigoHash))) {
    const actualizado = await prisma.codigoAcceso.update({
      where: { id: registro.id },
      data: { intentos: { increment: 1 } },
      select: { intentos: true },
    });

    const restantes = MAX_INTENTOS - actualizado.intentos;
    const t = await getDiccionario();
    return {
      ok: false,
      error:
        restantes > 0
          ? t.errores.codigoIncorrecto(restantes)
          : t.errores.codigoDemasiadosIntentos,
    };
  }

  await prisma.codigoAcceso.update({
    where: { id: registro.id },
    data: { usadoEn: new Date() },
  });

  return { ok: true };
}
