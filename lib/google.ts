import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Verificación del ID token que emite Google Identity Services.
 *
 * Usamos el flujo de ID token (no el de authorization code), así que basta con
 * el Client ID público: no hace falta client secret ni guardar refresh tokens.
 * Google firma el token con sus llaves públicas y aquí solo comprobamos firma,
 * emisor, audiencia y expiración.
 */

/** `jose` cachea y refresca el JWKS por su cuenta; se crea una sola vez. */
const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"), {
  cacheMaxAge: 24 * 60 * 60 * 1000,
  timeoutDuration: 5_000,
});

/** Google emite `iss` con y sin esquema según el cliente. Ambos son válidos. */
const EMISORES = ["https://accounts.google.com", "accounts.google.com"];

export type PerfilGoogle = {
  /** Identificador estable del usuario en Google. Nunca cambia ni se reasigna. */
  sub: string;
  email: string;
  emailVerificado: boolean;
  nombre: string | null;
  fotoUrl: string | null;
};

export function googleEstaConfigurado() {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim());
}

export function getGoogleClientId() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error(
      "Falta NEXT_PUBLIC_GOOGLE_CLIENT_ID. Créalo en Google Cloud Console y agrégalo al .env"
    );
  }
  return clientId;
}

/**
 * Devuelve el perfil si el token es auténtico y fue emitido para esta app.
 * Lanza si la firma, el emisor, la audiencia o la vigencia no cuadran.
 */
export async function verificarIdTokenGoogle(credential: string): Promise<PerfilGoogle> {
  const clientId = getGoogleClientId();

  const { payload } = await jwtVerify(credential, JWKS, {
    issuer: EMISORES,
    audience: clientId,
    // Tolerancia mínima por desfase de reloj entre Google y el servidor.
    clockTolerance: 30,
  });

  const sub = typeof payload.sub === "string" ? payload.sub : "";
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";

  if (!sub) throw new Error("El token de Google no trae identificador de usuario.");
  if (!email) throw new Error("El token de Google no trae correo.");

  return {
    sub,
    email,
    // Google manda el claim como boolean o como la cadena "true".
    emailVerificado: payload.email_verified === true || payload.email_verified === "true",
    nombre: typeof payload.name === "string" ? payload.name.trim() || null : null,
    fotoUrl: typeof payload.picture === "string" ? payload.picture : null,
  };
}
