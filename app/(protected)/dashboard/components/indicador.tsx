import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Tarjeta de un número del panel. Toda la tarjeta es el enlace al módulo. */
export function Indicador({
  Icon,
  titulo,
  valor,
  detalle,
  href,
}: {
  Icon: LucideIcon;
  titulo: string;
  valor: number;
  detalle: string;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="h-full transition-colors hover:bg-muted/40">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Icon className="size-4" />
            {titulo}
          </CardDescription>
          <CardTitle className="text-3xl tabular-nums">{valor}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{detalle}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
