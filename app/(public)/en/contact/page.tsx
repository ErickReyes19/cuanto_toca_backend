import type { Metadata } from "next";
import Link from "next/link";

import { getCorreoContacto } from "@/lib/contenido";
import { RUTAS, diccionario } from "@/lib/i18n";
import { SITIO } from "@/lib/site";
import { PaginaContenido, metadatosDeContenido } from "../../components/pagina-contenido";

export const metadata: Metadata = metadatosDeContenido("contacto", "en");

export default function Contact() {
  const correo = getCorreoContacto();
  const t = diccionario("en");

  return (
    <PaginaContenido clave="contacto">
      <p>
        {SITIO.nombre} is maintained by a small team. We read every email, though sometimes it takes
        a couple of days to reply.
      </p>

      <div className="rounded-xl border p-5 text-center">
        <p className="text-sm text-muted-foreground">{t.contacto.escribenosA}</p>
        <a
          href={`mailto:${correo}`}
          className="mt-1 block text-xl font-semibold underline underline-offset-4"
        >
          {correo}
        </a>
      </div>

      <h2>What to write to us about</h2>
      <ul>
        <li>
          <strong>Something is broken:</strong> tell us what you did and what you expected to
          happen. A screenshot helps if you have one.
        </li>
        <li>
          <strong>Deleting your account:</strong> write from the address linked to it and we&rsquo;ll
          delete your account along with all your groups and expenses.
        </li>
        <li>
          <strong>A calculation that doesn&rsquo;t add up:</strong> send us the amounts. If there&rsquo;s
          an error in the split, we want to know.
        </li>
        <li>
          <strong>Ideas:</strong> a good part of what exists today came from suggestions by people
          who use it.
        </li>
      </ul>

      <h2>Before you write</h2>
      <p>Your question may already be answered. These are the ones we get most:</p>
      <ul>
        <li>
          <Link href={RUTAS.despensa.en} className="underline underline-offset-4">
            How to split a grocery run paid with a single card
          </Link>
        </li>
        <li>
          <Link href={RUTAS.viaje.en} className="underline underline-offset-4">
            How to split trip expenses
          </Link>
        </li>
        <li>
          <Link href={RUTAS.privacidad.en} className="underline underline-offset-4">
            What data we store and for how long
          </Link>
        </li>
      </ul>

      <h2>About your security</h2>
      <p>
        We will never ask you for your password or for the 6-digit code that arrives by email. If
        you get a message claiming to be from us that asks for either, it isn&rsquo;t ours — let us
        know.
      </p>
    </PaginaContenido>
  );
}
