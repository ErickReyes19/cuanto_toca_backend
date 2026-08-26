const APP_NAME = "Cuánto Toca";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Correo con el código de un solo uso para completar el inicio de sesión.
 * Sin enlaces de acción: si alguien reenvía el correo, no hay nada que clicar.
 */
export function generarCodigoAccesoEmailHtml(
  nombre: string,
  codigo: string,
  minutosVigencia: number
) {
  const saludo = escapeHtml(nombre.trim() || "Hola");
  const codigoSeguro = escapeHtml(codigo);

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1c1917;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:14px;color:#78716c;">${escapeHtml(APP_NAME)}</p>
          <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;">Tu código para entrar</h1>

          <p style="margin:0 0 24px;font-size:15px;line-height:1.5;">
            ${saludo}, usa este código para terminar de iniciar sesión:
          </p>

          <p style="margin:0 0 24px;padding:16px;background:#f5f5f4;border-radius:12px;text-align:center;font-size:32px;font-weight:700;letter-spacing:8px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">
            ${codigoSeguro}
          </p>

          <p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#57534e;">
            Caduca en ${minutosVigencia} minutos y solo sirve una vez.
          </p>
          <p style="margin:0;font-size:14px;line-height:1.5;color:#57534e;">
            Si no intentaste entrar, alguien más tiene tu contraseña: cámbiala cuanto antes.
            Nadie de ${escapeHtml(APP_NAME)} te va a pedir este código.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function generarCodigoAccesoEmailTexto(codigo: string, minutosVigencia: number) {
  return [
    `${APP_NAME} - tu código para entrar: ${codigo}`,
    "",
    `Caduca en ${minutosVigencia} minutos y solo sirve una vez.`,
    "Si no intentaste entrar, cambia tu contraseña.",
  ].join("\n");
}
