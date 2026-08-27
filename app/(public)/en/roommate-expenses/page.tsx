import type { Metadata } from "next";
import Link from "next/link";

import { RUTAS } from "@/lib/i18n";
import { Calculadora } from "../../components/calculadora";
import {
  PaginaContenido,
  metadatosDeContenido,
  type Pregunta,
} from "../../components/pagina-contenido";

export const metadata: Metadata = metadatosDeContenido("roommates", "en");

const PREGUNTAS: Pregunta[] = [
  {
    pregunta: "Should rent be split evenly if the rooms aren't the same?",
    respuesta:
      "It doesn't have to be. Use the percentage or shares split: if one room is noticeably bigger or has its own bathroom, it gets a larger fraction. What matters is agreeing once and having it written down.",
  },
  {
    pregunta: "What if someone moves out mid-month?",
    respuesta:
      "Log that month's expenses checking them only on the ones that apply to them. For rent you can use the shares split, proportional to the days they were there.",
  },
  {
    pregunta: "Is it better to settle every month or let the balance ride?",
    respuesta:
      "Settle every month. Balances that pile up over months are the number one source of arguments, because nobody remembers where the number came from and checking it costs more than paying it.",
  },
  {
    pregunta: "Can I record that I already paid someone back?",
    respuesta:
      "Yes. When you log a payment between two people the balance adjusts and stops showing as outstanding, so the next month starts clean.",
  },
];

export default function RoommateExpenses() {
  return (
    <PaginaContenido clave="roommates" preguntas={PREGUNTAS} conRelacionadas>
      <p>
        Sharing a place differs from a trip in one important way: it doesn&rsquo;t end. A trip gets
        settled when you get home and then you forget about it; household expenses repeat every
        month, accumulate, and drag last month&rsquo;s mess along with them. Whatever system you use
        has to survive repetition, not just a one-off event.
      </p>

      <h2>Separate fixed from variable</h2>
      <p>
        Household expenses are not all the same, and treating them the same is the first mistake:
      </p>
      <ul>
        <li>
          <strong>Fixed and equal for everyone:</strong> internet, streaming. Split evenly, no
          drama.
        </li>
        <li>
          <strong>Fixed but unequal:</strong> rent, when the rooms aren&rsquo;t equivalent. Solved
          with percentages agreed on once.
        </li>
        <li>
          <strong>Variable:</strong> power, water, gas. They change every month and usually split
          evenly, unless someone&rsquo;s usage is clearly different.
        </li>
        <li>
          <strong>Groceries:</strong> the most contentious one, because it mixes shared items with
          personal ones.
        </li>
      </ul>

      <h2>Rent when the rooms aren&rsquo;t equal</h2>
      <p>
        This is the awkward conversation worth having once instead of every month. If one room has
        its own bathroom or twice the space, splitting rent evenly builds a quiet resentment that
        shows up months later over something else entirely.
      </p>
      <p>
        Agree on the percentages up front — 60/40, 40/35/25, whatever is fair for you — and write it
        down. From there the math is automatic and nobody has to renegotiate.
      </p>

      <h2>Groceries: shared versus personal</h2>
      <p>
        This is where most of the arguing happens, and almost always for the same reason: everything
        goes into one shared pot even though the cart has things only one person uses. The practical
        rule is to enter the receipt in two or three blocks: shared items for everyone, and personal
        items checked only for whoever uses them. We go into detail on{" "}
        <Link href={RUTAS.despensa.en} className="underline underline-offset-4">
          how to split a grocery bill
        </Link>
        .
      </p>

      <h2>Settle every month, no exceptions</h2>
      <p>
        A balance that carries over is emotional debt, not just accounting. After three months
        without closing out, the number stops being verifiable for everyone and starts being argued
        by feel instead of by data. Closing out each month takes two minutes and avoids that
        conversation entirely.
      </p>
      <p>
        When you settle, not everyone needs to pay everyone: netting out each person&rsquo;s balance
        usually leaves one or two transfers.
      </p>

      <h2>Start with this month</h2>
      <p>
        Add your roommates and enter this month&rsquo;s expenses. If you want it saved so each
        person can log what they pay from their own phone, you can create a group with a free
        account and share the invite link.
      </p>

      <div className="not-prose">
        <Calculadora tipoInicial="DESPENSA_FAMILIAR" />
      </div>
    </PaginaContenido>
  );
}
