import type { Metadata } from "next";

import { Calculadora } from "../../components/calculadora";
import {
  PaginaContenido,
  metadatosDeContenido,
  type Pregunta,
} from "../../components/pagina-contenido";

export const metadata: Metadata = metadatosDeContenido("viaje", "en");

const PREGUNTAS: Pregunta[] = [
  {
    pregunta: "What if someone joined the trip halfway through?",
    respuesta:
      "Add them as a member and check them only on the expenses they were actually there for. Earlier expenses keep splitting among the people who were already there, and the math adjusts on its own.",
  },
  {
    pregunta: "How do I handle lodging if someone stayed fewer nights?",
    respuesta:
      "Use the split-by-shares option: whoever stayed two nights gets 2 shares and whoever stayed one gets 1. The total divides proportionally without you working out a nightly rate.",
  },
  {
    pregunta: "What if two people split the gas?",
    respuesta:
      "Mark both of them as payers and enter how much each one put in. Everyone gets credited for exactly what came out of their own pocket.",
  },
  {
    pregunta: "Can I run the trip in another currency?",
    respuesta:
      "Yes — you pick the group's currency when you create it. Every expense on that trip is recorded and settled in that same currency.",
  },
];

export default function SplitTripExpenses() {
  return (
    <PaginaContenido clave="viaje" preguntas={PREGUNTAS} conRelacionadas>
      <p>
        On a trip the problem isn&rsquo;t the money, it&rsquo;s the memory. One person filled the
        tank, someone else put the Airbnb on their card, a third covered museum tickets, and three
        people skipped dinner on the second night. By the time you&rsquo;re home nobody remembers
        the details, and the conversation ends in a &ldquo;let&rsquo;s just call it even&rdquo; that
        almost always leaves somebody short.
      </p>

      <h2>Why splitting everything evenly goes wrong</h2>
      <p>
        The usual shortcut is to add up the whole trip and divide by the number of people. That only
        works if absolutely everyone took part in absolutely everything, which is almost never the
        case. Two people staying in one night is enough for an even split to charge them for
        something they never had.
      </p>
      <p>
        The right way is to log each expense separately with two pieces of information: who put up
        the money, and who it gets split among. Those are different things, and confusing them is
        where nearly every argument comes from.
      </p>

      <h2>The four splits you&rsquo;ll actually need</h2>
      <ul>
        <li>
          <strong>Equal shares:</strong> the default. Dinner among the six people who went.
        </li>
        <li>
          <strong>Exact amounts:</strong> when you already know what each person owes, like an
          itemized check.
        </li>
        <li>
          <strong>Percentages:</strong> useful when a couple takes on a different fraction of the
          total.
        </li>
        <li>
          <strong>By shares:</strong> the best one for lodging. Two nights is 2 shares, one night is
          1.
        </li>
      </ul>

      <h2>When several people cover one expense</h2>
      <p>
        It happens constantly: two people split dinner because one of them was short on cash.
        Recording that as if a single person paid distorts both of their balances. Mark both as
        payers and enter what each one put in — who consumed what is entirely separate from who
        fronted the money.
      </p>

      <h2>Close out the trip with the fewest transfers</h2>
      <p>
        At the end you don&rsquo;t need everyone paying everyone. With six people that would be up
        to fifteen transfers. Once you net out each person&rsquo;s balance it usually comes down to
        two or three: whoever ended up in the red sends money straight to whoever ended up in the
        black, and that&rsquo;s it.
      </p>

      <h2>Try it with your trip</h2>
      <p>
        Add the people and the expenses below. No account, nothing to install, and the result tells
        you exactly who sends money to whom.
      </p>

      <div className="not-prose">
        <Calculadora tipoInicial="VIAJE_REUNION" />
      </div>
    </PaginaContenido>
  );
}
