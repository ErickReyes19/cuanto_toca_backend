import type { Metadata } from "next";

import { casosRelacionados } from "@/lib/contenido";
import { Calculadora } from "../components/calculadora";
import { PaginaContenido, type Pregunta } from "../components/pagina-contenido";

const RUTA = "/dividir-la-despensa";
const TITULO = "Cómo dividir la despensa entre varias personas";
const ENTRADILLA =
  "Una sola tarjeta paga todo el súper, pero el shampoo es de uno, las cervezas de dos y el arroz de todos. Así se reparte producto por producto sin discutir.";

export const metadata: Metadata = {
  title: "Dividir la despensa entre varias personas",
  description: ENTRADILLA,
  alternates: { canonical: RUTA },
};

const PREGUNTAS: Pregunta[] = [
  {
    pregunta: "¿Tengo que anotar los 40 productos del ticket?",
    respuesta:
      "No. Anota por bloques: lo compartido en una sola línea con su total, y aparte cada producto que sea de una o dos personas. Con tres o cuatro líneas suele quedar resuelto un súper completo.",
  },
  {
    pregunta: "¿Qué pasa con el IVA y los descuentos del ticket?",
    respuesta:
      "Lo más simple es anotar los montos ya con impuesto incluido, tal como aparecen en el ticket. Así la suma de tus líneas cuadra con lo que realmente cobró la tarjeta.",
  },
  {
    pregunta: "¿Se pierden centavos cuando un producto no se divide exacto?",
    respuesta:
      "No. El residuo se reparte hasta el último centavo, de modo que la suma de las partes siempre da exactamente el total del producto y del ticket.",
  },
  {
    pregunta: "¿Sirve si cada quien pagó una parte con su propia tarjeta?",
    respuesta:
      "Sí. Puedes marcar a varias personas como pagadoras del ticket y anotar cuánto puso cada una, aunque el reparto de los productos sea completamente distinto.",
  },
];

export default function DividirLaDespensa() {
  return (
    <PaginaContenido
      ruta={RUTA}
      titulo={TITULO}
      entradilla={ENTRADILLA}
      preguntas={PREGUNTAS}
      relacionadas={casosRelacionados(RUTA)}
    >
      <p>
        El súper compartido tiene una particularidad que lo distingue de casi cualquier otro gasto:
        el pago es uno solo, pero el contenido del carrito pertenece a personas distintas. Sale un
        total de la tarjeta y dentro hay tres realidades mezcladas: lo que consume todo el mundo, lo
        que consumen dos, y lo que es claramente de una sola persona.
      </p>

      <h2>Por qué dividir el total entre todos sale mal</h2>
      <p>
        Si el ticket dio 1,220 y son cuatro personas, dividirlo en 305 por cabeza parece justo hasta
        que revisas el carrito. Ahí adentro iban 120 de un shampoo que usa una sola persona y 300 de
        cervezas que se tomaron dos. Dividir en partes iguales significa que quien no toma ni usa ese
        shampoo está subsidiando a los demás cada quincena.
      </p>
      <p>
        Con el tiempo esa diferencia deja de ser trivial. Cuatro quincenas de ese mismo carrito son
        más de mil de diferencia acumulada, y es justo el tipo de cosa que nadie reclama pero todo el
        mundo nota.
      </p>

      <h2>Reparte por bloques, no producto por producto</h2>
      <p>
        No hace falta transcribir el ticket completo. En la práctica un súper se resuelve con tres o
        cuatro líneas:
      </p>
      <ul>
        <li>
          <strong>Despensa común</strong> — arroz, aceite, papel, limpieza: una línea con el total,
          marcada para todos.
        </li>
        <li>
          <strong>Lo de una persona</strong> — el shampoo, esa marca de café: una línea marcada solo
          para quien lo consume.
        </li>
        <li>
          <strong>Lo de dos o tres</strong> — cervezas, snacks: una línea marcada para ese subgrupo.
        </li>
      </ul>
      <p>
        Cada línea se divide en partes iguales solo entre las personas marcadas, y al final se suma
        cuánto le corresponde a cada quien del ticket completo.
      </p>

      <h2>Un ejemplo con números</h2>
      <p>
        Ticket de 1,220 pagado con la tarjeta de Ana, entre Ana, Luis, Mario y Sofía:
      </p>
      <ul>
        <li>Despensa común, 800, entre los cuatro: 200 cada uno.</li>
        <li>Shampoo de Ana, 120, solo para ella.</li>
        <li>Cervezas, 300, entre Luis y Mario: 150 cada uno.</li>
      </ul>
      <p>
        Resultado: a Ana le tocaban 320, a Luis y Mario 350 cada uno, y a Sofía 200. Como Ana puso
        los 1,220 completos, le quedan debiendo 900 en total. Nada de eso sale de dividir entre
        cuatro.
      </p>

      <h2>Hazlo con tu ticket</h2>
      <p>
        Agrega a las personas de tu casa y anota los bloques de tu último súper. Si quieres que
        quede guardado y que cada quincena parta de la lista anterior, puedes crear una cuenta
        gratis, pero para calcularlo ahora no hace falta.
      </p>

      <div className="not-prose">
        <Calculadora tipoInicial="DESPENSA_FAMILIAR" />
      </div>
    </PaginaContenido>
  );
}
