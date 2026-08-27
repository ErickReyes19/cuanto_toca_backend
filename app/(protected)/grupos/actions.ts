"use server";

import { randomBytes, randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { getSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { repartirGasto, repartirIgual, validarPagadores } from "@/lib/split/reparto";
import {
  CrearCompraDespensaSchema,
  CrearGastoSchema,
  CrearGrupoSchema,
  ImportarGrupoSchema,
  RegistrarPagoSchema,
  type CrearCompraDespensaInput,
  type CrearGastoInput,
  type CrearGrupoInput,
  type ImportarGrupoInput,
  type RegistrarPagoInput,
} from "./schema";

// Sin 0/O ni 1/I/L: el codigo se dicta por WhatsApp y se lee en voz alta.
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generarCodigo(largo = 8) {
  const bytes = randomBytes(largo);
  let codigo = "";
  for (let i = 0; i < largo; i++) codigo += ALFABETO[bytes[i] % ALFABETO.length];
  return codigo;
}

async function codigoUnico() {
  for (let intento = 0; intento < 6; intento++) {
    const codigo = generarCodigo();
    const existe = await prisma.grupo.findUnique({
      where: { codigoInvitacion: codigo },
      select: { id: true },
    });
    if (!existe) return codigo;
  }
  return generarCodigo(12);
}

async function requerirSesion() {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Necesitas iniciar sesión.");
  return session;
}

/**
 * Un grupo lo ve su dueño y cualquier participante vinculado a una
 * cuenta real. Devuelve el grupo o lanza error.
 */
async function requerirAcceso(grupoId: string) {
  const session = await requerirSesion();

  const grupo = await prisma.grupo.findFirst({
    where: {
      id: grupoId,
      OR: [
        { propietarioId: session.IdUser },
        { participantes: { some: { usuarioId: session.IdUser } } },
      ],
    },
  });

  if (!grupo) throw new Error("No tienes acceso a este grupo.");
  return { session, grupo };
}

// ------------------------------------------------------------------
// GRUPOS
// ------------------------------------------------------------------

export async function crearGrupo(input: CrearGrupoInput) {
  const session = await requerirSesion();
  const datos = CrearGrupoSchema.parse(input);

  const grupo = await prisma.grupo.create({
    data: {
      id: randomUUID(),
      nombre: datos.nombre,
      descripcion: datos.descripcion || null,
      moneda: datos.moneda,
      tipo: datos.tipo,
      codigoInvitacion: await codigoUnico(),
      propietarioId: session.IdUser,
      participantes: {
        create: datos.participantes.map((nombre, indice) => ({
          id: randomUUID(),
          nombre,
          // El primero de la lista es quien crea el grupo.
          usuarioId: indice === 0 ? session.IdUser : null,
        })),
      },
    },
    select: { id: true },
  });

  revalidatePath("/grupos");
  return grupo;
}

export async function obtenerGrupos() {
  const session = await requerirSesion();

  const grupos = await prisma.grupo.findMany({
    where: {
      archivado: false,
      OR: [
        { propietarioId: session.IdUser },
        { participantes: { some: { usuarioId: session.IdUser } } },
      ],
    },
    include: {
      _count: { select: { participantes: true, gastos: true } },
      gastos: { select: { montoCentavos: true } },
    },
    orderBy: { updateAt: "desc" },
  });

  return grupos.map((grupo) => ({
    id: grupo.id,
    nombre: grupo.nombre,
    descripcion: grupo.descripcion,
    moneda: grupo.moneda,
    tipo: grupo.tipo,
    codigoInvitacion: grupo.codigoInvitacion,
    esPropietario: grupo.propietarioId === session.IdUser,
    totalParticipantes: grupo._count.participantes,
    totalGastos: grupo._count.gastos,
    totalCentavos: grupo.gastos.reduce((acc, g) => acc + g.montoCentavos, 0),
    actualizado: grupo.updateAt,
  }));
}

export async function obtenerGrupo(grupoId: string) {
  const { session } = await requerirAcceso(grupoId);

  const grupo = await prisma.grupo.findUnique({
    where: { id: grupoId },
    include: {
      participantes: { where: { activo: true }, orderBy: { createAt: "asc" } },
      gastos: {
        include: {
          reparto: true,
          categoria: { select: { slug: true, nombre: true, icono: true } },
          pagadores: { include: { participante: { select: { id: true, nombre: true } } } },
        },
        orderBy: [{ fecha: "desc" }, { createAt: "desc" }],
      },
      pagos: {
        include: {
          deParticipante: { select: { id: true, nombre: true } },
          aParticipante: { select: { id: true, nombre: true } },
        },
        orderBy: { fecha: "desc" },
      },
    },
  });

  if (!grupo) return null;

  return {
    id: grupo.id,
    nombre: grupo.nombre,
    descripcion: grupo.descripcion,
    moneda: grupo.moneda,
    tipo: grupo.tipo,
    codigoInvitacion: grupo.codigoInvitacion,
    invitacionActiva: grupo.invitacionActiva,
    esPropietario: grupo.propietarioId === session.IdUser,
    miParticipanteId:
      grupo.participantes.find((p) => p.usuarioId === session.IdUser)?.id ?? null,
    participantes: grupo.participantes.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      tieneCuenta: p.usuarioId !== null,
    })),
    gastos: grupo.gastos.map((g) => ({
      id: g.id,
      descripcion: g.descripcion,
      montoCentavos: g.montoCentavos,
      fecha: g.fecha,
      tipoReparto: g.tipoReparto,
      pagadores: g.pagadores.map((p) => ({
        participanteId: p.participanteId,
        nombre: p.participante.nombre,
        montoCentavos: p.montoCentavos,
      })),
      categoria: g.categoria,
      reparto: g.reparto.map((r) => ({
        participanteId: r.participanteId,
        montoCentavos: r.montoCentavos,
      })),
    })),
    pagos: grupo.pagos.map((p) => ({
      id: p.id,
      deParticipanteId: p.deParticipanteId,
      aParticipanteId: p.aParticipanteId,
      deNombre: p.deParticipante.nombre,
      aNombre: p.aParticipante.nombre,
      montoCentavos: p.montoCentavos,
      fecha: p.fecha,
      nota: p.nota,
    })),
  };
}

export async function archivarGrupo(grupoId: string) {
  const session = await requerirSesion();
  const grupo = await prisma.grupo.findFirst({
    where: { id: grupoId, propietarioId: session.IdUser },
    select: { id: true },
  });
  if (!grupo) throw new Error("Solo quien creó el grupo puede archivarlo.");

  await prisma.grupo.update({ where: { id: grupoId }, data: { archivado: true } });
  revalidatePath("/grupos");
}

// ------------------------------------------------------------------
// PARTICIPANTES E INVITACION
// ------------------------------------------------------------------

export async function agregarParticipante(grupoId: string, nombre: string) {
  await requerirAcceso(grupoId);

  const limpio = nombre.trim();
  if (!limpio) throw new Error("El nombre es requerido.");

  const participante = await prisma.participante.create({
    data: { id: randomUUID(), grupoId, nombre: limpio },
    select: { id: true },
  });

  revalidatePath(`/grupos/${grupoId}`);
  return participante;
}

export async function quitarParticipante(participanteId: string) {
  const participante = await prisma.participante.findUnique({
    where: { id: participanteId },
    select: {
      grupoId: true,
      _count: { select: { gastosPagados: true, participaciones: true } },
    },
  });
  if (!participante) throw new Error("Participante no encontrado.");

  await requerirAcceso(participante.grupoId);

  const tieneMovimientos =
    participante._count.gastosPagados > 0 || participante._count.participaciones > 0;

  // Con movimientos se desactiva en vez de borrar: si no, los saldos
  // históricos del grupo dejarían de cuadrar.
  if (tieneMovimientos) {
    await prisma.participante.update({
      where: { id: participanteId },
      data: { activo: false },
    });
  } else {
    await prisma.participante.delete({ where: { id: participanteId } });
  }

  revalidatePath(`/grupos/${participante.grupoId}`);
}

export async function regenerarCodigoInvitacion(grupoId: string) {
  const session = await requerirSesion();
  const grupo = await prisma.grupo.findFirst({
    where: { id: grupoId, propietarioId: session.IdUser },
    select: { id: true },
  });
  if (!grupo) throw new Error("Solo quien creó el grupo puede cambiar el enlace.");

  const codigoInvitacion = await codigoUnico();
  await prisma.grupo.update({ where: { id: grupoId }, data: { codigoInvitacion } });

  revalidatePath(`/grupos/${grupoId}`);
  return { codigoInvitacion };
}

/** Vincula la cuenta que inició sesión a un participante del grupo. */
export async function unirseAGrupo(codigo: string, participanteId?: string) {
  const session = await requerirSesion();

  const grupo = await prisma.grupo.findUnique({
    where: { codigoInvitacion: codigo.trim().toUpperCase() },
    include: { participantes: { where: { activo: true }, orderBy: { createAt: "asc" } } },
  });

  if (!grupo || !grupo.invitacionActiva) throw new Error("Este enlace ya no es válido.");

  const yaEsta = grupo.participantes.find((p) => p.usuarioId === session.IdUser);
  if (yaEsta) return { grupoId: grupo.id, participanteId: yaEsta.id };

  if (participanteId) {
    // Se reclama un lugar existente ("yo soy Marta").
    const destino = grupo.participantes.find((p) => p.id === participanteId);
    if (!destino) throw new Error("Ese integrante no existe en el grupo.");
    if (destino.usuarioId) throw new Error("Ese integrante ya fue reclamado por otra cuenta.");

    await prisma.participante.update({
      where: { id: destino.id },
      data: { usuarioId: session.IdUser },
    });
    revalidatePath(`/grupos/${grupo.id}`);
    return { grupoId: grupo.id, participanteId: destino.id };
  }

  const nuevo = await prisma.participante.create({
    data: {
      id: randomUUID(),
      grupoId: grupo.id,
      nombre: session.Nombre?.trim() || session.User,
      usuarioId: session.IdUser,
    },
    select: { id: true },
  });

  revalidatePath(`/grupos/${grupo.id}`);
  return { grupoId: grupo.id, participanteId: nuevo.id };
}

export async function verGrupoPorCodigo(codigo: string) {
  const grupo = await prisma.grupo.findUnique({
    where: { codigoInvitacion: codigo.trim().toUpperCase() },
    select: {
      id: true,
      nombre: true,
      moneda: true,
      invitacionActiva: true,
      archivado: true,
      participantes: {
        where: { activo: true },
        select: { id: true, nombre: true, usuarioId: true },
        orderBy: { createAt: "asc" },
      },
      _count: { select: { gastos: true } },
    },
  });

  if (!grupo || !grupo.invitacionActiva || grupo.archivado) return null;

  return {
    id: grupo.id,
    nombre: grupo.nombre,
    moneda: grupo.moneda,
    totalGastos: grupo._count.gastos,
    participantes: grupo.participantes.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      disponible: p.usuarioId === null,
    })),
  };
}

// ------------------------------------------------------------------
// GASTOS
// ------------------------------------------------------------------

export async function crearGasto(input: CrearGastoInput) {
  const datos = CrearGastoSchema.parse(input);
  await requerirAcceso(datos.grupoId);

  const activos = await prisma.participante.findMany({
    where: { grupoId: datos.grupoId, activo: true },
    select: { id: true },
  });
  const idsValidos = new Set(activos.map((p) => p.id));

  if (datos.pagadores.some((p) => !idsValidos.has(p.participanteId))) {
    throw new Error("Quien pagó no pertenece al grupo.");
  }
  if (datos.reparto.some((r) => !idsValidos.has(r.participanteId))) {
    throw new Error("El reparto incluye a alguien que no está en el grupo.");
  }

  const pagos = validarPagadores(datos.montoCentavos, datos.pagadores);
  if (!pagos.ok) throw new Error(pagos.error);

  const resultado = repartirGasto({
    montoCentavos: datos.montoCentavos,
    tipoReparto: datos.tipoReparto,
    entradas: datos.reparto,
  });
  if (!resultado.ok) throw new Error(resultado.error);

  const gasto = await prisma.gasto.create({
    data: {
      id: randomUUID(),
      grupoId: datos.grupoId,
      descripcion: datos.descripcion,
      montoCentavos: datos.montoCentavos,
      tipoReparto: datos.tipoReparto,
      pagadores: {
        create: datos.pagadores.map((p) => ({
          id: randomUUID(),
          participanteId: p.participanteId,
          montoCentavos: p.montoCentavos,
        })),
      },
      categoriaId: datos.categoriaId || null,
      fecha: datos.fecha ?? new Date(),
      nota: datos.nota || null,
      reparto: {
        create: resultado.lineas.map((linea) => ({
          id: randomUUID(),
          participanteId: linea.participanteId,
          montoCentavos: linea.montoCentavos,
          pesoEntrada: linea.pesoEntrada,
        })),
      },
    },
    select: { id: true },
  });

  // Toca el grupo para que ordene por reciente en el listado.
  await prisma.grupo.update({
    where: { id: datos.grupoId },
    data: { updateAt: new Date() },
  });

  revalidatePath(`/grupos/${datos.grupoId}`);
  revalidatePath("/grupos");
  return gasto;
}

/** Guarda un ticket itemizado y crea un único gasto EXACTO con los totales
 * por persona. Así las liquidaciones usan el mismo motor de saldos que el
 * resto de la aplicación, sin que el usuario tenga que sumar el ticket. */
export async function crearCompraDespensa(input: CrearCompraDespensaInput) {
  const datos = CrearCompraDespensaSchema.parse(input);
  const { grupo } = await requerirAcceso(datos.grupoId);
  if (grupo.tipo !== "DESPENSA_FAMILIAR") {
    throw new Error("Los tickets itemizados solo están disponibles en grupos de despensa.");
  }

  const participantes = await prisma.participante.findMany({
    where: { grupoId: datos.grupoId, activo: true },
    select: { id: true },
  });
  const idsValidos = new Set(participantes.map((p) => p.id));
  if (datos.pagadores.some((p) => !idsValidos.has(p.participanteId))) {
    throw new Error("Quien pagó no pertenece al grupo.");
  }
  for (const linea of datos.lineas) {
    if (new Set(linea.participanteIds).size !== linea.participanteIds.length) {
      throw new Error("Un producto no puede incluir a la misma persona dos veces.");
    }
    if (linea.participanteIds.some((id) => !idsValidos.has(id))) {
      throw new Error("Un producto incluye a alguien que no está en el grupo.");
    }
  }

  const totales = new Map<string, number>();
  const repartos = datos.lineas.map((linea) => {
    const montos = repartirIgual(linea.montoCentavos, linea.participanteIds.length);
    return linea.participanteIds.map((participanteId, indice) => {
      const montoCentavos = montos[indice];
      totales.set(participanteId, (totales.get(participanteId) ?? 0) + montoCentavos);
      return { participanteId, montoCentavos };
    });
  });
  const montoCentavos = datos.lineas.reduce((total, linea) => total + linea.montoCentavos, 0);

  const gastoId = randomUUID();
  await prisma.$transaction(async (tx) => {
    await tx.gasto.create({
      data: {
        id: gastoId, grupoId: datos.grupoId, descripcion: datos.descripcion,
        montoCentavos, tipoReparto: "EXACTO",
        pagadores: { create: datos.pagadores.map((p) => ({
          id: randomUUID(), participanteId: p.participanteId, montoCentavos: p.montoCentavos,
        })) },
        reparto: { create: [...totales].map(([participanteId, monto]) => ({
          id: randomUUID(), participanteId, montoCentavos: monto,
        })) },
      },
    });
    await tx.compraDespensa.create({
      data: {
        id: randomUUID(), grupoId: datos.grupoId, gastoId,
        lineas: { create: datos.lineas.map((linea, indice) => ({
          id: randomUUID(), descripcion: linea.descripcion, montoCentavos: linea.montoCentavos, orden: indice,
          reparto: { create: repartos[indice].map((r) => ({ id: randomUUID(), ...r })) },
        })) },
      },
    });
    await tx.grupo.update({ where: { id: datos.grupoId }, data: { updateAt: new Date() } });
  });

  revalidatePath(`/grupos/${datos.grupoId}`);
  revalidatePath("/grupos");
  return { gastoId };
}

export async function eliminarGasto(gastoId: string) {
  const gasto = await prisma.gasto.findUnique({
    where: { id: gastoId },
    select: { grupoId: true },
  });
  if (!gasto) throw new Error("Gasto no encontrado.");

  await requerirAcceso(gasto.grupoId);
  await prisma.gasto.delete({ where: { id: gastoId } });

  revalidatePath(`/grupos/${gasto.grupoId}`);
  revalidatePath("/grupos");
}

export async function obtenerCategorias() {
  return prisma.categoriaGasto.findMany({
    where: { activo: true },
    select: { id: true, slug: true, nombre: true, icono: true },
    orderBy: { orden: "asc" },
  });
}

// ------------------------------------------------------------------
// LIQUIDACIONES
// ------------------------------------------------------------------

export async function registrarPago(input: RegistrarPagoInput) {
  const datos = RegistrarPagoSchema.parse(input);
  await requerirAcceso(datos.grupoId);

  if (datos.deParticipanteId === datos.aParticipanteId) {
    throw new Error("No puedes registrar un pago a ti mismo.");
  }

  const participantes = await prisma.participante.findMany({
    where: {
      grupoId: datos.grupoId,
      id: { in: [datos.deParticipanteId, datos.aParticipanteId] },
    },
    select: { id: true },
  });
  if (participantes.length !== 2) throw new Error("Participantes inválidos para este grupo.");

  await prisma.pago.create({
    data: {
      id: randomUUID(),
      grupoId: datos.grupoId,
      deParticipanteId: datos.deParticipanteId,
      aParticipanteId: datos.aParticipanteId,
      montoCentavos: datos.montoCentavos,
      nota: datos.nota || null,
    },
  });

  revalidatePath(`/grupos/${datos.grupoId}`);
}

export async function eliminarPago(pagoId: string) {
  const pago = await prisma.pago.findUnique({
    where: { id: pagoId },
    select: { grupoId: true },
  });
  if (!pago) throw new Error("Pago no encontrado.");

  await requerirAcceso(pago.grupoId);
  await prisma.pago.delete({ where: { id: pagoId } });

  revalidatePath(`/grupos/${pago.grupoId}`);
}

// ------------------------------------------------------------------
// IMPORTAR DESDE LA CALCULADORA ANONIMA
// ------------------------------------------------------------------

/**
 * Convierte un grupo que vivía en el navegador (sin cuenta) en un
 * grupo real. Es el puente del embudo: calculas gratis, y si lo
 * quieres guardar, creas cuenta y no pierdes nada.
 */
export async function importarGrupoLocal(input: ImportarGrupoInput) {
  const session = await requerirSesion();
  const datos = ImportarGrupoSchema.parse(input);

  const categorias = await prisma.categoriaGasto.findMany({
    select: { id: true, slug: true },
  });
  const porSlug = new Map(categorias.map((c) => [c.slug, c.id]));

  // id local -> id real
  const mapa = new Map<string, string>();
  for (const participante of datos.participantes) mapa.set(participante.id, randomUUID());

  const grupoId = randomUUID();
  const codigoInvitacion = await codigoUnico();

  await prisma.$transaction(async (tx) => {
    await tx.grupo.create({
      data: {
        id: grupoId,
        nombre: datos.nombre,
        moneda: datos.moneda,
        tipo: datos.tipo,
        codigoInvitacion,
        propietarioId: session.IdUser,
        participantes: {
          create: datos.participantes.map((p, indice) => ({
            id: mapa.get(p.id)!,
            nombre: p.nombre,
            usuarioId: indice === 0 ? session.IdUser : null,
          })),
        },
      },
    });

    for (const gasto of datos.gastos) {
      const pagadores = gasto.pagadores
        .filter((p) => mapa.has(p.participanteId))
        .map((p) => ({
          id: randomUUID(),
          participanteId: mapa.get(p.participanteId)!,
          montoCentavos: p.montoCentavos,
        }));
      if (pagadores.length === 0) continue;

      await tx.gasto.create({
        data: {
          id: randomUUID(),
          grupoId,
          descripcion: gasto.descripcion,
          montoCentavos: gasto.montoCentavos,
          pagadores: { create: pagadores },
          // El reparto ya viene resuelto a montos exactos desde el navegador.
          tipoReparto: "EXACTO",
          categoriaId: gasto.categoriaSlug ? porSlug.get(gasto.categoriaSlug) ?? null : null,
          reparto: {
            create: gasto.reparto
              .filter((r) => mapa.has(r.participanteId))
              .map((r) => ({
                id: randomUUID(),
                participanteId: mapa.get(r.participanteId)!,
                montoCentavos: r.montoCentavos,
              })),
          },
        },
      });
    }
  });

  revalidatePath("/grupos");
  return { grupoId };
}
