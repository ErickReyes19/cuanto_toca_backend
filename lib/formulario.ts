import type * as React from "react";

/**
 * Envía el formulario contenedor al presionar Enter.
 *
 * El envío implícito del navegador ya hace esto en la mayoría de los casos,
 * pero depende de que exista un botón submit habilitado. Declararlo explícito
 * deja el comportamiento igual en los campos que se usan para "agregar y
 * seguir escribiendo" (integrantes, gastos), que es donde más se usa Enter.
 */
export function enviarConEnter(evento: React.KeyboardEvent<HTMLElement>) {
  if (evento.key !== "Enter" || evento.shiftKey) return;

  evento.preventDefault();
  evento.currentTarget.closest("form")?.requestSubmit();
}
