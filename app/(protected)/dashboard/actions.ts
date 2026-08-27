"use server";

import { getSession } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Datos del panel. Vive aquí y no en la página para que las consultas se
 * puedan reutilizar y probar sin arrastrar el árbol de React.
 */

export type GrupoReciente = {
  id: string;
  nombre: string;
  moneda: string;
  participantes: number;
  gastos: number;
  totalCentavos: number;
};

export type ResumenPanel = {
  /** Grupos activos donde participo. */
  misGrupos: number;
  /** Todos los grupos creados en el sistema. */
  gruposDelSistema: number;
  /** Gastos registrados en mis grupos. */
  misGastos: number;
  gruposRecientes: GrupoReciente[];
  /** `null` cuando la sesión no tiene el permiso para verlo. */
  totalUsuarios: number | null;
  totalRoles: number | null;
  totalPermisos: number | null;
};

/** Un grupo cuenta como "mío" si lo creé o si participo con mi cuenta. */
function filtroDeMisGrupos(usuarioId: string) {
  return {
    archivado: false,
    OR: [
      { propietarioId: usuarioId },
      { participantes: { some: { usuarioId } } },
    ],
  };
}

export async function obtenerResumenPanel(): Promise<ResumenPanel> {
  const session = await getSession();
  if (!session?.IdUser) throw new Error("Sesión requerida");

  const permisos = session.Permiso ?? [];
  const mios = filtroDeMisGrupos(session.IdUser);

  // Todo en paralelo: son consultas independientes y así el panel abre en una
  // sola ida a la base en vez de encadenar siete.
  const [
    misGrupos,
    gruposDelSistema,
    misGastos,
    recientes,
    totalUsuarios,
    totalRoles,
    totalPermisos,
  ] = await Promise.all([
    prisma.grupo.count({ where: mios }),
    prisma.grupo.count(),
    prisma.gasto.count({ where: { grupo: mios } }),
    prisma.grupo.findMany({
      where: mios,
      orderBy: { updateAt: "desc" },
      take: 5,
      select: {
        id: true,
        nombre: true,
        moneda: true,
        _count: { select: { participantes: true } },
        gastos: { select: { montoCentavos: true } },
      },
    }),
    permisos.includes("ver_usuarios") ? prisma.usuarios.count() : null,
    permisos.includes("ver_roles") ? prisma.rol.count({ where: { activo: true } }) : null,
    permisos.includes("ver_permisos") ? prisma.permiso.count({ where: { activo: true } }) : null,
  ]);

  return {
    misGrupos,
    gruposDelSistema,
    misGastos,
    totalUsuarios,
    totalRoles,
    totalPermisos,
    gruposRecientes: recientes.map((grupo) => ({
      id: grupo.id,
      nombre: grupo.nombre,
      moneda: grupo.moneda,
      participantes: grupo._count.participantes,
      gastos: grupo.gastos.length,
      totalCentavos: grupo.gastos.reduce((suma, gasto) => suma + gasto.montoCentavos, 0),
    })),
  };
}
