import type { Metadata } from "next";

import { Calculadora } from "../../components/calculadora";
import {
  PaginaContenido,
  metadatosDeContenido,
  type Pregunta,
} from "../../components/pagina-contenido";

export const metadata: Metadata = metadatosDeContenido("restaurante", "en");

const PREGUNTAS: Pregunta[] = [
  {
    pregunta: "Should the tip be split the same way as the food?",
    respuesta:
      "The fairest approach is to split it in proportion to what each person ordered: if someone ordered twice as much, they cover twice the tip. Enter it as its own line using the split-by-shares option and it comes out proportional without any math.",
  },
  {
    pregunta: "What do I do with the stuff we shared in the middle of the table?",
    respuesta:
      "Enter it as its own line split among everyone, and keep individual plates on separate lines. Mixing the two is what throws the split off.",
  },
  {
    pregunta: "What if someone didn't drink?",
    respuesta:
      "Put alcohol on its own line, checked only for the people who drank. It's the most common complaint at a table and one extra line solves it.",
  },
  {
    pregunta: "Does it work if we paid with two cards?",
    respuesta:
      "Yes. Mark both people as payers and enter how much each one put in. The balances account for what each person fronted.",
  },
];

export default function SplitRestaurantBill() {
  return (
    <PaginaContenido clave="restaurante" preguntas={PREGUNTAS} conRelacionadas>
      <p>
        The check lands on the table and the ritual begins: someone picks it up, glances at it, and
        suggests dividing by the number of people. There&rsquo;s almost always one person who stays
        quiet even though they only ordered a soup, and another who silently says nothing because
        they had an appetizer, an entrée and dessert.
      </p>

      <h2>An even split is convenient, not fair</h2>
      <p>
        It works fine when everyone ordered roughly the same. It stops working the moment there are
        real differences in what people consumed — and there almost always are. Someone who
        doesn&rsquo;t drink, at a table that went through three bottles of wine, is covering a
        meaningful share of something they never touched.
      </p>
      <p>
        The good news is that splitting the check properly takes under a minute if you do it in
        blocks instead of line by line off the receipt.
      </p>

      <h2>Break the table into three blocks</h2>
      <ul>
        <li>
          <strong>The middle of the table:</strong> apps to share, the bread basket, anything
          communal. One line, split among everyone.
        </li>
        <li>
          <strong>Individual plates:</strong> each person&rsquo;s own. If several people ordered the
          same thing, one line checked for that group.
        </li>
        <li>
          <strong>Drinks:</strong> almost always worth separating, especially alcohol.
        </li>
      </ul>

      <h2>Tip, in proportion</h2>
      <p>
        Splitting the tip evenly has the same problem as splitting the food evenly: it penalizes
        whoever ordered less. The proportional way is simple — use the split-by-shares option with
        the same weights as what each person consumed. Whoever ordered twice as much covers twice
        the tip, and nobody has to work out percentages on their phone.
      </p>

      <h2>And if nobody wants to send money at the table</h2>
      <p>
        They don&rsquo;t have to. Log the check, let one person pay the restaurant, and share the
        result: everyone knows exactly how much to send and to whom. With six people that&rsquo;s
        usually two or three transfers total, not fifteen.
      </p>

      <h2>Try it with tonight&rsquo;s check</h2>
      <p>
        Add the people who were at the table and enter the blocks. It takes less time than waiting
        for the card reader to come back.
      </p>

      <div className="not-prose">
        <Calculadora tipoInicial="VIAJE_REUNION" />
      </div>
    </PaginaContenido>
  );
}
