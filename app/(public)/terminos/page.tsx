import type { Metadata } from "next";

import { getCorreoContacto } from "@/lib/contenido";
import { SITIO } from "@/lib/site";
import { PaginaContenido, metadatosDeContenido } from "../components/pagina-contenido";


export const metadata: Metadata = metadatosDeContenido("terminos", "es");

export default function Terminos() {
  const correo = getCorreoContacto();

  return (
    <PaginaContenido clave="terminos" conFecha>
      <h2>Qué es este servicio</h2>
      <p>
        {SITIO.nombre} es una herramienta de cálculo que te ayuda a repartir gastos entre varias
        personas y a saber quién le debe a quién. Al usar {SITIO.url} aceptas estos términos.
      </p>

      <h2>No movemos dinero</h2>
      <p>
        Esto es importante y conviene decirlo sin rodeos: el servicio <strong>calcula</strong>{" "}
        cuánto le corresponde a cada quien, pero no procesa pagos, no transfiere fondos y no
        interviene en ninguna transacción entre las personas de un grupo. Registrar un pago aquí
        significa dejar constancia de algo que ustedes hicieron por su cuenta.
      </p>
      <p>
        No somos una entidad financiera ni un intermediario de pagos, y no ofrecemos asesoría
        financiera, contable ni legal.
      </p>

      <h2>Tu cuenta</h2>
      <ul>
        <li>Necesitas un correo válido y eres responsable de mantener tu contraseña en privado.</li>
        <li>
          Los códigos de 6 dígitos que enviamos son personales. No los compartas: nadie de nuestro
          equipo te los va a pedir.
        </li>
        <li>
          Si detectas actividad que no reconoces, escríbenos a {correo} y cambia tu contraseña.
        </li>
      </ul>

      <h2>Uso aceptable</h2>
      <p>Al usar el servicio te comprometes a no:</p>
      <ul>
        <li>Crear cuentas con correos que no controlas o suplantar a otra persona.</li>
        <li>Intentar acceder a grupos o datos de terceros.</li>
        <li>
          Automatizar peticiones de forma que degrade el servicio para los demás, ni intentar
          saltarte los límites de uso.
        </li>
        <li>Subir contenido ilegal o usar los nombres de los grupos para acosar a alguien.</li>
      </ul>
      <p>
        Podemos suspender una cuenta que incumpla lo anterior, normalmente avisando antes salvo que
        el incumplimiento sea grave.
      </p>

      <h2>Exactitud de los cálculos</h2>
      <p>
        Ponemos cuidado en que las cuentas cuadren al centavo, pero el resultado depende por completo
        de la información que ustedes anoten. Revisa siempre los montos antes de liquidar: no nos
        hacemos responsables de repartos hechos sobre datos incorrectos ni de acuerdos entre las
        personas de un grupo.
      </p>

      <h2>Disponibilidad</h2>
      <p>
        El servicio se ofrece tal cual está, sin garantía de disponibilidad ininterrumpida. Podemos
        cambiar o descontinuar funciones. Si vamos a dejar de operar, avisaremos con antelación
        razonable para que puedas conservar tu información.
      </p>

      <h2>Contenido y propiedad</h2>
      <p>
        Los datos que registras son tuyos. El diseño, el código y la marca del servicio son nuestros.
      </p>

      <h2>Cerrar tu cuenta</h2>
      <p>
        Puedes pedir la eliminación de tu cuenta y de todos tus grupos en cualquier momento
        escribiendo a {correo} desde el correo asociado.
      </p>

      <h2>Cambios en estos términos</h2>
      <p>
        Si los modificamos, actualizaremos la fecha del encabezado. Seguir usando el servicio después
        de un cambio implica aceptarlo.
      </p>
    </PaginaContenido>
  );
}
