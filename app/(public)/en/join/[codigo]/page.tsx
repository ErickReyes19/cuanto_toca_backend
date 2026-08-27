import { PantallaUnirse } from "../../../unirse/components/pantalla-unirse";

export default async function JoinWithCodePage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  return <PantallaUnirse codigo={codigo} />;
}
