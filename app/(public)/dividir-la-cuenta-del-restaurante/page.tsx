import type { Metadata } from "next";

import { Calculadora } from "../components/calculadora";
import {
  PaginaContenido,
  metadatosDeContenido,
  type Pregunta,
} from "../components/pagina-contenido";

export const metadata: Metadata = metadatosDeContenido("restaurante", "es");

const PREGUNTAS: Pregunta[] = [
  {
    pregunta: "¿La propina se divide igual que la comida?",
    respuesta:
      "Lo más justo es repartirla en la misma proporción que consumió cada quien: si alguien pidió el doble, aporta el doble de propina. Anótala como una línea aparte con reparto por partes y queda proporcional sin hacer cuentas.",
  },
  {
    pregunta: "¿Qué hago con lo que se compartió en el centro de la mesa?",
    respuesta:
      "Anótalo como una línea propia dividida entre todos, y deja los platos individuales en líneas separadas. Mezclar ambas cosas es lo que descuadra el reparto.",
  },
  {
    pregunta: "¿Y si alguien no tomó alcohol?",
    respuesta:
      "Pon las bebidas alcohólicas en su propia línea marcada solo para quienes tomaron. Es el reclamo más común en una mesa y se resuelve con una línea extra.",
  },
  {
    pregunta: "¿Sirve si pagamos entre dos tarjetas?",
    respuesta:
      "Sí. Marca a las dos personas como pagadoras y anota cuánto puso cada una. El sistema calcula los saldos considerando lo que cada quien adelantó.",
  },
];

export default function DividirLaCuentaDelRestaurante() {
  return (
    <PaginaContenido clave="restaurante" preguntas={PREGUNTAS} conRelacionadas>
      <p>
        La cuenta llega a la mesa y empieza el ritual: alguien la toma, la mira de reojo y propone
        dividir entre el número de personas. Casi siempre hay uno que se queda callado aunque pidió
        solo una sopa, y otro que agradece en silencio porque pidió entrada, plato fuerte y postre.
      </p>

      <h2>Dividir en partes iguales es cómodo, no justo</h2>
      <p>
        Funciona bien cuando todos pidieron parecido. Deja de funcionar en cuanto hay diferencias
        reales de consumo, y las hay casi siempre: quien no toma alcohol en una mesa donde corrieron
        tres botellas está pagando una parte considerable de algo que ni probó.
      </p>
      <p>
        La buena noticia es que separar la cuenta bien no toma más de un minuto si lo haces por
        bloques en vez de línea por línea del ticket.
      </p>

      <h2>Separa la mesa en tres bloques</h2>
      <ul>
        <li>
          <strong>Lo del centro:</strong> entradas para picar, la canasta de pan, lo que se compartió.
          Una línea, dividida entre todos.
        </li>
        <li>
          <strong>Los platos individuales:</strong> cada quien con lo suyo. Si varias personas
          pidieron lo mismo, una línea marcada para ese grupo.
        </li>
        <li>
          <strong>Las bebidas:</strong> casi siempre conviene separarlas, sobre todo el alcohol.
        </li>
      </ul>

      <h2>La propina, proporcional</h2>
      <p>
        Repartir la propina en partes iguales tiene el mismo problema que repartir la comida así:
        castiga a quien consumió menos. La forma proporcional es sencilla: usa el reparto por partes
        con el mismo peso que tuvo el consumo de cada quien. Quien pidió el doble aporta el doble de
        propina, sin que nadie tenga que sacar porcentajes en el celular.
      </p>

      <h2>Y si nadie quiere hacer transferencias en la mesa</h2>
      <p>
        No hace falta. Anota la cuenta, deja que una sola persona pague al restaurante y comparte el
        resultado: cada quien sabe exactamente cuánto transferirle y a quién. Con seis personas eso
        suelen ser dos o tres transferencias en total, no quince.
      </p>

      <h2>Prueba con la cuenta de hoy</h2>
      <p>
        Agrega a quienes estuvieron en la mesa y anota los bloques. Toma menos de lo que tarda en
        llegar el datáfono.
      </p>

      <div className="not-prose">
        <Calculadora tipoInicial="VIAJE_REUNION" />
      </div>
    </PaginaContenido>
  );
}
