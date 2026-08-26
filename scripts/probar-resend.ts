import "dotenv/config";

/**
 * Diagnóstico de Resend, aislado de la app.
 *
 *   npx tsx scripts/probar-resend.ts tu-correo@dominio.com
 *
 * Imprime la respuesta cruda de Resend. Si aquí funciona, el problema está en
 * la app; si aquí falla, está en la key, el dominio o el `from`.
 */

const destino = process.argv[2];

function enmascarar(valor: string) {
  return valor.length <= 8 ? "***" : `${valor.slice(0, 5)}...${valor.slice(-3)}`;
}

async function main() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();

  console.log("--- configuración ---");
  console.log("RESEND_API_KEY:", apiKey ? enmascarar(apiKey) : "NO DEFINIDA");
  console.log("RESEND_FROM:   ", from ?? "NO DEFINIDA");
  console.log(
    "LOGIN_CODIGO_HABILITADO:",
    process.env.LOGIN_CODIGO_HABILITADO ?? "(sin definir, o sea activo)"
  );

  if (from && /[^\x20-\x7E]/.test(from)) {
    console.warn(
      "\nAVISO: RESEND_FROM tiene caracteres no ASCII (acentos). Si el envío\n" +
        "falla, prueba con el nombre sin tildes: Cuanto Toca <no-reply@...>"
    );
  }

  if (!apiKey || !from) {
    console.error("\nFaltan variables. El segundo paso del login queda desactivado.");
    process.exit(1);
  }

  if (!destino) {
    console.error("\nUso: npx tsx scripts/probar-resend.ts tu-correo@dominio.com");
    process.exit(1);
  }

  console.log("\n--- enviando a", destino, "---");

  const respuesta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [destino],
      subject: "Prueba de Cuánto Toca",
      html: "<p>Si te llegó esto, Resend está bien configurado.</p>",
      text: "Si te llegó esto, Resend está bien configurado.",
    }),
  });

  const cuerpo = await respuesta.text();
  console.log("HTTP:", respuesta.status, respuesta.statusText);
  console.log("respuesta:", cuerpo);

  if (respuesta.ok) {
    console.log("\nOK: Resend aceptó el envío. Revisa la bandeja (y spam).");
  } else {
    console.log("\nFALLA: el error de arriba viene de Resend, no de la app.");
  }
}

main().catch((e) => {
  console.error("ERROR de red:", e instanceof Error ? e.message : e);
  process.exit(1);
});
