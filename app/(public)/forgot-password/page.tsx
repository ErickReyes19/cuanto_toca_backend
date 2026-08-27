import { PantallaOlvide } from "./components/pantalla-olvide";

export default async function ForgotPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {
    // En Next 16 `searchParams` es una promesa: sin el await, `token` salía
    // siempre `undefined` y el enlace del correo se veía como caducado.
    const { token } = await searchParams;

    return <PantallaOlvide token={token ?? ""} />;
}
