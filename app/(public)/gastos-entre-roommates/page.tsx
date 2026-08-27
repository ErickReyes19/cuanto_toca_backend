import type { Metadata } from "next";

import { Calculadora } from "../components/calculadora";
import {
  PaginaContenido,
  metadatosDeContenido,
  type Pregunta,
} from "../components/pagina-contenido";

export const metadata: Metadata = metadatosDeContenido("roommates", "es");

const PREGUNTAS: Pregunta[] = [
  {
    pregunta: "¿La renta se divide igual si los cuartos son distintos?",
    respuesta:
      "No tiene por qué. Usa el reparto por porcentaje o por partes: si un cuarto es notablemente más grande o tiene baño propio, se le asigna una fracción mayor. Lo importante es acordarlo una vez y que quede registrado.",
  },
  {
    pregunta: "¿Qué hago si alguien se va a mitad de mes?",
    respuesta:
      "Registra los gastos de ese mes marcándolo solo en los que le corresponden. Para la renta puedes usar el reparto por partes proporcional a los días que estuvo.",
  },
  {
    pregunta: "¿Conviene liquidar cada mes o dejar el saldo corriendo?",
    respuesta:
      "Liquidar cada mes. Los saldos acumulados durante meses son la fuente número uno de discusiones, porque nadie recuerda de dónde salió el número y revisarlo cuesta más que pagarlo.",
  },
  {
    pregunta: "¿Puedo registrar que ya le pagué a alguien?",
    respuesta:
      "Sí. Al registrar un pago entre dos personas, el saldo se ajusta y deja de aparecer como deuda pendiente. Así el mes siguiente arranca limpio.",
  },
];

export default function GastosEntreRoommates() {
  return (
    <PaginaContenido clave="roommates" preguntas={PREGUNTAS} conRelacionadas>
      <p>
        Compartir vivienda tiene una diferencia importante con un viaje: no termina. Un viaje se
        liquida al volver y se olvida; los gastos de una casa se repiten cada mes, se acumulan y
        arrastran el desorden del mes anterior. Por eso el sistema que uses tiene que aguantar la
        repetición, no solo un evento aislado.
      </p>

      <h2>Separa lo fijo de lo variable</h2>
      <p>
        Los gastos de una casa compartida no son todos iguales y tratarlos igual es el primer error:
      </p>
      <ul>
        <li>
          <strong>Fijos e iguales para todos:</strong> internet, streaming. Se dividen en partes
          iguales y no dan problema.
        </li>
        <li>
          <strong>Fijos pero desiguales:</strong> la renta, cuando los cuartos no son equivalentes.
          Se resuelve con porcentajes acordados una sola vez.
        </li>
        <li>
          <strong>Variables:</strong> luz, agua, gas. Cambian cada mes y normalmente se dividen
          igual, salvo que alguien tenga un consumo claramente distinto.
        </li>
        <li>
          <strong>Súper:</strong> el más conflictivo, porque mezcla lo común con lo personal.
        </li>
      </ul>

      <h2>La renta cuando los cuartos son distintos</h2>
      <p>
        Es la conversación incómoda que conviene tener una vez y no cada mes. Si un cuarto tiene
        baño propio o el doble de espacio, dividir la renta en partes iguales genera un resentimiento
        silencioso que aparece meses después por otro motivo cualquiera.
      </p>
      <p>
        Acuerden los porcentajes al principio —60/40, 40/35/25, lo que sea justo para ustedes— y
        déjenlo registrado. A partir de ahí el cálculo es automático y nadie tiene que volver a
        negociarlo.
      </p>

      <h2>El súper: lo común y lo personal</h2>
      <p>
        Es donde más se pelea, y casi siempre por el mismo motivo: se mete todo en una bolsa común
        aunque el carrito tenga cosas que solo consume una persona. La regla práctica es anotar el
        ticket en dos o tres bloques: lo compartido para todos, y lo personal marcado solo para
        quien lo consume. Lo explicamos en detalle en la página de{" "}
        <a href="/dividir-la-despensa" className="underline underline-offset-4">
          cómo dividir la despensa
        </a>
        .
      </p>

      <h2>Liquiden cada mes, sin excepciones</h2>
      <p>
        El saldo que se arrastra es deuda emocional, no solo contable. Cuando pasan tres meses sin
        cerrar, el número deja de ser verificable para todos y empieza a discutirse por sensación en
        vez de por datos. Cerrar cada mes toma dos minutos y evita esa conversación por completo.
      </p>
      <p>
        Al liquidar, no hace falta que todos le paguen a todos: con el saldo neto de cada quien
        suelen bastar una o dos transferencias.
      </p>

      <h2>Empieza con el mes actual</h2>
      <p>
        Agrega a tus roommates y anota los gastos de este mes. Si quieren que quede guardado y que
        cada uno pueda registrar lo que paga desde su propio celular, pueden crear un grupo con
        cuenta gratis y compartir el enlace de invitación.
      </p>

      <div className="not-prose">
        <Calculadora tipoInicial="DESPENSA_FAMILIAR" />
      </div>
    </PaginaContenido>
  );
}
