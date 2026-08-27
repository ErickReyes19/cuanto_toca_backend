import type { Metadata } from "next";

import { adsenseEstaConfigurado } from "@/lib/adsense";
import { getCorreoContacto } from "@/lib/contenido";
import { SITIO } from "@/lib/site";
import { PaginaContenido, metadatosDeContenido } from "../../components/pagina-contenido";

export const metadata: Metadata = metadatosDeContenido("privacidad", "en");

export default function Privacy() {
  const correo = getCorreoContacto();
  const conAnuncios = adsenseEstaConfigurado();

  return (
    <PaginaContenido clave="privacidad" conFecha>
      <h2>Who we are</h2>
      <p>
        {SITIO.nombre} is a tool for splitting expenses among several people, available at{" "}
        {SITIO.url}. For any question about this policy you can write to {correo}.
      </p>

      <h2>What data we collect</h2>
      <h3>If you use the calculator without an account</h3>
      <p>
        We collect nothing. The draft with the names and expenses you enter is stored only in your
        browser&rsquo;s local storage and is never sent to our servers. If you clear your browser
        data, that draft is gone.
      </p>

      <h3>If you create an account</h3>
      <ul>
        <li>Your name and email address.</li>
        <li>Your password, always stored hashed with bcrypt. Never in plain text.</li>
        <li>
          The groups you create: name, currency, members, expenses, who paid each one, and the
          payments recorded between people.
        </li>
        <li>The date of your last login and your last activity.</li>
      </ul>

      <h3>If you sign in with Google</h3>
      <p>
        We receive your account identifier, your email, your name and the URL of your profile photo
        from Google. We have no access to your Google password or to any other data in your account.
      </p>

      <h2>Cookies we use</h2>
      <ul>
        <li>
          <strong>Session:</strong> a technical cookie that keeps you logged in for 6 hours. Without
          it you can&rsquo;t use your account.
        </li>
        <li>
          <strong>Two-step verification:</strong> temporary 10-minute cookies while you confirm the
          code we email you.
        </li>
        <li>
          <strong>Preferences:</strong> remembers whether you left the sidebar open or closed.
        </li>
        {conAnuncios ? (
          <li>
            <strong>Advertising:</strong> Google and its partners use cookies to serve ads. More
            detail in the next section.
          </li>
        ) : null}
      </ul>
      <p>We don&rsquo;t use our own analytics or cross-site tracking cookies.</p>

      <h2>Emails we send</h2>
      <p>
        We only send transactional email: the 6-digit code to log in or confirm your registration,
        and the link to reset your password. We don&rsquo;t send marketing and we don&rsquo;t give
        your address to third parties so they can write to you.
      </p>

      {conAnuncios ? (
        <>
          <h2>Google advertising</h2>
          <ul>
            <li>Google, as a third-party vendor, uses cookies to serve ads on this site.</li>
            <li>
              Google&rsquo;s use of the DART cookie enables it to serve ads based on your visits to
              this and other sites on the internet.
            </li>
            <li>
              You can opt out of personalized advertising by visiting{" "}
              <a
                href="https://www.google.com/settings/ads"
                rel="noopener noreferrer nofollow"
                target="_blank"
                className="underline underline-offset-4"
              >
                Google Ads Settings
              </a>
              , or opt out of third-party vendor cookies at{" "}
              <a
                href="https://www.aboutads.info/choices/"
                rel="noopener noreferrer nofollow"
                target="_blank"
                className="underline underline-offset-4"
              >
                aboutads.info
              </a>
              .
            </li>
          </ul>
        </>
      ) : null}

      <h2>Who we share data with</h2>
      <p>
        We don&rsquo;t sell or trade your data. It&rsquo;s only processed by the providers that keep
        the service running, each with its own privacy policy:
      </p>
      <ul>
        <li>Application hosting and content delivery.</li>
        <li>Managed database, where your groups and expenses are stored.</li>
        <li>Transactional email delivery, for the access codes.</li>
        <li>
          Google, if you choose to sign in with your account
          {conAnuncios ? " and for advertising" : ""}.
        </li>
      </ul>

      <h2>How long we keep it</h2>
      <p>
        Your groups and expenses are kept for as long as your account exists. Access codes expire
        after 10 minutes and are invalidated once used. Registrations awaiting confirmation are
        discarded if they aren&rsquo;t completed.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask at any time to access your data, correct it, or delete your account along with
        everything in it. Write to {correo} from the address linked to your account and we&rsquo;ll
        take care of it.
      </p>

      <h2>Children</h2>
      <p>
        The service is not directed at children under 13 and we do not knowingly collect data from
        them.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If we change anything meaningful, we&rsquo;ll update the date at the top. We recommend
        checking back from time to time.
      </p>
    </PaginaContenido>
  );
}
