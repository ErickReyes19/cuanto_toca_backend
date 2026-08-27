/**
 * Registro de las páginas de contenido.
 *
 * En un solo lugar para que el sitemap, el pie de página y los enlaces
 * cruzados entre artículos no se desincronicen cada vez que se agrega una.
 */

export type PaginaDeContenido = {
  ruta: string;
  titulo: string;
  /** Texto corto para los enlaces del pie y de "también te puede servir". */
  enlace: string;
};

/** Casos de uso: cada uno monta la calculadora en el modo que le toca. */
export const CASOS_DE_USO: PaginaDeContenido[] = [
  {
    ruta: "/dividir-gastos-de-viaje",
    titulo: "Cómo dividir los gastos de un viaje entre amigos",
    enlace: "Dividir gastos de un viaje",
  },
  {
    ruta: "/dividir-la-despensa",
    titulo: "Cómo dividir la despensa entre varias personas",
    enlace: "Dividir la despensa",
  },
  {
    ruta: "/dividir-la-cuenta-del-restaurante",
    titulo: "Cómo dividir la cuenta del restaurante sin pelear",
    enlace: "Dividir la cuenta del restaurante",
  },
  {
    ruta: "/gastos-entre-roommates",
    titulo: "Cómo llevar los gastos entre roommates",
    enlace: "Gastos entre roommates",
  },
];

/** Páginas legales. AdSense exige al menos la de privacidad. */
export const PAGINAS_LEGALES: PaginaDeContenido[] = [
  { ruta: "/privacidad", titulo: "Política de privacidad", enlace: "Privacidad" },
  { ruta: "/terminos", titulo: "Términos de uso", enlace: "Términos" },
  { ruta: "/contacto", titulo: "Contacto", enlace: "Contacto" },
];

/** Los otros casos de uso, para enlazar desde uno de ellos. */
export function casosRelacionados(rutaActual: string) {
  return CASOS_DE_USO.filter((caso) => caso.ruta !== rutaActual).map((caso) => ({
    href: caso.ruta,
    titulo: caso.titulo,
  }));
}

/** Correo público de contacto. Se muestra en /contacto y en los legales. */
export function getCorreoContacto() {
  return process.env.NEXT_PUBLIC_CONTACTO_EMAIL?.trim() || "erickjosepineda33@gmail.com";
}
