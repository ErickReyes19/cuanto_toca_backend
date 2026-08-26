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
 * Correo de bienvenida con las credenciales temporales del usuario recién creado.
 */
export function generateUserCreatedEmailHtml(
  nombre: string,
  usuario: string,
  passwordTemporal: string
) {
  const loginUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;color:#1c1917;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
      <tr>
        <td>
          <h1 style="margin:0 0 16px;font-size:20px;">Bienvenido a ${APP_NAME}</h1>
          <p style="margin:0 0 16px;line-height:1.6;">Hola ${escapeHtml(nombre)}, tu cuenta ya está creada.</p>
          <p style="margin:0 0 8px;line-height:1.6;">Estas son tus credenciales temporales:</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:#f5f5f4;border-radius:8px;padding:16px;">
            <tr><td style="padding:4px 0;">Usuario:</td><td style="padding:4px 0 4px 12px;"><strong>${escapeHtml(usuario)}</strong></td></tr>
            <tr><td style="padding:4px 0;">Contraseña:</td><td style="padding:4px 0 4px 12px;"><strong>${escapeHtml(passwordTemporal)}</strong></td></tr>
          </table>
          <p style="margin:0 0 24px;line-height:1.6;">Por seguridad deberás cambiar la contraseña la primera vez que inicies sesión.</p>
          <a href="${loginUrl}" style="display:inline-block;background:#1c1917;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;">Iniciar sesión</a>
          <p style="margin:24px 0 0;font-size:12px;color:#78716c;">Si no esperabas este correo, puedes ignorarlo.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
