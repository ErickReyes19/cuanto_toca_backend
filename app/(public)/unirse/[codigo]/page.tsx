import { PantallaUnirse } from "../components/pantalla-unirse";

export default async function UnirsePage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  return <PantallaUnirse codigo={codigo} />;
}
