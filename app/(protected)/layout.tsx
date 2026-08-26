import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getSession } from "@/auth";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.IdUser) redirect("/login");
  if (session.DebeCambiar) redirect("/reset-password");

  // El sidebar guarda su estado en cookie; así no parpadea al recargar.
  const cookieStore = await cookies();
  const sidebarAbierto = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={sidebarAbierto}>
      <AppSidebar
        permisos={session.Permiso ?? []}
        usuario={{
          nombre: session.Nombre?.trim() || session.User,
          correo: session.User,
          rol: session.Rol,
          fotoUrl: session.FotoUrl ?? null,
        }}
      />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
