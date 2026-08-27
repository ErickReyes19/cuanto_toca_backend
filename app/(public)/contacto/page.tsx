import type { Metadata } from "next";
import Link from "next/link";

import { getCorreoContacto } from "@/lib/contenido";
import { SITIO } from "@/lib/site";
import { PaginaContenido } from "../components/pagina-contenido";

const RUTA = "/contacto";
const ENTRADILLA =
  "Escríbenos si algo no funciona, si quieres borrar tu cuenta o si se te ocurre cómo mejorar la herramienta.";

export const metadata: Metadata = {
  title: "Contacto",
  description: ENTRADILLA,
  alternates: { canonical: RUTA },
};

export default function Contacto() {
  const correo = getCorreoContacto();

  return (
    <PaginaContenido ruta={RUTA} titulo="Contacto" entradilla={ENTRADILLA}>
      <p>
        {SITIO.nombre} lo mantiene un equipo pequeño. Leemos todos los correos, aunque a veces la
        respuesta tarda un par de días.
      </p>

      <div className="rounded-xl border p-5 text-center">
        <p className="text-sm text-muted-foreground">Escríbenos a</p>
        <a
          href={`mailto:${correo}`}
          className="mt-1 block text-xl font-semibold underline underline-offset-4"
        >
          {correo}
        </a>
      </div>

      <h2>Para qué escribirnos</h2>
      <ul>
        <li>
          <strong>Algo no funciona:</strong> cuéntanos qué hiciste y qué esperabas que pasara. Si
          puedes, adjunta una captura.
        </li>
        <li>
          <strong>Borrar tu cuenta:</strong> escríbenos desde el correo asociado y eliminamos tu
          cuenta con todos tus grupos y gastos.
        </li>
        <li>
          <strong>Un cálculo que no te cuadra:</strong> mándanos los montos. Si hay un error en el
          reparto queremos saberlo.
        </li>
        <li>
          <strong>Ideas:</strong> buena parte de lo que existe hoy salió de sugerencias de quienes
          la usan.
        </li>
      </ul>

      <h2>Antes de escribir</h2>
      <p>
        Puede que tu duda ya esté resuelta. Estas son las preguntas que más nos llegan:
      </p>
      <ul>
        <li>
          <Link href="/dividir-la-despensa" className="underline underline-offset-4">
            Cómo repartir un súper pagado con una sola tarjeta
          </Link>
        </li>
        <li>
          <Link href="/dividir-gastos-de-viaje" className="underline underline-offset-4">
            Cómo dividir los gastos de un viaje
          </Link>
        </li>
        <li>
          <Link href="/privacidad" className="underline underline-offset-4">
            Qué datos guardamos y por cuánto tiempo
          </Link>
        </li>
      </ul>

      <h2>Sobre tu seguridad</h2>
      <p>
        Nunca te vamos a pedir tu contraseña ni el código de 6 dígitos que te llega por correo. Si
        recibes un mensaje que dice ser nuestro y te los pide, no es nuestro: avísanos.
      </p>
    </PaginaContenido>
  );
}
