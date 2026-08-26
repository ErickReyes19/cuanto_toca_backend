/**
 * Envío de correo con Resend.
 *
 * Va contra la API REST con `fetch` en vez del SDK: es una sola llamada, evita
 * sumar una dependencia al bundle de las funciones y funciona igual en
 * cualquier runtime. Si algún día necesitas adjuntos o batch, cambia esto por
 * el paquete `resend` sin tocar a quien lo llama.
 */

const ENDPOINT = "https://api.resend.com/emails";

export type CorreoResend = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export function resendEstaConfigurado() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM?.trim());
}

function configuracion() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();

  if (!apiKey) throw new Error("Falta RESEND_API_KEY");
  if (!from) throw new Error("Falta RESEND_FROM (debe usar un dominio verificado en Resend)");

  return { apiKey, from };
}

/**
 * Manda el correo. Lanza si Resend responde con error, para que quien llama
 * decida si eso corta el flujo o solo se registra.
 */
export async function enviarCorreo(correo: CorreoResend) {
  const { apiKey, from } = configuracion();

  // Timeout con AbortController en vez de AbortSignal.timeout: mismo efecto y
  // sin depender de una API más nueva que puede no estar en todos los runtimes.
  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), 10_000);

  let respuesta: Response;
  try {
    respuesta = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(correo.to) ? correo.to : [correo.to],
        subject: correo.subject,
        html: correo.html,
        text: correo.text,
        // Resend usa snake_case en su API.
        reply_to: correo.replyTo,
      }),
      signal: control.signal,
      // Nada que cachear en un POST transaccional.
      cache: "no-store",
    });
  } finally {
    clearTimeout(temporizador);
  }

  if (!respuesta.ok) {
    // El cuerpo de error de Resend trae { name, message }; no incluye la API key.
    const detalle = await respuesta.text().catch(() => "");
    throw new Error(`Resend respondió ${respuesta.status}: ${detalle.slice(0, 300)}`);
  }

  return (await respuesta.json()) as { id: string };
}
