import type { Metadata } from "next";

import { Calculadora } from "../../components/calculadora";
import {
  PaginaContenido,
  metadatosDeContenido,
  type Pregunta,
} from "../../components/pagina-contenido";

export const metadata: Metadata = metadatosDeContenido("despensa", "en");

const PREGUNTAS: Pregunta[] = [
  {
    pregunta: "Do I have to enter all 40 items on the receipt?",
    respuesta:
      "No. Enter it in blocks: everything shared goes on one line with its total, then a separate line for each item that belongs to one or two people. Three or four lines usually covers an entire grocery run.",
  },
  {
    pregunta: "What about sales tax and coupons?",
    respuesta:
      "The simplest approach is to enter amounts exactly as they appear on the receipt, tax included. That way your lines add up to what the card was actually charged.",
  },
  {
    pregunta: "Do cents get lost when an item doesn't divide evenly?",
    respuesta:
      "No. The remainder is distributed down to the last cent, so the parts always add up to exactly the item total and the receipt total.",
  },
  {
    pregunta: "Does it work if everyone paid part of it with their own card?",
    respuesta:
      "Yes. You can mark several people as payers of the receipt and enter how much each one put in, even though the items themselves are split completely differently.",
  },
];

export default function SplitGroceryBill() {
  return (
    <PaginaContenido clave="despensa" preguntas={PREGUNTAS} conRelacionadas>
      <p>
        A shared grocery run has one feature that sets it apart from almost every other expense: the
        payment is a single charge, but the contents of the cart belong to different people. One
        total leaves the card, and inside it there are three realities mixed together — what
        everybody uses, what two people use, and what clearly belongs to one person.
      </p>

      <h2>Why dividing the total evenly goes wrong</h2>
      <p>
        If the receipt comes to $122 and there are four of you, splitting it into $30.50 a head
        looks fair until you look in the cart. In there was $12 of shampoo one person uses and $30
        of beer two people drank. An even split means the person who doesn&rsquo;t drink and
        doesn&rsquo;t use that shampoo is subsidizing everyone else, every single week.
      </p>
      <p>
        Over time that gap stops being trivial. Four weeks of the same cart is more than a hundred
        dollars of accumulated difference, and it&rsquo;s exactly the kind of thing nobody brings up
        but everybody notices.
      </p>

      <h2>Split by blocks, not item by item</h2>
      <p>
        You don&rsquo;t need to transcribe the whole receipt. In practice a grocery run comes down to
        three or four lines:
      </p>
      <ul>
        <li>
          <strong>Shared staples</strong> — rice, oil, paper towels, cleaning supplies: one line with
          the total, checked for everyone.
        </li>
        <li>
          <strong>One person&rsquo;s items</strong> — the shampoo, that specific coffee: one line
          checked only for whoever uses it.
        </li>
        <li>
          <strong>Two or three people&rsquo;s items</strong> — beer, snacks: one line checked for
          that subgroup.
        </li>
      </ul>
      <p>
        Each line splits evenly among only the people checked on it, and at the end it adds up what
        each person owes on the receipt as a whole.
      </p>

      <h2>A worked example</h2>
      <p>
        A $122 receipt paid with Ana&rsquo;s card, shared by Ana, Luis, Mario and Sofia:
      </p>
      <ul>
        <li>Shared staples, $80, among all four: $20 each.</li>
        <li>Ana&rsquo;s shampoo, $12, hers alone.</li>
        <li>Beer, $30, between Luis and Mario: $15 each.</li>
      </ul>
      <p>
        The result: Ana owed $32, Luis and Mario $35 each, and Sofia $20. Since Ana fronted the full
        $122, the others owe her $90 between them. None of that comes out of dividing by four.
      </p>

      <h2>Try it with your receipt</h2>
      <p>
        Add the people in your household and enter the blocks from your last grocery run. If you
        want it saved so each week starts from the previous list, you can create a free account —
        but you don&rsquo;t need one to run the numbers now.
      </p>

      <div className="not-prose">
        <Calculadora tipoInicial="DESPENSA_FAMILIAR" />
      </div>
    </PaginaContenido>
  );
}
