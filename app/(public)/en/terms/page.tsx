import type { Metadata } from "next";

import { getCorreoContacto } from "@/lib/contenido";
import { SITIO } from "@/lib/site";
import { PaginaContenido, metadatosDeContenido } from "../../components/pagina-contenido";

export const metadata: Metadata = metadatosDeContenido("terminos", "en");

export default function Terms() {
  const correo = getCorreoContacto();

  return (
    <PaginaContenido clave="terminos" conFecha>
      <h2>What this service is</h2>
      <p>
        {SITIO.nombre} is a calculation tool that helps you split expenses among several people and
        see who owes who. By using {SITIO.url} you accept these terms.
      </p>

      <h2>We don&rsquo;t move money</h2>
      <p>
        This matters and is worth saying plainly: the service <strong>calculates</strong> what each
        person owes, but it doesn&rsquo;t process payments, transfer funds, or take part in any
        transaction between the people in a group. Recording a payment here means noting something
        you did on your own.
      </p>
      <p>
        We are not a financial institution or a payment intermediary, and we don&rsquo;t provide
        financial, accounting or legal advice.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>
          You need a valid email address, and you&rsquo;re responsible for keeping your password
          private.
        </li>
        <li>
          The 6-digit codes we send are personal. Don&rsquo;t share them: nobody on our team will
          ever ask you for one.
        </li>
        <li>
          If you notice activity you don&rsquo;t recognize, write to {correo} and change your
          password.
        </li>
      </ul>

      <h2>Acceptable use</h2>
      <p>By using the service you agree not to:</p>
      <ul>
        <li>Create accounts with email addresses you don&rsquo;t control, or impersonate anyone.</li>
        <li>Attempt to access other people&rsquo;s groups or data.</li>
        <li>
          Automate requests in a way that degrades the service for others, or try to work around
          usage limits.
        </li>
        <li>Upload illegal content or use group names to harass anyone.</li>
      </ul>
      <p>
        We may suspend an account that breaks the above, normally with notice first unless the
        violation is serious.
      </p>

      <h2>Accuracy of the calculations</h2>
      <p>
        We take care that the numbers add up to the cent, but the result depends entirely on the
        information you enter. Always check the amounts before settling: we&rsquo;re not responsible
        for splits made on incorrect data, or for the agreements between the people in a group.
      </p>

      <h2>Availability</h2>
      <p>
        The service is offered as is, with no guarantee of uninterrupted availability. We may change
        or discontinue features. If we&rsquo;re going to shut down, we&rsquo;ll give reasonable
        notice so you can keep your information.
      </p>

      <h2>Content and ownership</h2>
      <p>
        The data you enter is yours. The design, the code and the brand of the service are ours.
      </p>

      <h2>Closing your account</h2>
      <p>
        You can request deletion of your account and all your groups at any time by writing to{" "}
        {correo} from the address linked to it.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        If we change them, we&rsquo;ll update the date at the top. Continuing to use the service
        after a change means you accept it.
      </p>
    </PaginaContenido>
  );
}
