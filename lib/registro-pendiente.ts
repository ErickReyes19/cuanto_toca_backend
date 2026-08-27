import bcrypt from "bcryptjs";

import {
  ESPERA_REENVIO_SEGUNDOS,
  MAX_INTENTOS,
  VIGENCIA_MINUTOS,
  enmascararCorreo,
  enviarCodigoPorCorreo,
  generarCodigo,
} from "@/lib/codigo-acceso";
import { prisma } from "@/lib/prisma";
import { getDiccionario } from "@/lib/i18n/servidor";

/**
 * Registro en dos pasos.
 *
 * La cuenta NO se crea hasta que la persona demuestra que controla el correo:
 * los datos viven en `RegistroPendiente` hasta entonces. Así una dirección
 * inventada nunca llega a ocupar una fila en `Usuarios`, que es justamente lo
 * que hace que una app se llene de cuentas basura.
 */

export type ResultadoRegistro =
  | { ok: true; enmascarado: string }
  | { ok: false; error: string };

/**
 * Guarda el registro a la espera del código y lo manda por correo.
 * Si ya había uno pendiente para ese correo, lo reemplaza.
 */
export async function emitirRegistroPendiente(datos: {
  nombre: string;
  email: string;
  /** Ya hasheada. Recibirla así evita que un reenvío la sobrescriba por error. */
  contrasenaHash: string;
}): Promise<ResultadoRegistro> {
  const pendiente = await prisma.registroPendiente.findUnique({
    where: { email: datos.email },
    select: { updateAt: true },
  });

  if (pendiente) {
    const transcurridos = (Date.now() - pendiente.updateAt.getTime()) / 1000;
    if (transcurridos < ESPERA_REENVIO_SEGUNDOS) {
      console.warn(
        `[registro] no se envió código: ya se mandó uno hace ${Math.round(transcurridos)}s.`
      );
      return { ok: false, error: (await getDiccionario()).errores.codigoReciente };
    }
  }

  const codigo = generarCodigo();

  // Primero el correo: si falla, no dejamos un registro a medias sin avisar.
  try {
    await enviarCodigoPorCorreo(datos.email, datos.nombre, codigo);
  } catch (error) {
    console.error("[registro] no se pudo enviar el código:", error);
    return { ok: false, error: (await getDiccionario()).errores.codigoNoEnviado };
  }

  const valores = {
    nombre: datos.nombre,
    contrasenaHash: datos.contrasenaHash,
    codigoHash: await bcrypt.hash(codigo, 10),
    expiraEn: new Date(Date.now() + VIGENCIA_MINUTOS * 60_000),
    intentos: 0,
  };

  await prisma.registroPendiente.upsert({
    where: { email: datos.email },
    update: valores,
    create: { email: datos.email, ...valores },
  });

  console.info(`[registro] código enviado a ${enmascararCorreo(datos.email)}`);
  return { ok: true, enmascarado: enmascararCorreo(datos.email) };
}

export type ResultadoConfirmacion =
  | { ok: true; nombre: string; email: string; contrasenaHash: string }
  | { ok: false; error: string };

/**
 * Valida el código del registro. Devuelve los datos ya listos para crear la
 * cuenta y borra el pendiente: el código sirve una sola vez.
 */
export async function confirmarRegistroPendiente(
  email: string,
  codigo: string
): Promise<ResultadoConfirmacion> {
  const limpio = codigo.replace(/\D/g, "");
  if (limpio.length !== 6) return { ok: false, error: (await getDiccionario()).errores.codigoSeisDigitos };

  const registro = await prisma.registroPendiente.findUnique({ where: { email } });
  if (!registro) {
    return { ok: false, error: (await getDiccionario()).errores.registroSinPendiente };
  }

  if (registro.expiraEn.getTime() < Date.now()) {
    await prisma.registroPendiente.delete({ where: { id: registro.id } });
    return { ok: false, error: (await getDiccionario()).errores.registroCodigoCaducado };
  }

  if (registro.intentos >= MAX_INTENTOS) {
    await prisma.registroPendiente.delete({ where: { id: registro.id } });
    return { ok: false, error: (await getDiccionario()).errores.registroDemasiadosIntentos };
  }

  if (!(await bcrypt.compare(limpio, registro.codigoHash))) {
    const actualizado = await prisma.registroPendiente.update({
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
          : t.errores.registroDemasiadosIntentos,
    };
  }

  await prisma.registroPendiente.delete({ where: { id: registro.id } });

  return {
    ok: true,
    nombre: registro.nombre,
    email: registro.email,
    contrasenaHash: registro.contrasenaHash,
  };
}

/** Descarta el registro a medias (botón "usar otro correo"). */
export async function descartarRegistroPendiente(email: string) {
  await prisma.registroPendiente.deleteMany({ where: { email } });
}
