// app/actions/auth.ts

"use server";

import { login } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EmailService, MailPayload } from "@/lib/sendEmail";
import { generateUserCreatedEmailHtml } from "@/lib/templates/createUserEmail";
import { randomBytes, randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { requestPasswordReset } from "./forgot-password/actions";
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

  if (typeof identifier !== "string" || typeof contrasena !== "string") {
    return { ok: false, message: "Debes ingresar usuario/correo y contraseña." };
  }

  const normalizedIdentifier = identifier.trim().toLowerCase();
  if (!normalizedIdentifier || !contrasena.trim()) {
    return { ok: false, message: "Debes ingresar usuario/correo y contraseña." };
  }

  let usuario = normalizedIdentifier;

  if (normalizedIdentifier.includes("@")) {
    const userByEmail = await prisma.usuarios.findUnique({
      where: { email: normalizedIdentifier },
      select: { usuario: true },
    });

    if (!userByEmail) {
      return { ok: false, message: "Usuario/correo o contraseña inválidos." };
    }

    usuario = userByEmail.usuario;
  }

  const result = await login({ usuario, contrasena }, "/grupos");

  if (result.error) {
    return { ok: false, message: "Usuario/correo o contraseña inválidos." };
  }

  return {
    ok: true,
    message: "Inicio de sesión exitoso.",
    redirect: result.redirect ?? "/grupos",
    // `tareasHoy` queda pendiente: aun no existe un modelo de tareas en Prisma.
  };
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

    if (typeof nombre !== "string" || typeof email !== "string" || typeof contrasena !== "string") {
        return { ok: false, message: "Completa todos los campos." };
    }

    const nombreLimpio = nombre.trim();
    const correo = email.trim().toLowerCase();

    if (nombreLimpio.length < 2) return { ok: false, message: "Escribe tu nombre." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return { ok: false, message: "El correo no es válido." };
    if (contrasena.length < 8) return { ok: false, message: "La contraseña debe tener al menos 8 caracteres." };

    const existente = await prisma.usuarios.findUnique({ where: { email: correo } });
    if (existente) return { ok: false, message: "Ese correo ya tiene una cuenta. Inicia sesión." };

    const rol = await prisma.rol.findUnique({ where: { nombre: ROL_POR_DEFECTO } });
    if (!rol) {
        console.error(`Falta el rol ${ROL_POR_DEFECTO}. Corre: npx prisma db seed`);
        return { ok: false, message: "El servidor no está configurado. Intenta más tarde." };
    }

    // El usuario se deriva del correo y se desambigua si ya existe.
    let usuario = buildUsernameFromEmail(correo);
    let sufijo = 1;
    while (await prisma.usuarios.findFirst({ where: { usuario } })) {
        usuario = `${buildUsernameFromEmail(correo)}${sufijo}`.slice(0, 50);
        sufijo += 1;
    }

    await prisma.usuarios.create({
        data: {
            id: randomUUID(),
            usuario,
            email: correo,
            nombre: nombreLimpio,
            contrasena: await bcrypt.hash(contrasena, 10),
            rol_id: rol.id,
            activo: true,
            DebeCambiarPassword: false,
        },
    });

    const resultado = await login({ usuario, contrasena }, "/grupos");
    if (resultado.error) {
        return { ok: false, message: "Cuenta creada, pero no se pudo iniciar sesión. Entra manualmente." };
    }

    return { ok: true, message: "¡Listo!", redirect: "/grupos" };
}
