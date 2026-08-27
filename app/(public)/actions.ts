// app/actions/auth.ts

"use server";

import {
  cancelarCodigoDeAcceso,
  cancelarRegistro,
  confirmarCodigoDeAcceso,
  confirmarRegistroConCodigo,
  iniciarRegistroConCodigo,
  iniciarSesionConCodigo,
  reenviarCodigoDeAcceso,
  reenviarCodigoRegistro,
} from "@/auth";
import { prisma } from "@/lib/prisma";
import { EmailService, MailPayload } from "@/lib/sendEmail";
import { generateUserCreatedEmailHtml } from "@/lib/templates/createUserEmail";
import { randomBytes, randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { requestPasswordReset } from "./forgot-password/actions";
import { getDiccionario } from "@/lib/i18n/servidor";
import { LoginActionState } from "./state";

export async function forgotPasswordAction(formData: FormData) {
    const username = formData.get("username");
    if (typeof username !== "string" || !username.trim() || username.length < 3) {
        // Si el usuario está vacío, redirigimos de vuelta a login con un flag de error
        return false;
    }

    // Llamamos a la lógica que genera el token y envía el email
    await requestPasswordReset(username.trim());

    // Redirigimos al login con un mensaje de “correo enviado”
    return true
}

/** Rol que se asigna a quien se registra desde la app pública. */
const ROL_POR_DEFECTO = "USUARIO";

function buildUsernameFromEmail(email: string) {
    const localPart = email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9._-]/g, "") || "usuario";
    return localPart.slice(0, 40);
}

export async function registerWithEmailAction(formData: FormData) {
    const email = formData.get("email");
    const nombre = formData.get("nombre");
    const apellido = formData.get("apellido");

    if (typeof email !== "string" || !email.trim()) return false;
    if (typeof nombre !== "string" || !nombre.trim()) return false;
    if (typeof apellido !== "string" || !apellido.trim()) return false;

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) return false;

    const existingUser = await prisma.usuarios.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) return true;

    const rolPorDefecto = await prisma.rol.findUnique({ where: { nombre: ROL_POR_DEFECTO } });
    if (!rolPorDefecto) {
        console.error(`Falta el rol ${ROL_POR_DEFECTO}. Corre: npx prisma db seed`);
        return false;
    }

    let username = buildUsernameFromEmail(normalizedEmail);
    let suffix = 1;

    while (await prisma.usuarios.findFirst({ where: { usuario: username } })) {
        username = `${buildUsernameFromEmail(normalizedEmail)}${suffix}`.slice(0, 50);
        suffix += 1;
    }

    const tempPassword = randomBytes(9).toString("base64").slice(0, 12);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await prisma.usuarios.create({
        data: {
            id: randomUUID(),
            usuario: username,
            email: normalizedEmail,
            rol_id: rolPorDefecto.id,
            nombre: `${nombre.trim()} ${apellido.trim()}`.trim(),
            contrasena: hashedPassword,
            activo: true,
            DebeCambiarPassword: true,
        },
    });

    const html = generateUserCreatedEmailHtml(username, username, tempPassword);
    const mailPayload: MailPayload = {
        to: normalizedEmail,
        subject: "Tu cuenta fue creada: contraseña temporal",
        html,
    };

    try {
        const emailService = new EmailService();
        await emailService.sendMail(mailPayload);
        return true;
    } catch (err) {
        console.error("Error enviando correo de registro:", err);
        return false;
    }
}



export async function loginWithCredentialsAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const identifier = formData.get("identifier");
  const contrasena = formData.get("contrasena");

  const t = await getDiccionario();

  if (typeof identifier !== "string" || typeof contrasena !== "string") {
    return { ok: false, message: t.acciones.faltanCredenciales };
  }

  const normalizedIdentifier = identifier.trim().toLowerCase();
  if (!normalizedIdentifier || !contrasena.trim()) {
    return { ok: false, message: t.acciones.faltanCredenciales };
  }

  let usuario = normalizedIdentifier;

  if (normalizedIdentifier.includes("@")) {
    const userByEmail = await prisma.usuarios.findUnique({
      where: { email: normalizedIdentifier },
      select: { usuario: true },
    });

    if (!userByEmail) {
      return { ok: false, message: t.acciones.credencialesInvalidas };
    }

    usuario = userByEmail.usuario;
  }

  const result = await iniciarSesionConCodigo({ usuario, contrasena }, "/grupos");

  if ("error" in result && result.error) {
    // El mensaje del segundo paso (correo no enviado, etc.) sí se muestra tal
    // cual; el de credenciales se generaliza para no delatar qué usuario existe.
    // Se compara contra el diccionario y no contra un trozo de texto, para que
    // la comparación siga valiendo en inglés.
    const esCredencial = result.error === t.errores.credenciales;
    return {
      ok: false,
      message: esCredencial ? t.acciones.credencialesInvalidas : result.error,
    };
  }

  if ("requiereCodigo" in result && result.requiereCodigo) {
    return {
      ok: false,
      requiereCodigo: true,
      correoEnmascarado: result.enmascarado,
      message: t.login.codigoEnviado(result.enmascarado),
    };
  }

  return {
    ok: true,
    message: t.acciones.sesionIniciada,
    redirect: ("redirect" in result && result.redirect) || "/grupos",
    // `tareasHoy` queda pendiente: aun no existe un modelo de tareas en Prisma.
  };
}

/** Paso 2 del login: valida el código que llegó por correo. */
export async function verificarCodigoAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const codigo = formData.get("codigo");
  const t = await getDiccionario();

  if (typeof codigo !== "string" || !codigo.trim()) {
    return { ok: false, requiereCodigo: true, message: t.acciones.escribeCodigo };
  }

  const result = await confirmarCodigoDeAcceso(codigo, "/grupos");

  if ("error" in result && result.error) {
    return { ok: false, requiereCodigo: true, message: result.error };
  }

  return {
    ok: true,
    message: t.acciones.sesionIniciada,
    redirect: ("redirect" in result && result.redirect) || "/grupos",
  };
}

/** Reenvía el código al mismo usuario de la solicitud en curso. */
export async function reenviarCodigoAction(
  _prevState: LoginActionState,
  _formData: FormData,
): Promise<LoginActionState> {
  const result = await reenviarCodigoDeAcceso();
  const t = await getDiccionario();

  if ("error" in result && result.error) {
    return { ok: false, requiereCodigo: true, message: result.error };
  }

  return {
    ok: false,
    requiereCodigo: true,
    correoEnmascarado: "enmascarado" in result ? result.enmascarado : undefined,
    message: t.acciones.codigoNuevo,
  };
}

/** Sale del paso 2 para volver a la pantalla de contraseña. */
export async function cancelarCodigoAction() {
  await cancelarCodigoDeAcceso();
}

/**
 * Alta de cuenta con contraseña elegida por la persona.
 * A diferencia de `registerWithEmailAction`, no depende de SMTP: sirve para
 * que el registro funcione aunque el correo no esté configurado todavía.
 */
export async function registrarUsuario(
    _prevState: LoginActionState,
    formData: FormData,
): Promise<LoginActionState> {
    const nombre = formData.get("nombre");
    const email = formData.get("email");
    const contrasena = formData.get("contrasena");

    const t = await getDiccionario();

    if (typeof nombre !== "string" || typeof email !== "string" || typeof contrasena !== "string") {
        return { ok: false, message: t.acciones.completaCampos };
    }

    const nombreLimpio = nombre.trim();
    const correo = email.trim().toLowerCase();

    if (nombreLimpio.length < 2) return { ok: false, message: t.acciones.escribeNombre };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return { ok: false, message: t.acciones.correoInvalido };
    if (contrasena.length < 8) return { ok: false, message: t.acciones.contrasenaCorta };

    const resultado = await iniciarRegistroConCodigo(
        { nombre: nombreLimpio, email: correo, contrasena },
        "/grupos",
    );

    if ("error" in resultado && resultado.error) {
        return { ok: false, message: resultado.error };
    }

    if ("requiereCodigo" in resultado && resultado.requiereCodigo) {
        return {
            ok: false,
            requiereCodigo: true,
            correoEnmascarado: resultado.enmascarado,
            message: t.registro.codigoEnviado(resultado.enmascarado),
        };
    }

    return {
        ok: true,
        message: t.acciones.listo,
        redirect: ("redirect" in resultado && resultado.redirect) || "/grupos",
    };
}

/** Paso 2 del registro: con el código correcto se crea la cuenta. */
export async function verificarCodigoRegistroAction(
    _prevState: LoginActionState,
    formData: FormData,
): Promise<LoginActionState> {
    const codigo = formData.get("codigo");
    const t = await getDiccionario();

    if (typeof codigo !== "string" || !codigo.trim()) {
        return { ok: false, requiereCodigo: true, message: t.acciones.escribeCodigo };
    }

    const resultado = await confirmarRegistroConCodigo(codigo, "/grupos");

    if ("error" in resultado && resultado.error) {
        return { ok: false, requiereCodigo: true, message: resultado.error };
    }

    return {
        ok: true,
        message: t.acciones.listo,
        redirect: ("redirect" in resultado && resultado.redirect) || "/grupos",
    };
}

/** Reenvía el código del registro en curso. */
export async function reenviarCodigoRegistroAction(
    _prevState: LoginActionState,
    _formData: FormData,
): Promise<LoginActionState> {
    const resultado = await reenviarCodigoRegistro();
    const t = await getDiccionario();

    if ("error" in resultado && resultado.error) {
        return { ok: false, requiereCodigo: true, message: resultado.error };
    }

    return {
        ok: false,
        requiereCodigo: true,
        correoEnmascarado: "enmascarado" in resultado ? resultado.enmascarado : undefined,
        message: t.acciones.codigoNuevo,
    };
}

/** Descarta el registro a medias para volver al formulario. */
export async function cancelarRegistroAction() {
    await cancelarRegistro();
}
