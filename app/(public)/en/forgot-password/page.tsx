import { PantallaOlvide } from "../../forgot-password/components/pantalla-olvide";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return <PantallaOlvide token={token ?? ""} />;
}
