import type { Metadata } from "next";

import { adsenseEstaConfigurado } from "@/lib/adsense";
import { getCorreoContacto } from "@/lib/contenido";
import { SITIO } from "@/lib/site";
import { PaginaContenido } from "../components/pagina-contenido";

const RUTA = "/privacidad";
const ENTRADILLA =
  "Qué datos guarda Cuánto Toca, para qué los usa, con quién se comparten y cómo pedir que se borren.";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: ENTRADILLA,
  alternates: { canonical: RUTA },
};

const ACTUALIZADO = "27 de agosto de 2026";

export default function Privacidad() {
  const correo = getCorreoContacto();
  const conAnuncios = adsenseEstaConfigurado();

  return (
    <PaginaContenido ruta={RUTA} titulo="Política de privacidad" entradilla={ENTRADILLA}>
      <p className="text-sm text-muted-foreground">Última actualización: {ACTUALIZADO}</p>

      <h2>Quiénes somos</h2>
      <p>
        {SITIO.nombre} es una herramienta para dividir gastos entre varias personas, disponible en{" "}
        {SITIO.url}. Para cualquier consulta sobre esta política puedes escribir a {correo}.
      </p>

      <h2>Qué datos recogemos</h2>
      <h3>Si usas la calculadora sin cuenta</h3>
      <p>
        No recogemos nada. El borrador con los nombres y los gastos que anotas se guarda únicamente
        en el almacenamiento local de tu navegador y nunca se envía a nuestros servidores. Si borras
        los datos del navegador, ese borrador desaparece.
      </p>

      <h3>Si creas una cuenta</h3>
      <ul>
        <li>Tu nombre y tu correo electrónico.</li>
        <li>Tu contraseña, guardada siempre cifrada con bcrypt. Nunca en texto plano.</li>
        <li>
          Los grupos que creas: nombre, moneda, integrantes, gastos, quién pagó cada uno y los pagos
          registrados entre personas.
        </li>
        <li>Fecha de tu último inicio de sesión y de tu última actividad.</li>
      </ul>

      <h3>Si entras con Google</h3>
      <p>
        Recibimos de Google tu identificador de cuenta, tu correo, tu nombre y la URL de tu foto de
        perfil. No tenemos acceso a tu contraseña de Google ni a ningún otro dato de tu cuenta.
      </p>

      <h2>Cookies que usamos</h2>
      <ul>
        <li>
          <strong>Sesión:</strong> una cookie técnica que mantiene tu sesión abierta durante 6 horas.
          Sin ella no puedes usar tu cuenta.
        </li>
        <li>
          <strong>Verificación en dos pasos:</strong> cookies temporales de 10 minutos mientras
          confirmas el código que te enviamos por correo.
        </li>
        <li>
          <strong>Preferencias:</strong> recuerda si dejaste el menú lateral abierto o cerrado.
        </li>
        {conAnuncios ? (
          <li>
            <strong>Publicidad:</strong> Google y sus socios usan cookies para mostrar anuncios. Más
            detalle en la sección siguiente.
          </li>
        ) : null}
      </ul>
      <p>
        No usamos cookies de analítica ni de seguimiento entre sitios propias.
      </p>

      <h2>Correos que enviamos</h2>
      <p>
        Solo enviamos correos transaccionales: el código de 6 dígitos para iniciar sesión o
        confirmar tu registro, y el enlace para restablecer tu contraseña. No enviamos publicidad ni
        cedemos tu correo a terceros para que te escriban.
      </p>

      {conAnuncios ? (
        <>
          <h2>Publicidad de Google</h2>
          <ul>
            <li>
              Google, como proveedor externo, utiliza cookies para mostrar anuncios en este sitio.
            </li>
            <li>
              El uso de la cookie DART permite a Google mostrar anuncios basados en tus visitas a
              este y otros sitios de internet.
            </li>
            <li>
              Puedes desactivar la publicidad personalizada visitando la{" "}
              <a
                href="https://www.google.com/settings/ads"
                rel="noopener noreferrer nofollow"
                target="_blank"
                className="underline underline-offset-4"
              >
                configuración de anuncios de Google
              </a>
              , o desactivar las cookies de proveedores externos en{" "}
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

      <h2>Con quién compartimos los datos</h2>
      <p>
        No vendemos ni cedemos tus datos. Solo los procesan los proveedores que hacen funcionar el
        servicio, cada uno con su propia política de privacidad:
      </p>
      <ul>
        <li>Alojamiento de la aplicación y entrega de contenido.</li>
        <li>Base de datos gestionada, donde se guardan tus grupos y gastos.</li>
        <li>Envío de correo transaccional, para los códigos de acceso.</li>
        <li>Google, si eliges iniciar sesión con tu cuenta{conAnuncios ? " y para la publicidad" : ""}.</li>
      </ul>

      <h2>Cuánto tiempo los conservamos</h2>
      <p>
        Tus grupos y gastos se conservan mientras tu cuenta exista. Los códigos de acceso caducan a
        los 10 minutos y quedan inutilizados tras usarse. Los registros pendientes de confirmación
        se descartan si no se completan.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Puedes pedir en cualquier momento acceder a tus datos, corregirlos o eliminar tu cuenta con
        todo su contenido. Escríbenos a {correo} desde el correo asociado a tu cuenta y lo
        gestionamos.
      </p>

      <h2>Menores de edad</h2>
      <p>
        El servicio no está dirigido a menores de 13 años y no recogemos datos de forma consciente
        de ellos.
      </p>

      <h2>Cambios en esta política</h2>
      <p>
        Si cambiamos algo relevante, actualizaremos la fecha del encabezado. Te recomendamos
        revisarla de vez en cuando.
      </p>
    </PaginaContenido>
  );
}
