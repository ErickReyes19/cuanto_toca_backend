import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";

import { PrismaClient } from "../lib/generated/prisma/client";

const prisma = new PrismaClient();

/** Categorías pensadas para cómo se gasta en LATAM. */
const CATEGORIAS = [
  { slug: "comida", nombre: "Comida", icono: "UtensilsCrossed", orden: 10 },
  { slug: "bebidas", nombre: "Bebidas", icono: "Beer", orden: 20 },
  { slug: "super", nombre: "Súper / pulpería", icono: "ShoppingCart", orden: 30 },
  { slug: "transporte", nombre: "Transporte", icono: "Car", orden: 40 },
  { slug: "combustible", nombre: "Combustible", icono: "Fuel", orden: 50 },
  { slug: "hospedaje", nombre: "Hospedaje", icono: "BedDouble", orden: 60 },
  { slug: "entradas", nombre: "Entradas y tours", icono: "Ticket", orden: 70 },
  { slug: "fiesta", nombre: "Fiesta", icono: "PartyPopper", orden: 80 },
  { slug: "casa", nombre: "Casa y servicios", icono: "House", orden: 90 },
  { slug: "salud", nombre: "Salud", icono: "HeartPulse", orden: 100 },
  { slug: "regalos", nombre: "Regalos", icono: "Gift", orden: 110 },
  { slug: "otros", nombre: "Otros", icono: "Receipt", orden: 999 },
];

/**
 * Permisos que el código realmente consulta con `permisos.includes(...)`.
 * Si agregas un `includes("algo")` nuevo en una pantalla, agrégalo también aquí
 * para que exista en base y se pueda asignar desde /roles.
 */
const PERMISOS = [
  // Módulo Usuarios
  { nombre: "ver_usuarios", descripcion: "Entrar al módulo de usuarios" },
  { nombre: "crear_usuario", descripcion: "Crear usuarios nuevos" },
  { nombre: "editar_usuario", descripcion: "Editar los datos de un usuario" },
  // Módulo Roles
  { nombre: "ver_roles", descripcion: "Entrar al módulo de roles" },
  { nombre: "crear_roles", descripcion: "Crear roles nuevos" },
  { nombre: "editar_roles", descripcion: "Editar un rol y sus permisos" },
  // Módulo Permisos
  { nombre: "ver_permisos", descripcion: "Entrar al módulo de permisos" },
  { nombre: "crear_permisos", descripcion: "Crear permisos nuevos" },
  { nombre: "editar_permisos", descripcion: "Editar un permiso" },
  // Transversal
  { nombre: "super_admin", descripcion: "Acceso total a las acciones administrativas" },
];

const TODOS_LOS_PERMISOS = PERMISOS.map((permiso) => permiso.nombre);

/**
 * Roles base con su set mínimo de permisos.
 *
 * - `SUPER_ADMIN`: todo el panel.
 * - `ADMINISTRADOR`: administra usuarios y consulta roles y permisos.
 * - `USUARIO`: rol de quien se registra en la app, sin permisos de panel. El
 *   acceso a un grupo se resuelve por propiedad/participación, no por rol.
 */
const ROLES: { nombre: string; descripcion: string; permisos: string[] }[] = [
  {
    nombre: "SUPER_ADMIN",
    descripcion: "Acceso total al panel de administración",
    permisos: TODOS_LOS_PERMISOS,
  },
  {
    nombre: "ADMINISTRADOR",
    descripcion: "Administra usuarios y consulta roles y permisos",
    permisos: [
      "ver_usuarios",
      "crear_usuario",
      "editar_usuario",
      "ver_roles",
      "ver_permisos",
    ],
  },
  {
    nombre: "USUARIO",
    descripcion: "Usuario de la app de gastos compartidos",
    permisos: [],
  },
];

/** Restos del CRM que se eliminó. Se borran si ya nadie los usa. */
const ROLES_OBSOLETOS = ["VENDEDOR", "CLIENTE"];
const PERMISOS_OBSOLETOS = ["ver_todos_usuarios"];

/** Cuenta inicial para entrar al panel. Cámbiala con variables de entorno. */
const ADMIN = {
  usuario: process.env.SEED_ADMIN_USUARIO ?? "admin",
  email: (process.env.SEED_ADMIN_EMAIL ?? "admin@cuantotoca.app").toLowerCase(),
  contrasena: process.env.SEED_ADMIN_PASSWORD ?? "Admin12345",
  nombre: process.env.SEED_ADMIN_NOMBRE ?? "Super administrador",
};

async function sembrarCategorias() {
  for (const categoria of CATEGORIAS) {
    await prisma.categoriaGasto.upsert({
      where: { slug: categoria.slug },
      update: { nombre: categoria.nombre, icono: categoria.icono, orden: categoria.orden },
      create: categoria,
    });
  }
  console.log(`Categorías sembradas: ${CATEGORIAS.length}`);
}

async function sembrarPermisos() {
  const porNombre = new Map<string, string>();

  for (const permiso of PERMISOS) {
    const fila = await prisma.permiso.upsert({
      where: { nombre: permiso.nombre },
      update: { descripcion: permiso.descripcion },
      create: { nombre: permiso.nombre, descripcion: permiso.descripcion, activo: true },
    });

    porNombre.set(fila.nombre, fila.id);
  }

  console.log(`Permisos sembrados: ${PERMISOS.length}`);
  return porNombre;
}

/**
 * Asigna los permisos base a cada rol. Solo agrega los que falten: nunca quita
 * los que hayas configurado a mano desde /roles.
 */
async function sembrarRoles(permisosPorNombre: Map<string, string>) {
  const porNombre = new Map<string, string>();

  for (const rol of ROLES) {
    const fila = await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: {},
      create: { nombre: rol.nombre, descripcion: rol.descripcion, activo: true },
    });

    porNombre.set(fila.nombre, fila.id);

    for (const nombrePermiso of rol.permisos) {
      const permisoId = permisosPorNombre.get(nombrePermiso);
      if (!permisoId) continue;

      await prisma.rolPermiso.upsert({
        where: { rolId_permisoId: { rolId: fila.id, permisoId } },
        update: {},
        create: { rolId: fila.id, permisoId },
      });
    }

    console.log(`  ${rol.nombre}: ${rol.permisos.length} permiso(s) base`);
  }

  console.log(`Roles sembrados: ${ROLES.length}`);
  return porNombre;
}

/** Borra los roles y permisos que quedaron del CRM. Un rol con usuarios se respeta. */
async function limpiarRestosDelCrm() {
  for (const nombre of PERMISOS_OBSOLETOS) {
    const permiso = await prisma.permiso.findUnique({ where: { nombre } });
    if (!permiso) continue;

    await prisma.rolPermiso.deleteMany({ where: { permisoId: permiso.id } });
    await prisma.permiso.delete({ where: { id: permiso.id } });
    console.log(`  permiso obsoleto eliminado: ${nombre}`);
  }

  for (const nombre of ROLES_OBSOLETOS) {
    const rol = await prisma.rol.findUnique({
      where: { nombre },
      include: { _count: { select: { usuarios: true } } },
    });
    if (!rol) continue;

    if (rol._count.usuarios > 0) {
      console.warn(
        `  rol obsoleto ${nombre} conservado: tiene ${rol._count.usuarios} usuario(s). Reasígnalos y vuelve a correr el seed.`
      );
      continue;
    }

    await prisma.rolPermiso.deleteMany({ where: { rolId: rol.id } });
    await prisma.rol.delete({ where: { id: rol.id } });
    console.log(`  rol obsoleto eliminado: ${nombre}`);
  }
}

/**
 * Crea la cuenta inicial de SUPER_ADMIN. Si ya existe no toca la contraseña,
 * solo se asegura de que siga activa y con el rol correcto.
 */
async function sembrarAdmin(rolesPorNombre: Map<string, string>) {
  const rolId = rolesPorNombre.get("SUPER_ADMIN");
  if (!rolId) throw new Error("No se pudo resolver el rol SUPER_ADMIN");

  const existente = await prisma.usuarios.findUnique({ where: { email: ADMIN.email } });

  if (existente) {
    await prisma.usuarios.update({
      where: { id: existente.id },
      data: { rol_id: rolId, activo: true },
    });
    console.log(`Admin existente reactivado: ${existente.usuario} (${ADMIN.email})`);
    return;
  }

  await prisma.usuarios.create({
    data: {
      id: randomUUID(),
      usuario: ADMIN.usuario,
      email: ADMIN.email,
      nombre: ADMIN.nombre,
      contrasena: await bcrypt.hash(ADMIN.contrasena, 10),
      rol_id: rolId,
      activo: true,
      DebeCambiarPassword: false,
    },
  });

  console.log("Admin creado:");
  console.log(`  usuario:    ${ADMIN.usuario}`);
  console.log(`  correo:     ${ADMIN.email}`);
  console.log(`  contraseña: ${ADMIN.contrasena}`);
}

async function main() {
  await sembrarCategorias();
  const permisos = await sembrarPermisos();
  const roles = await sembrarRoles(permisos);
  await limpiarRestosDelCrm();
  await sembrarAdmin(roles);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
