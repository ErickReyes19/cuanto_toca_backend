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
 * Correo con el enlace para restablecer la contraseña.
 * El enlace caduca a las 2 horas (ver RESET_TOKEN_TTL_HOURS).
 */
export function generatePasswordResetEmailHtml(usuario: string, link: string) {
  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;color:#1c1917;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
      <tr>
        <td>
          <h1 style="margin:0 0 16px;font-size:20px;">Restablecer contraseña</h1>
          <p style="margin:0 0 16px;line-height:1.6;">Hola ${escapeHtml(usuario)}, recibimos una solicitud para restablecer la contraseña de tu cuenta en ${APP_NAME}.</p>
          <p style="margin:0 0 24px;line-height:1.6;">Este enlace caduca en 2 horas y solo puede usarse una vez.</p>
          <a href="${link}" style="display:inline-block;background:#1c1917;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;">Crear nueva contraseña</a>
          <p style="margin:24px 0 0;font-size:12px;color:#78716c;">Si no solicitaste el cambio, ignora este correo: tu contraseña actual seguirá siendo válida.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
