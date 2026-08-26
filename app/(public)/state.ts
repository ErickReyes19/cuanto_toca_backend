export type LoginActionState = {
  ok: boolean;
  message: string;
  redirect?: string;
  tareasHoy?: number;
  /** La contraseña fue correcta pero falta el código de 6 dígitos del correo. */
  requiereCodigo?: boolean;
  /** Correo enmascarado al que se mandó el código, para mostrarlo en pantalla. */
  correoEnmascarado?: string;
};

export const initialLoginState: LoginActionState = {
  ok: false,
  message: "",
};
