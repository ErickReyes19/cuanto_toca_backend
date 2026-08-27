import { z } from "zod";

import { esMonedaValida } from "@/lib/split/moneda";
import { TIPOS_REPARTO } from "@/lib/split/tipos";

export const TIPOS_GRUPO = ["VIAJE_REUNION", "DESPENSA_FAMILIAR"] as const;

export const NombreParticipante = z
  .string()
  .trim()
  .min(1, "El nombre es requerido")
  .max(80, "Máximo 80 caracteres");

export const CrearGrupoSchema = z.object({
  nombre: z.string().trim().min(1, "Ponle un nombre al grupo").max(120),
  descripcion: z.string().trim().max(500).optional().or(z.literal("")),
  moneda: z.string().trim().toUpperCase().refine(esMonedaValida, "Moneda no soportada"),
  tipo: z.enum(TIPOS_GRUPO).default("VIAJE_REUNION"),
  participantes: z
    .array(NombreParticipante)
    .min(1, "Agrega al menos un integrante")
    .max(50, "Máximo 50 integrantes por grupo"),
  amigoIds: z.array(z.string().min(1)).max(49).default([]),
});
export type CrearGrupoInput = z.infer<typeof CrearGrupoSchema>;

export const LineaRepartoSchema = z.object({
  participanteId: z.string().min(1),
  valor: z.number().int().min(0).optional(),
});

/** Quién puso el dinero y cuánto. Uno o varios. */
export const LineaPagadorSchema = z.object({
  participanteId: z.string().min(1),
  montoCentavos: z.number().int().positive(),
});

export const CrearGastoSchema = z.object({
  grupoId: z.string().min(1),
  descripcion: z.string().trim().min(1, "Describe el gasto").max(160),
  montoCentavos: z.number().int().positive("El monto debe ser mayor a cero"),
  pagadores: z.array(LineaPagadorSchema).min(1, "Indica quién puso el dinero"),
  tipoReparto: z.enum(TIPOS_REPARTO),
  categoriaId: z.string().min(1).nullable().optional(),
  fecha: z.coerce.date().optional(),
  nota: z.string().trim().max(500).optional().or(z.literal("")),
  reparto: z.array(LineaRepartoSchema).min(1, "Selecciona al menos un participante"),
});
export type CrearGastoInput = z.infer<typeof CrearGastoSchema>;


export const CrearCompraDespensaSchema = z.object({
  grupoId: z.string().min(1),
  descripcion: z.string().trim().min(1, "Describe la compra").max(160),
  pagadores: z.array(LineaPagadorSchema).min(1, "Indica quién puso el dinero"),
  lineas: z
    .array(
      z.object({
        descripcion: z.string().trim().min(1, "Describe el producto").max(160),
        montoCentavos: z.number().int().positive("El monto debe ser mayor a cero"),
        participanteIds: z.array(z.string().min(1)).min(1, "Selecciona a quién le corresponde el producto"),
      })
    )
    .min(1, "Agrega al menos un producto")
    .max(300, "Máximo 300 productos por ticket"),
});
export type CrearCompraDespensaInput = z.infer<typeof CrearCompraDespensaSchema>;

export const RegistrarPagoSchema = z.object({
  grupoId: z.string().min(1),
  deParticipanteId: z.string().min(1),
  aParticipanteId: z.string().min(1),
  montoCentavos: z.number().int().positive("El monto debe ser mayor a cero"),
  nota: z.string().trim().max(300).optional().or(z.literal("")),
});
export type RegistrarPagoInput = z.infer<typeof RegistrarPagoSchema>;

/** Payload que manda la calculadora anónima al guardarse. */
export const ImportarGrupoSchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  moneda: z.string().trim().toUpperCase().refine(esMonedaValida),
  tipo: z.enum(TIPOS_GRUPO).default("VIAJE_REUNION"),
  participantes: z.array(z.object({ id: z.string(), nombre: NombreParticipante })).min(1).max(50),
  gastos: z
    .array(
      z.object({
        descripcion: z.string().trim().min(1).max(160),
        montoCentavos: z.number().int().positive(),
        pagadores: z.array(LineaPagadorSchema).min(1),
        categoriaSlug: z.string().optional().nullable(),
        reparto: z.array(z.object({ participanteId: z.string(), montoCentavos: z.number().int().min(0) })).min(1),
      })
    )
    .max(300),
});
export type ImportarGrupoInput = z.infer<typeof ImportarGrupoSchema>;
