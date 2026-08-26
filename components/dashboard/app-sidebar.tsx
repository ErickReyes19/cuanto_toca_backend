"use client";

import { ChevronsUpDown, LogOut, UserRound, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { startTransition } from "react";

import { cerrarSesion } from "@/app/(protected)/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { filtrarModulos, hrefActivo } from "@/lib/navegacion";

export type UsuarioSidebar = {
  nombre: string;
  correo: string;
  rol: string;
  fotoUrl: string | null;
};

export function AppSidebar({
  usuario,
  permisos,
}: {
  usuario: UsuarioSidebar;
  permisos: string[];
}) {
  const pathname = usePathname();
  const activo = hrefActivo(pathname);
  const grupos = filtrarModulos(permisos);
  const inicial = usuario.nombre.trim().charAt(0).toUpperCase() || "U";

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Cuánto Toca"
              render={<Link href="/dashboard" />}
            >
              <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Wallet className="size-4" />
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">Cuánto Toca</span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  Panel de administración
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {grupos.map((grupo) => (
          <SidebarGroup key={grupo.titulo}>
            <SidebarGroupLabel>{grupo.titulo}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {grupo.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={activo === item.href}
                      tooltip={item.titulo}
                      render={<Link href={item.href} />}
                    >
                      <item.icono />
                      <span>{item.titulo}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<SidebarMenuButton size="lg" tooltip={usuario.nombre} />}
              >
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={usuario.fotoUrl ?? undefined} alt={usuario.nombre} />
                  <AvatarFallback className="rounded-lg">{inicial}</AvatarFallback>
                </Avatar>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-medium">{usuario.nombre}</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    {usuario.rol}
                  </span>
                </span>
                <ChevronsUpDown className="ml-auto size-4" />
              </DropdownMenuTrigger>
              {/* Base UI exige que GroupLabel viva dentro de un Menu.Group. */}
              <DropdownMenuContent side="top" align="end" sideOffset={8}>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {usuario.nombre}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {usuario.correo}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuItem render={<Link href="/grupos" />}>
                    <UserRound />
                    Mis grupos
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => startTransition(cerrarSesion)}
                >
                  <LogOut />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
