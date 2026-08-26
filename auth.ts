/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies, headers } from "next/headers";
import { prisma } from './lib/prisma';
import type { Prisma } from "./lib/generated/prisma/client";

import {
  TSchemaResetPassword,
  schemaResetPassword,
} from "@/app/(public)/reset-password/schema";

import { schemaSignIn, TSchemaSignIn } from "@/lib/shemas";
import { verificarIdTokenGoogle } from "@/lib/google";

// ------------------------------
// JWT CONFIG
// ------------------------------
const key = new TextEncoder().encode(process.env.AUTH_SECRET!);

export interface UsuarioSesion extends JWTPayload {
  IdUser: string;
  User: string;
  Nombre?: string | null;
  FotoUrl?: string | null;
  Rol: string;
  IdRol: string;
  Permiso: string[];
  DebeCambiar: boolean;
}

function toBooleanFlag(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "bigint") return value === BigInt(1);
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "si";
  }
  if (Buffer.isBuffer(value)) return value[0] === 1;

  return false;
}

// ------------------------------
// JWT
// ------------------------------
export async function encrypt(payload: UsuarioSesion) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("6h")
    .sign(key);
}

export const decrypt = async (
  token: string
): Promise<UsuarioSesion | null> => {
  try {
    const { payload } = await jwtVerify<JWTPayload>(token, key, {
      algorithms: ["HS256"],
    });

    return {
      IdUser: payload.IdUser as string,
      User: payload.User as string,
      Rol: payload.Rol as string,
      Nombre: payload.Nombre as string | null,
      FotoUrl: payload.FotoUrl as string | null,
      IdRol: payload.IdRol as string,
      Permiso: (payload.Permiso as string[]) || [],
      DebeCambiar: toBooleanFlag(payload.DebeCambiar),
      iss: payload.iss as string,
      aud: payload.aud as string,
    };
  } catch (err: any) {
    console.error(
      "JWT error:",
      err.name === "JWTExpired" ? "Token expirado" : err
    );
    return null;
  }
};

// ------------------------------
// COOKIE HELPERS
// ------------------------------
const setSessionCookie = async (token: string) => {
  const cookieStore = await cookies();

  cookieStore.set("session", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    // secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + 6 * 60 * 60 * 1000),
  });
};

// ------------------------------
// SESSION
// ------------------------------
export const getSession = async (): Promise<UsuarioSesion | null> => {
  const headerStore = await headers();

  const isApiRequest = headerStore.get("x-api-request") === "1";

  const authHeader = headerStore.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (isApiRequest) {
    return bearerToken ? decrypt(bearerToken) : null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value || bearerToken;

  return token ? decrypt(token) : null;
};

// ------------------------------
export const getSessionPermisos = async () => {
  const session = await getSession();
  return session?.Permiso ?? null;
};

// ------------------------------
export const signOut = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await decrypt(token) : null;

  if (session?.IdUser) {
    await prisma.usuarios.update({
      where: { id: session.IdUser },
      data: { estaOnline: false, ultimaActividad: new Date() },
    }).catch((err) => console.error("signOut status error:", err));
  }

  cookieStore.delete("session");
};

// ------------------------------
// LOGIN
// ------------------------------
export const login = async (
  credentials: TSchemaSignIn,
  redirect: string
) => {
  const parsed = schemaSignIn.safeParse(credentials);

  if (!parsed.success) {
    return { error: "Usuario o contraseña inválidos" };
  }

  const { usuario, contrasena } = parsed.data;

  const authResult = await authenticateDB(usuario, contrasena);

  if (!authResult) {
    return { error: "Usuario o contraseña inválidos" };
  }

  await setSessionCookie(authResult.token);

  return {
    success: "Login OK",
    redirect: authResult.debeCambiar
        ? "/reset-password"
        : redirect
  };
};

// ------------------------------
// RESET PASSWORD
// ------------------------------
export const resetPassword = async (
  credentials: TSchemaResetPassword,
  username: string
) => {
  const parsed = schemaResetPassword.safeParse(credentials);

  if (!parsed.success) {
    return { error: "Error al cambiar la contraseña" };
  }

  const token = await changePassword(username, parsed.data.confirmar);

  if (!token) {
    return { error: "Error al cambiar la contraseña" };
  }

  await setSessionCookie(token);

  return { success: "Contraseña cambiada con éxito" };
};

// ------------------------------
// PRISMA QUERY CONFIG
// ------------------------------
const usuarioWithRolArgs = {
  include: {
    rol: {
      include: {
        permisos: { include: { permiso: true } },
      },
    },
  },
} satisfies Prisma.UsuariosDefaultArgs;

// ------------------------------
// DB AUTH
// ------------------------------
async function authenticateDB(username: string, password: string) {
  try {
    const user = await prisma.usuarios.findFirst({
      where: { usuario: username },
      include: usuarioWithRolArgs.include,
    });

    if (!user || !toBooleanFlag(user.activo)) return null;

    const valid = await bcrypt.compare(password, user.contrasena);

    if (!valid) return null;

    const permisos = user.rol.permisos.map(
      (rp) => rp.permiso.nombre
    );

    const now = new Date();

    await prisma.usuarios.update({
      where: { id: user.id },
      data: { ultimoInicioSesion: now, ultimaActividad: now, estaOnline: true },
    });

    const payload: UsuarioSesion = {
      IdUser: user.id,
      User: user.usuario,
      Rol: user.rol.nombre,
      Nombre: user.nombre,
      FotoUrl: user.fotoUrl,
      IdRol: user.rol_id,
      Permiso: permisos,
      DebeCambiar: toBooleanFlag(user.DebeCambiarPassword),
      iss: "your-issuer",
      aud: "your-audience",
    };

    return {
      token: await encrypt(payload),
      debeCambiar: payload.DebeCambiar,
    };
  } catch (err) {
    console.error("authenticateDB error:", err);
    return null;
  }
}

// ------------------------------
// CHANGE PASSWORD
// ------------------------------
async function changePassword(username: string, newPassword: string) {
  try {
    const user = await prisma.usuarios.findFirst({
      where: { usuario: username },
      include: usuarioWithRolArgs.include,
    });

    if (!user) return null;

    const hashed = await bcrypt.hash(newPassword, 10);

    const updated = await prisma.usuarios.update({
      where: { id: user.id },
      data: {
        contrasena: hashed,
        DebeCambiarPassword: false,
      },
      include: usuarioWithRolArgs.include,
    });

    const permisos = updated.rol.permisos.map(
      (rp) => rp.permiso.nombre
    );

    const payload: UsuarioSesion = {
      IdUser: updated.id,
      User: updated.usuario,
      Rol: updated.rol.nombre,
      Nombre: updated.nombre,
      FotoUrl: updated.fotoUrl,
      IdRol: updated.rol_id,
      Permiso: permisos,
      DebeCambiar: false,
      iss: "your-issuer",
      aud: "your-audience",
    };

    return encrypt(payload);
  } catch (err) {
    console.error("changePassword error:", err);
    return null;
  }
}
// ------------------------------
// LOGIN CON GOOGLE
// ------------------------------
/** Rol que recibe quien entra por primera vez con Google. */
const ROL_GOOGLE = "USUARIO";

/** Deriva un usuario legible del correo y lo desambigua si ya existe. */
async function usuarioDisponibleDesdeEmail(email: string) {
  const base =
    email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 40) || "usuario";

  let candidato = base;
  let sufijo = 1;

  while (await prisma.usuarios.findFirst({ where: { usuario: candidato }, select: { id: true } })) {
    candidato = `${base}${sufijo}`.slice(0, 50);
    sufijo += 1;
  }

  return candidato;
}

/**
 * Alta/entrada con la cuenta de Google.
 *
 * El `credential` es el ID token que devuelve Google Identity Services en el
 * navegador. Se verifica contra las llaves públicas de Google antes de tocar
 * la base: nunca confiamos en lo que manda el cliente.
 *
 * - Si el `sub` de Google ya está vinculado, entra directo.
 * - Si no, se vincula a la cuenta que tenga ese correo (solo si Google lo
 *   reporta verificado, para que nadie reclame un correo ajeno).
 * - Si tampoco existe, se crea la cuenta con el rol por defecto.
 */
export const loginConGoogle = async (credential: string, redirect: string) => {
  if (typeof credential !== "string" || !credential.trim()) {
    return { error: "No recibimos la credencial de Google." };
  }

  let perfil;
  try {
    perfil = await verificarIdTokenGoogle(credential);
  } catch (err) {
    console.error("Google ID token inválido:", err);
    return { error: "No pudimos validar tu cuenta de Google. Intenta de nuevo." };
  }

  if (!perfil.emailVerificado) {
    return { error: "Tu correo de Google no está verificado." };
  }

  try {
    let user = await prisma.usuarios.findUnique({
      where: { googleSub: perfil.sub },
      include: usuarioWithRolArgs.include,
    });

    if (!user) {
      const porCorreo = await prisma.usuarios.findUnique({ where: { email: perfil.email } });

      if (porCorreo) {
        // Cuenta creada antes con contraseña: se vincula a Google.
        user = await prisma.usuarios.update({
          where: { id: porCorreo.id },
          data: {
            googleSub: perfil.sub,
            nombre: porCorreo.nombre ?? perfil.nombre,
            fotoUrl: porCorreo.fotoUrl ?? perfil.fotoUrl,
          },
          include: usuarioWithRolArgs.include,
        });
      } else {
        const rol = await prisma.rol.findUnique({ where: { nombre: ROL_GOOGLE } });
        if (!rol) {
          console.error(`Falta el rol ${ROL_GOOGLE}. Corre: npx prisma db seed`);
          return { error: "El servidor no está configurado. Intenta más tarde." };
        }

        user = await prisma.usuarios.create({
          data: {
            id: randomUUID(),
            usuario: await usuarioDisponibleDesdeEmail(perfil.email),
            email: perfil.email,
            nombre: perfil.nombre,
            fotoUrl: perfil.fotoUrl,
            googleSub: perfil.sub,
            // Sin contraseña utilizable: se entra por Google o se usa "olvidé mi contraseña".
            contrasena: await bcrypt.hash(randomUUID(), 10),
            rol_id: rol.id,
            activo: true,
            DebeCambiarPassword: false,
          },
          include: usuarioWithRolArgs.include,
        });
      }
    }

    if (!toBooleanFlag(user.activo)) {
      return { error: "Tu cuenta está desactivada. Contacta a un administrador." };
    }

    const now = new Date();
    await prisma.usuarios.update({
      where: { id: user.id },
      data: { ultimoInicioSesion: now, ultimaActividad: now, estaOnline: true },
    });

    const payload: UsuarioSesion = {
      IdUser: user.id,
      User: user.usuario,
      Rol: user.rol.nombre,
      Nombre: user.nombre,
      FotoUrl: user.fotoUrl,
      IdRol: user.rol_id,
      Permiso: user.rol.permisos.map((rp) => rp.permiso.nombre),
      DebeCambiar: toBooleanFlag(user.DebeCambiarPassword),
      iss: "your-issuer",
      aud: "your-audience",
    };

    await setSessionCookie(await encrypt(payload));

    return {
      success: "Login OK",
      redirect: payload.DebeCambiar ? "/reset-password" : redirect,
    };
  } catch (err) {
    console.error("loginConGoogle error:", err);
    return { error: "No pudimos iniciar sesión con Google." };
  }
};
