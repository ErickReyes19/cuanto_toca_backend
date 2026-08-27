import {
  LayoutDashboard,
  ListCheck,
  Receipt,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type ModuloNav = {
  titulo: string;
  href: string;
  icono: LucideIcon;
  /** Permiso requerido para verlo. `null` = visible para cualquier sesión. */
  permiso: string | null;
};

export type GrupoNav = {
  titulo: string;
  items: ModuloNav[];
};

/**
 * Módulos del panel. El menú solo esconde lo que no aplica: cada página sigue
 * validando su permiso del lado del servidor con `getSessionPermisos()`.
 */
export const MODULOS: GrupoNav[] = [
  {
    titulo: "General",
    items: [
      { titulo: "Panel", href: "/dashboard", icono: LayoutDashboard, permiso: null },
      { titulo: "Mis grupos", href: "/grupos", icono: Receipt, permiso: null },
      { titulo: "Amigos", href: "/amigos", icono: Users, permiso: null },
    ],
  },
  {
    titulo: "Administración",
    items: [
      { titulo: "Usuarios", href: "/usuarios", icono: Users, permiso: "ver_usuarios" },
      { titulo: "Roles", href: "/roles", icono: ShieldCheck, permiso: "ver_roles" },
      { titulo: "Permisos", href: "/permisos", icono: ListCheck, permiso: "ver_permisos" },
    ],
  },
];

/** Quita los módulos sin permiso y los grupos que quedan vacíos. */
export function filtrarModulos(permisos: string[]): GrupoNav[] {
  return MODULOS.map((grupo) => ({
    ...grupo,
    items: grupo.items.filter(
      (item) => item.permiso === null || permisos.includes(item.permiso)
    ),
  })).filter((grupo) => grupo.items.length > 0);
}

function coincide(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** El href más específico que coincide con la ruta actual (`/usuarios/abc/edit` resuelve a `/usuarios`). */
export function hrefActivo(pathname: string): string | null {
  return MODULOS.flatMap((grupo) => grupo.items)
    .filter((item) => coincide(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null;
}

/** Título de la pantalla actual para el encabezado del panel. */
export function tituloDeRuta(pathname: string): string {
  const href = hrefActivo(pathname);
  const modulo = MODULOS.flatMap((grupo) => grupo.items).find(
    (item) => item.href === href
  );

  return modulo?.titulo ?? "Panel";
}
