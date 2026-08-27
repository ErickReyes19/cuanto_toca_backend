"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

import { DICCIONARIOS, diccionario } from "./index";
import { IDIOMA_POR_DEFECTO, LANG_HTML, idiomaDeRuta, type Idioma } from "./idiomas";
import type { Diccionario } from "./tipos";

type Contexto = { idioma: Idioma; t: Diccionario };

/**
 * El español es el valor por defecto del contexto, no un estado de error: el
 * panel privado no monta el proveedor y sigue funcionando en español sin que
 * haya que envolverlo.
 */
const ContextoIdioma = React.createContext<Contexto>({
  idioma: IDIOMA_POR_DEFECTO,
  t: DICCIONARIOS[IDIOMA_POR_DEFECTO],
});

/**
 * El idioma sale de la ruta en el cliente, no de una prop del servidor.
 *
 * Este proveedor vive en el layout de `(public)`, que `/` y `/en` comparten, y
 * Next NO vuelve a renderizar un layout compartido al navegar entre sus rutas.
 * Con una prop del servidor, al pasar de `/` a `/en` el texto del servidor
 * cambiaba a inglés pero el contexto se quedaba en español: el selector seguía
 * ofreciendo "English" y ya no había forma de volver.
 *
 * `usePathname()` sí se actualiza en cada navegación, e `idiomaDeRuta` es una
 * función pura, así que servidor y cliente calculan lo mismo al hidratar.
 */
export function ProveedorIdioma({
  idioma: idiomaInicial,
  children,
}: {
  /** El que resolvió el servidor. Solo se usa si aún no hay ruta. */
  idioma: Idioma;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const idioma = pathname ? idiomaDeRuta(pathname) : idiomaInicial;

  // El `lang` del `<html>` lo pinta el layout raíz, que también es compartido
  // y tampoco se vuelve a renderizar. Sin esto, tras cambiar de idioma sin
  // recargar el documento seguiría anunciándose en el anterior a los lectores
  // de pantalla y al traductor del navegador.
  React.useEffect(() => {
    document.documentElement.lang = LANG_HTML[idioma];
  }, [idioma]);

  /**
   * El diccionario se resuelve aquí y no se pasa por props desde el servidor:
   * lleva funciones (`derechos(anio)`, `entrePersonas(n)`) y las funciones no
   * cruzan la frontera servidor→cliente.
   */
  const valor = React.useMemo(() => ({ idioma, t: diccionario(idioma) }), [idioma]);

  return <ContextoIdioma.Provider value={valor}>{children}</ContextoIdioma.Provider>;
}

/** El idioma y su diccionario dentro de un componente de cliente. */
export function useIdioma(): Contexto {
  return React.useContext(ContextoIdioma);
}

/** Atajo para cuando solo hacen falta los textos. */
export function useDiccionario(): Diccionario {
  return React.useContext(ContextoIdioma).t;
}
