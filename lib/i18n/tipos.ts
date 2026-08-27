import type es from "./diccionarios/es";

/**
 * La forma de un diccionario, derivada del español.
 *
 * Al no llevar `as const`, los tipos quedan anchos (`string`, no el literal),
 * que es justo lo que hace falta para que el inglés pueda decir otra cosa
 * mientras el compilador sigue exigiendo que estén todas las claves.
 */
export type Diccionario = typeof es;
