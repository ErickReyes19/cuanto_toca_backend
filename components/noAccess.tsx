import { ShieldAlert } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NoAcceso() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <ShieldAlert className="size-16 text-muted-foreground" />
      <h1 className="text-2xl font-semibold tracking-tight">Acceso denegado</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        No cuentas con los permisos necesarios para ver esta sección. Si crees
        que se trata de un error, contacta a un administrador.
      </p>
      <Button nativeButton={false} render={<Link href="/" />}>Volver al inicio</Button>
    </div>
  );
}
