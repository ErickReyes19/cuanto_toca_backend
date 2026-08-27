import type { Metadata } from "next";

import { Calculadora } from "../components/calculadora";
import {
  PaginaContenido,
  metadatosDeContenido,
  type Pregunta,
} from "../components/pagina-contenido";

export const metadata: Metadata = metadatosDeContenido("viaje", "es");

const PREGUNTAS: Pregunta[] = [
  {
    pregunta: "¿Qué hago si alguien se sumó al viaje a mitad de camino?",
    respuesta:
      "Agrégalo como integrante y márcalo solo en los gastos desde los que estuvo presente. Los gastos anteriores se siguen dividiendo entre quienes ya estaban, y el cálculo se ajusta solo.",
  },
  {
    pregunta: "¿Cómo manejo el hospedaje si alguien durmió menos noches?",
    respuesta:
      "Usa el reparto por partes: quien se quedó dos noches lleva 2 partes y quien se quedó una lleva 1. El total se divide en proporción sin que tengas que calcular el precio por noche.",
  },
  {
    pregunta: "¿Y si la gasolina la pusieron entre dos?",
    respuesta:
      "Marca a las dos personas como pagadoras y escribe cuánto puso cada una. A cada quien se le acredita exactamente lo que sacó de su bolsa.",
  },
  {
    pregunta: "¿Puedo llevar el viaje en otra moneda?",
    respuesta:
      "Sí, eliges la moneda del grupo al crearlo. Todos los gastos de ese viaje se registran y se liquidan en esa misma moneda.",
  },
];

export default function DividirGastosDeViaje() {
  return (
    <PaginaContenido clave="viaje" preguntas={PREGUNTAS} conRelacionadas>
      <p>
        En un viaje el problema no es el dinero, es la memoria. Uno puso la gasolina, otro pagó el
        Airbnb con su tarjeta, alguien cubrió las entradas del museo y tres personas se saltaron la
        cena del segundo día. Al volver, nadie se acuerda con precisión y la conversación termina
        en un &ldquo;dejémoslo así&rdquo; que casi siempre deja a alguien perdiendo.
      </p>

      <h2>El error de dividir todo entre todos</h2>
      <p>
        El atajo más común es sumar el total del viaje y dividirlo entre el número de personas.
        Funciona solo si absolutamente todos participaron de absolutamente todo, lo cual casi nunca
        pasa. Basta con que dos personas se hayan quedado sin salir una noche para que ese reparto
        les cobre algo que no consumieron.
      </p>
      <p>
        La forma correcta es registrar cada gasto por separado con dos datos: quién puso el dinero y
        entre quiénes se reparte. Son cosas distintas y confundirlas es de donde salen casi todos los
        reclamos.
      </p>

      <h2>Los cuatro repartos que vas a necesitar</h2>
      <ul>
        <li>
          <strong>Partes iguales:</strong> lo normal. La cena entre los seis que fueron.
        </li>
        <li>
          <strong>Montos exactos:</strong> cuando ya sabes cuánto le toca a cada quien, como una
          cuenta detallada por consumo.
        </li>
        <li>
          <strong>Porcentajes:</strong> útil cuando una pareja asume una fracción distinta del total.
        </li>
        <li>
          <strong>Por partes:</strong> el mejor para el hospedaje. Quien durmió dos noches lleva 2
          partes, quien durmió una lleva 1.
        </li>
      </ul>

      <h2>Cuando el gasto lo cubren entre varios</h2>
      <p>
        Pasa seguido: la cena la pagan entre dos porque a uno no le alcanzaba el efectivo. Registrar
        eso como si hubiera pagado una sola persona distorsiona los saldos de las dos. Marca a ambas
        como pagadoras y anota cuánto puso cada una; el reparto de quién consume qué es independiente
        de quién adelantó el dinero.
      </p>

      <h2>Cierra el viaje con el mínimo de transferencias</h2>
      <p>
        Al final no necesitas que cada persona le pague a cada persona. Con seis personas eso serían
        hasta quince transferencias. Calculando el saldo neto de cada uno, casi siempre se resuelve
        con dos o tres pagos: quienes quedaron en rojo le transfieren directo a quienes quedaron en
        verde, y listo.
      </p>

      <h2>Pruébalo con tu viaje</h2>
      <p>
        Anota a la gente y los gastos aquí abajo. No necesitas cuenta ni instalar nada, y el
        resultado te dice exactamente quién le transfiere a quién.
      </p>

      <div className="not-prose">
        <Calculadora tipoInicial="VIAJE_REUNION" />
      </div>
    </PaginaContenido>
  );
}
