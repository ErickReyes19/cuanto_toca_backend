import { diccionario } from "@/lib/i18n";
import { getIdioma } from "@/lib/i18n/servidor";
import { isResetTokenValid } from "../actions";
import ResetPasswordForm from "./form";

/**
 * Pantalla del enlace de "olvidé mi contraseña" que llega por correo. La
 * comparten `/forgot-password` y `/en/forgot-password`.
 */
export async function PantallaOlvide({ token }: { token: string }) {
    const t = diccionario(await getIdioma());

    const esValido = token ? await isResetTokenValid(token) : false;

    if (!esValido) {
        return (
            <div className="max-w-md mx-auto mt-20 p-6 border rounded-md shadow">
                <h1 className="text-xl font-bold mb-4">{t.contrasena.enlaceInvalido}</h1>
                <p>{t.contrasena.enlaceInvalidoDetalle}</p>
            </div>
        );
    }

    return <ResetPasswordForm token={token} />;
}
