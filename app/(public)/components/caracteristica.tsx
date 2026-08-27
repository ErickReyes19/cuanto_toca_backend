import type { LucideIcon } from "lucide-react";

/** Tarjeta de una ventaja del producto en la portada. */
export function Caracteristica({
  Icon,
  titulo,
  detalle,
}: {
  Icon: LucideIcon;
  titulo: string;
  detalle: string;
}) {
  return (
    <div className="rounded-xl border p-4">
      <Icon className="mb-2 size-5 text-primary" />
      <p className="font-medium">{titulo}</p>
      <p className="text-sm text-muted-foreground">{detalle}</p>
    </div>
  );
}
