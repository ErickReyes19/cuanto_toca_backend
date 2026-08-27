/** Textos derivados del reparto, para no armarlos dentro de las páginas. */

/** "Pagó Ana", "Pagaron Ana y Luis", "Pagaron Ana, Luis y 2 más". */
export function etiquetaPagadores(pagadores: Array<{ nombre: string }>) {
  const nombres = pagadores.map((p) => p.nombre);

  if (nombres.length === 0) return "Sin pagador";
  if (nombres.length === 1) return `Pagó ${nombres[0]}`;
  if (nombres.length === 2) return `Pagaron ${nombres[0]} y ${nombres[1]}`;

  return `Pagaron ${nombres[0]}, ${nombres[1]} y ${nombres.length - 2} más`;
}
