"use server";

import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies, headers } from "next/headers";
import { prisma } from './lib/prisma';
import type { Prisma } from "@prisma/client";

import {
  TSchemaResetPassword,
  schemaResetPassword,
} from "@/app/(public)/reset-password/schema";

import { schemaSignIn, TSchemaSignIn } from "@/lib/shemas";
import { verificarIdTokenGoogle } from "@/lib/google";
import {
  confirmarRegistroPendiente,
  descartarRegistroPendiente,
  emitirRegistroPendiente,
} from "@/lib/registro-pendiente";
import {
  VIGENCIA_MINUTOS,
  codigoDeAccesoActivo,
  emitirCodigoAcceso,
  verificarCodigoAcceso,
} from "@/lib/codigo-acceso";

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
  } catch (err) {
    // `jose` marca el token vencido con este `code`; el resto sí interesa verlo.
    const vencido = err instanceof Error && err.name === "JWTExpired";
    console.error("JWT error:", vencido ? "Token expirado" : err);
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
/** Rol que recibe toda cuenta nueva, venga de Google o del registro por correo. */
const ROL_POR_DEFECTO = "USUARIO";

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
        const rol = await prisma.rol.findUnique({ where: { nombre: ROL_POR_DEFECTO } });
        if (!rol) {
          console.error(`Falta el rol ${ROL_POR_DEFECTO}. Corre: npx prisma db seed`);
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

// ------------------------------
// LOGIN EN DOS PASOS (CÓDIGO POR CORREO)
// ------------------------------
const COOKIE_PENDIENTE = "login_pendiente";
const PROPOSITO_PENDIENTE = "codigo_acceso";

/**
 * Sesión a medias: la contraseña ya se validó, falta el código del correo.
 * Va firmada para que el navegador no pueda cambiar de qué usuario se trata.
 */
async function guardarPendiente(userId: string) {
  const token = await new SignJWT({ purpose: PROPOSITO_PENDIENTE })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${VIGENCIA_MINUTOS}m`)
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_PENDIENTE, token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: VIGENCIA_MINUTOS * 60,
  });
}

async function leerPendiente(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_PENDIENTE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    if (payload.purpose !== PROPOSITO_PENDIENTE || typeof payload.sub !== "string") return null;
    return payload.sub;
  } catch {
    return null;
  }
}

async function borrarPendiente() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_PENDIENTE);
}

/** Valida usuario + contraseña sin crear sesión. */
async function credencialesValidas(username: string, password: string) {
  const user = await prisma.usuarios.findFirst({
    where: { usuario: username },
    include: usuarioWithRolArgs.include,
  });

  if (!user || !toBooleanFlag(user.activo)) return null;
  if (!(await bcrypt.compare(password, user.contrasena))) return null;

  return user;
}

type UsuarioConRol = NonNullable<Awaited<ReturnType<typeof credencialesValidas>>>;

/** Emite la cookie de sesión definitiva. Es el único punto donde eso ocurre. */
async function abrirSesion(user: UsuarioConRol, redirect: string) {
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
  await borrarPendiente();

  return {
    success: "Login OK",
    redirect: payload.DebeCambiar ? "/reset-password" : redirect,
  };
}

/**
 * Paso 1: valida la contraseña y manda el código de 6 dígitos por correo.
 * Si el segundo paso está apagado, entra directo como antes.
 */
export const iniciarSesionConCodigo = async (
  credentials: TSchemaSignIn,
  redirect: string
) => {
  const parsed = schemaSignIn.safeParse(credentials);
  if (!parsed.success) return { error: "Usuario o contraseña inválidos" };

  try {
    const user = await credencialesValidas(parsed.data.usuario, parsed.data.contrasena);
    if (!user) return { error: "Usuario o contraseña inválidos" };

    if (!codigoDeAccesoActivo()) {
      console.warn(
        `[login] ${user.usuario} entró SIN código: el segundo paso está inactivo.`
      );
      return abrirSesion(user, redirect);
    }

    const emision = await emitirCodigoAcceso({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
    });

    if (!emision.ok) return { error: emision.error };

    await guardarPendiente(user.id);

    return { requiereCodigo: true as const, enmascarado: emision.enmascarado };
  } catch (err) {
    console.error("iniciarSesionConCodigo error:", err);
    return { error: "No pudimos iniciar sesión. Intenta de nuevo." };
  }
};

/** Paso 2: valida el código y recién ahí abre la sesión. */
export const confirmarCodigoDeAcceso = async (codigo: string, redirect: string) => {
  const usuarioId = await leerPendiente();
  if (!usuarioId) {
    return { error: "Tu solicitud caducó. Vuelve a iniciar sesión." };
  }

  try {
    const verificacion = await verificarCodigoAcceso(usuarioId, codigo);
    if (!verificacion.ok) return { error: verificacion.error };

    const user = await prisma.usuarios.findUnique({
      where: { id: usuarioId },
      include: usuarioWithRolArgs.include,
    });

    if (!user || !toBooleanFlag(user.activo)) {
      await borrarPendiente();
      return { error: "Tu cuenta no está disponible." };
    }

    return abrirSesion(user, redirect);
  } catch (err) {
    console.error("confirmarCodigoDeAcceso error:", err);
    return { error: "No pudimos validar el código." };
  }
};

/** Manda otro código al mismo usuario de la solicitud en curso. */
export const reenviarCodigoDeAcceso = async () => {
  const usuarioId = await leerPendiente();
  if (!usuarioId) return { error: "Tu solicitud caducó. Vuelve a iniciar sesión." };

  const user = await prisma.usuarios.findUnique({
    where: { id: usuarioId },
    select: { id: true, email: true, nombre: true, activo: true },
  });

  if (!user || !toBooleanFlag(user.activo)) {
    await borrarPendiente();
    return { error: "Tu cuenta no está disponible." };
  }

  const emision = await emitirCodigoAcceso(user);
  if (!emision.ok) return { error: emision.error };

  return { success: "Te mandamos un código nuevo.", enmascarado: emision.enmascarado };
};

/** Cancela el segundo paso (botón "usar otra cuenta"). */
export const cancelarCodigoDeAcceso = async () => {
  await borrarPendiente();
};

// ------------------------------
// REGISTRO VERIFICADO POR CORREO
// ------------------------------
const COOKIE_REGISTRO = "registro_pendiente";
const PROPOSITO_REGISTRO = "registro";

async function guardarRegistroEnCurso(email: string) {
  const token = await new SignJWT({ purpose: PROPOSITO_REGISTRO, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${VIGENCIA_MINUTOS}m`)
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_REGISTRO, token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: VIGENCIA_MINUTOS * 60,
  });
}

async function leerRegistroEnCurso(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_REGISTRO)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    if (payload.purpose !== PROPOSITO_REGISTRO || typeof payload.email !== "string") return null;
    return payload.email;
  } catch {
    return null;
  }
}

async function borrarRegistroEnCurso() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_REGISTRO);
}

/** Crea la cuenta ya con la contraseña hasheada y abre sesión. */
async function crearCuenta(datos: {
  nombre: string;
  email: string;
  contrasenaHash: string;
}) {
  const rol = await prisma.rol.findUnique({ where: { nombre: ROL_POR_DEFECTO } });
  if (!rol) {
    console.error(`Falta el rol ${ROL_POR_DEFECTO}. Corre: npx prisma db seed`);
    return null;
  }

  await prisma.usuarios.create({
    data: {
      id: randomUUID(),
      usuario: await usuarioDisponibleDesdeEmail(datos.email),
      email: datos.email,
      nombre: datos.nombre,
      contrasena: datos.contrasenaHash,
      rol_id: rol.id,
      activo: true,
      DebeCambiarPassword: false,
    },
  });

  return prisma.usuarios.findUnique({
    where: { email: datos.email },
    include: usuarioWithRolArgs.include,
  });
}

/**
 * Paso 1 del registro: valida, manda el código y NO crea la cuenta todavía.
 * Los datos quedan en `RegistroPendiente` hasta que se compruebe el correo.
 */
export const iniciarRegistroConCodigo = async (
  datos: { nombre: string; email: string; contrasena: string },
  redirect: string
) => {
  try {
    const existente = await prisma.usuarios.findUnique({ where: { email: datos.email } });
    if (existente) return { error: "Ese correo ya tiene una cuenta. Inicia sesión." };

    // Con el segundo paso apagado, el registro se comporta como antes.
    if (!codigoDeAccesoActivo()) {
      console.warn("[registro] cuenta creada SIN verificar el correo: el código está inactivo.");

      const user = await crearCuenta({
        nombre: datos.nombre,
        email: datos.email,
        contrasenaHash: await bcrypt.hash(datos.contrasena, 10),
      });

      if (!user) return { error: "El servidor no está configurado. Intenta más tarde." };
      return abrirSesion(user, redirect);
    }

    const emision = await emitirRegistroPendiente({
      nombre: datos.nombre,
      email: datos.email,
      contrasenaHash: await bcrypt.hash(datos.contrasena, 10),
    });
    if (!emision.ok) return { error: emision.error };

    await guardarRegistroEnCurso(datos.email);

    return { requiereCodigo: true as const, enmascarado: emision.enmascarado };
  } catch (err) {
    console.error("iniciarRegistroConCodigo error:", err);
    return { error: "No pudimos crear tu cuenta. Intenta de nuevo." };
  }
};

/** Paso 2 del registro: con el código correcto recién se crea la cuenta. */
export const confirmarRegistroConCodigo = async (codigo: string, redirect: string) => {
  const email = await leerRegistroEnCurso();
  if (!email) return { error: "Tu solicitud caducó. Vuelve a registrarte." };

  try {
    const confirmacion = await confirmarRegistroPendiente(email, codigo);
    if (!confirmacion.ok) return { error: confirmacion.error };

    // Alguien pudo registrar ese correo mientras tanto.
    const existente = await prisma.usuarios.findUnique({ where: { email } });
    if (existente) {
      await borrarRegistroEnCurso();
      return { error: "Ese correo ya tiene una cuenta. Inicia sesión." };
    }

    const user = await crearCuenta(confirmacion);
    if (!user) return { error: "El servidor no está configurado. Intenta más tarde." };

    await borrarRegistroEnCurso();
    console.info(`[registro] cuenta creada y correo verificado: ${user.usuario}`);

    return abrirSesion(user, redirect);
  } catch (err) {
    console.error("confirmarRegistroConCodigo error:", err);
    return { error: "No pudimos completar tu registro." };
  }
};

/** Manda otro código al correo del registro en curso. */
export const reenviarCodigoRegistro = async () => {
  const email = await leerRegistroEnCurso();
  if (!email) return { error: "Tu solicitud caducó. Vuelve a registrarte." };

  const pendiente = await prisma.registroPendiente.findUnique({ where: { email } });
  if (!pendiente) return { error: "Tu solicitud caducó. Vuelve a registrarte." };

  const emision = await emitirRegistroPendiente({
    nombre: pendiente.nombre,
    email,
    // Se conserva el hash que ya estaba guardado: el reenvío solo cambia el código.
    contrasenaHash: pendiente.contrasenaHash,
  });

  if (!emision.ok) return { error: emision.error };
  return { success: "Te mandamos un código nuevo.", enmascarado: emision.enmascarado };
};

/** Cancela el registro a medias y borra lo guardado. */
export const cancelarRegistro = async () => {
  const email = await leerRegistroEnCurso();
  if (email) await descartarRegistroPendiente(email);
  await borrarRegistroEnCurso();
};
