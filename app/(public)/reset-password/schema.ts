import { z } from "zod";

import type { Diccionario } from "@/lib/i18n";

/**
 * El esquema se construye con el diccionario en vez de ser una constante:
 * los mensajes de validación se ven en pantalla y tienen que salir en el
 * idioma de la página, igual que el resto del formulario.
 */
export function crearSchemaResetPassword(t: Diccionario) {
    return z
        .object({
            nueva: z.string().min(8, t.contrasena.validacionMinimoOcho),
            confirmar: z.string(),
        })
        .refine((data) => data.nueva === data.confirmar, {
            message: t.contrasena.noCoinciden,
            path: ["confirmar"],
        });
}

export type TSchemaResetPassword = z.infer<ReturnType<typeof crearSchemaResetPassword>>;
