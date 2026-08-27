import {
  CLAVES_CASOS_DE_USO,
  CLAVES_LEGALES,
  type ClavePagina,
  type Idioma,
  RUTAS,
  diccionario,
} from "@/lib/i18n";

/**
 * Registro de las páginas de contenido.
 *
 * En un solo lugar para que el sitemap, el pie de página y los enlaces
 * cruzados entre artículos no se desincronicen cada vez que se agrega una.
 * La ruta sale del mapa de idiomas y el texto del diccionario, así que una
 * página nueva se declara una vez y aparece en los dos idiomas.
 */

export type PaginaDeContenido = {
  clave: ClavePagina;
  ruta: string;
  titulo: string;
  /** Texto corto para los enlaces del pie y de "también te puede servir". */
  enlace: string;
};

function describir(clave: ClavePagina, idioma: Idioma): PaginaDeContenido {
  const pagina = diccionario(idioma).paginas[clave];

  return {
    clave,
    ruta: RUTAS[clave][idioma],
    titulo: pagina.titulo,
    enlace: pagina.enlace,
  };
}

/** Casos de uso: cada uno monta la calculadora en el modo que le toca. */
export function casosDeUso(idioma: Idioma): PaginaDeContenido[] {
  return CLAVES_CASOS_DE_USO.map((clave) => describir(clave, idioma));
}

/** Páginas legales. AdSense exige al menos la de privacidad. */
export function paginasLegales(idioma: Idioma): PaginaDeContenido[] {
  return CLAVES_LEGALES.map((clave) => describir(clave, idioma));
}

/** Los otros casos de uso, para enlazar desde uno de ellos. */
export function casosRelacionados(actual: ClavePagina, idioma: Idioma) {
  return casosDeUso(idioma)
    .filter((caso) => caso.clave !== actual)
    .map((caso) => ({ href: caso.ruta, titulo: caso.titulo }));
}

/** Correo público de contacto. Se muestra en /contacto y en los legales. */
export function getCorreoContacto() {
  return process.env.NEXT_PUBLIC_CONTACTO_EMAIL?.trim() || "erickjosepineda33@gmail.com";
}
