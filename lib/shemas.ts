import { z } from "zod";

export const schemaSignIn = z.object({
  usuario: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  contrasena: z.string().min(1, "La contraseña es requerida"),
});

export type TSchemaSignIn = z.infer<typeof schemaSignIn>;
