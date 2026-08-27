/**
 * Diccionario en español. Es la fuente de verdad del tipo `Diccionario`:
 * cualquier clave que se agregue aquí el compilador la va a exigir en inglés.
 *
 * Lo que NO vive aquí: el cuerpo de los artículos y de los legales. Ese texto
 * es JSX largo y con enlaces, y se lee mucho mejor en su propia página que
 * partido en cien claves.
 */

const es = {
  sitio: {
    tagline: "Divide gastos entre amigos",
    descripcion:
      "Calcula quién le debe a quién después de una salida o de la despensa. Divide gastos entre amigos gratis, sin cuenta y sin límite de gastos.",
    descripcionCorta: "Divide gastos entre amigos y sabe quién le debe a quién.",
    palabrasClave: [
      "dividir gastos",
      "dividir cuenta entre amigos",
      "calculadora de gastos compartidos",
      "quién le debe a quién",
      "gastos compartidos",
      "dividir la cuenta",
      "despensa familiar",
      "split de gastos",
    ],
  },

  nav: {
    calculadora: "Calculadora",
    comoFunciona: "Cómo funciona",
    unirseConCodigo: "Unirse con código",
    irAlPanel: "Ir al panel",
    tengoCodigo: "Tengo un código",
    iniciarSesion: "Iniciar sesión",
    crearCuenta: "Crear cuenta",
    misGrupos: "Mis grupos",
    cambiarIdioma: "Cambiar idioma",
  },

  pie: {
    lema: "Divide gastos entre amigos y descubre el número exacto de pagos para quedar a mano.",
    columnaCasos: "Cómo dividir",
    columnaCuenta: "Cuenta",
    columnaLegal: "Legal",
    derechos: (anio: number) => `© ${anio} Cuánto Toca. Todos los derechos reservados.`,
    remate: "Hecho para dividir la cuenta sin pleitos.",
  },

  /** Títulos y textos de enlace de cada página. El cuerpo va en cada page.tsx. */
  paginas: {
    viaje: {
      titulo: "Cómo dividir los gastos de un viaje entre amigos",
      enlace: "Dividir gastos de un viaje",
      metaTitulo: "Dividir gastos de un viaje entre amigos",
      entradilla:
        "Gasolina, hospedaje, comidas y entradas pagadas por personas distintas. Así se ordena todo y se sabe quién le debe a quién sin sacar cuentas a mano.",
    },
    despensa: {
      titulo: "Cómo dividir la despensa entre varias personas",
      enlace: "Dividir la despensa",
      metaTitulo: "Dividir la despensa entre varias personas",
      entradilla:
        "Una sola tarjeta paga todo el súper, pero el shampoo es de uno, las cervezas de dos y el arroz de todos. Así se reparte producto por producto sin discutir.",
    },
    restaurante: {
      titulo: "Cómo dividir la cuenta del restaurante sin pelear",
      enlace: "Dividir la cuenta del restaurante",
      metaTitulo: "Dividir la cuenta del restaurante",
      entradilla:
        "Uno pidió entrada y postre, otro solo una limonada, y la propina va aparte. Así se reparte la cuenta de forma justa en menos de un minuto en la mesa.",
    },
    roommates: {
      titulo: "Cómo llevar los gastos entre roommates",
      enlace: "Gastos entre roommates",
      metaTitulo: "Gastos compartidos entre roommates",
      entradilla:
        "Renta, luz, agua, internet y súper, cada mes y pagados por personas distintas. Así se lleva la cuenta sin que nadie tenga que confiar en la memoria del otro.",
    },
    privacidad: {
      titulo: "Política de privacidad",
      enlace: "Privacidad",
      metaTitulo: "Política de privacidad",
      entradilla:
        "Qué datos guarda Cuánto Toca, para qué los usa, con quién se comparten y cómo pedir que se borren.",
    },
    terminos: {
      titulo: "Términos de uso",
      enlace: "Términos",
      metaTitulo: "Términos de uso",
      entradilla:
        "Las reglas para usar Cuánto Toca: qué puedes esperar del servicio y qué esperamos de ti.",
    },
    contacto: {
      titulo: "Contacto",
      enlace: "Contacto",
      metaTitulo: "Contacto",
      entradilla:
        "Escríbenos si algo no funciona, si quieres borrar tu cuenta o si se te ocurre cómo mejorar la herramienta.",
    },
  },

  articulo: {
    preguntasFrecuentes: "Preguntas frecuentes",
    tambienTeSirve: "También te puede servir",
    ultimaActualizacion: (fecha: string) => `Última actualización: ${fecha}`,
    /** Fecha de los legales. Se traduce porque el formato cambia por idioma. */
    fechaLegales: "27 de agosto de 2026",
  },

  portada: {
    metaTitulo: "Divide gastos entre amigos",
    insignia: "Gratis y sin límite de gastos",
    titular: "¿Cuánto le toca a cada quien?",
    bajada:
      "Anota quién puso qué y te decimos el número exacto de pagos para quedar a mano. No necesitas cuenta para calcular.",
    caracteristicas: [
      {
        titulo: "Cálculo exacto",
        detalle: "Repartimos hasta el último centavo: la suma siempre cuadra con el total.",
      },
      {
        titulo: "Enlace para unirse",
        detalle: "Comparte un código por WhatsApp y cada quien registra lo que puso.",
      },
      {
        titulo: "Sin trabas",
        detalle: "Agrega los gastos que necesites. No hay tope diario ni muro de pago.",
      },
    ],
    /** Se publican como FAQPage en el JSON-LD, además de mostrarse. */
    preguntas: [
      {
        pregunta: "¿Necesito crear una cuenta para dividir la cuenta?",
        respuesta:
          "No. La calculadora de la portada funciona sin cuenta: agregas a la gente, anotas quién puso qué y te da el resultado. La cuenta solo sirve para guardar el grupo e invitar a los demás por enlace.",
      },
      {
        pregunta: "¿Cómo calculan quién le debe a quién?",
        respuesta:
          "Sacamos el saldo de cada persona (lo que puso menos lo que le tocaba) y luego reducimos los pagos al mínimo posible, para que nadie ande haciendo tres transferencias cuando basta una.",
      },
      {
        pregunta: "¿Sirve si uno paga todo el súper con una sola tarjeta?",
        respuesta:
          "Sí. Puedes anotar cada producto y marcar a quién le corresponde: lo compartido se divide entre todos y lo de una sola persona se le carga completo, aunque el pago haya salido de una sola tarjeta.",
      },
      {
        pregunta: "¿Se pierden centavos al dividir?",
        respuesta:
          "No. Repartimos hasta el último centavo, así que la suma de las partes siempre da exactamente el total del gasto.",
      },
      {
        pregunta: "¿Tiene costo o límite de gastos?",
        respuesta:
          "Es gratis y no hay tope diario ni muro de pago. Puedes agregar todos los gastos que necesites.",
      },
    ],
    /** `featureList` del JSON-LD de la WebApplication. */
    funciones: [
      "Dividir gastos en partes iguales, exactas, por porcentaje o por partes",
      "Tickets de despensa producto por producto",
      "Cálculo del mínimo de pagos para quedar a mano",
      "Enlace de invitación para que cada quien registre lo suyo",
    ],
  },

  calculadora: {
    pasoGrupo: "1. El grupo",
    pasoGrupoDetalle: "Elige el tipo, ponle nombre y agrega a quienes participaron.",
    tipoViaje: "Salida o viaje",
    tipoViajeDetalle: "Cada gasto se divide entre quienes participaron.",
    tipoDespensa: "Despensa",
    tipoDespensaDetalle: "Producto por producto, marcando a quién le toca cada uno.",
    nombreViaje: "Ej. Playa con los muchachos",
    nombreDespensa: "Ej. Súper de la quincena",
    moneda: "Moneda",
    nombreIntegrante: "Nombre del integrante",
    agregar: "Agregar",
    quitarA: (nombre: string) => `Quitar a ${nombre}`,
    sinIntegrantes: "Todavía no hay nadie. Agrega al menos dos personas.",
    maximoIntegrantes: "Máximo 50 integrantes en la calculadora.",

    pasoGastos: "2. Los gastos",
    pasoGastosDetalle: "Quién puso qué. Cada gasto se divide entre quienes marques.",
    faltanIntegrantes: "Agrega al menos dos integrantes para empezar a registrar gastos.",
    pagaron: (nombres: string[]) =>
      nombres.length > 1 ? `Pagaron ${nombres.join(" y ")}` : `Pagó ${nombres[0] ?? "—"}`,
    entrePersonas: (n: number) => `entre ${n} ${n === 1 ? "persona" : "personas"}`,
    eliminarGasto: "Eliminar gasto",
    queSeGasto: "¿En qué se gastó? Ej. Refrescos",
    seDivideEntre: (n: number) => `Se divide entre (${n})`,
    agregarGasto: "Agregar gasto",

    pasoResultado: "3. Cuánto le toca a cada quien",
    totalDelGrupo: (total: string) => `Total del grupo: ${total}`,
    sinResultado: "Registra gastos para ver el resultado.",
    empezarDeNuevo: "Empezar de nuevo",
    calculoBorrado: "Se borró el cálculo.",
    resultadoVacio:
      "Aquí va a aparecer el saldo de cada persona y la lista de pagos mínimos para quedar a mano.",
    saldos: "Saldos",
    quienPagaAQuien: (n: number) =>
      `Quién le paga a quién (${n} ${n === 1 ? "transferencia" : "transferencias"})`,
    guardarGrupo: "¿Guardar este grupo?",
    guardarGrupoDetalle: "Crea una cuenta gratis y no pierdes nada de lo que ya llevas.",
    guardarEInvitar: "Guardar e invitar",

    errorMonto: "Escribe un monto válido mayor a cero.",
    errorDescripcion: "Describe el gasto (por ejemplo: Comida).",
    errorReparto: "Marca entre quiénes se divide.",
    /** Indexado por el `motivo` que devuelve `validarPagadores`. */
    errorPagadores: {
      SIN_PAGADORES: "Indica quién puso el dinero.",
      REPETIDO: "Hay una persona repetida entre quienes pagaron.",
      MONTO_CERO: "Cada quien debe poner un monto mayor a cero.",
      NO_CUADRA: "Lo que puso cada quien no cuadra con el total del gasto.",
    } as Record<string, string>,
  },

  liquidacion: {
    pusoLeTocaba: (puso: string, tocaba: string) => `Puso ${puso} · le tocaba ${tocaba}`,
    aMano: "a mano",
    leDeben: "le deben",
    debe: "debe",
    todosAMano: "Todos a mano",
    todosAManoDetalle: "No hay nada que pagar: las cuentas del grupo están cuadradas.",
  },

  pagadores: {
    quienPuso: "¿Quién puso el dinero?",
    repartirIgual: "Repartir en partes iguales",
    cuantoPuso: (nombre: string) => `Cuánto puso ${nombre}`,
    cuadra: (total: string) => `Cuadra con el total: ${total}`,
    faltan: (monto: string) => `Faltan ${monto} por asignar.`,
    sePasan: (monto: string) => `Se pasan por ${monto}.`,
    pista: "Marca a más de una persona si pagaron entre varios.",
  },

  auth: {
    titular: "Deja de sacar cuentas en el grupo de WhatsApp.",
    bajada:
      "Anota quién puso qué y te decimos el número exacto de pagos para que todos queden a mano.",
    ventajas: [
      {
        titulo: "Cálculo exacto",
        detalle: "Hasta el último centavo. La suma siempre cuadra con el total.",
      },
      {
        titulo: "Invita por enlace",
        detalle: "Comparte un código y cada quien registra lo que puso.",
      },
      {
        titulo: "Sin costo ni topes",
        detalle: "Todos los gastos que necesites, sin muro de pago.",
      },
    ],
    volverAlInicio: "Volver al inicio",
    separadorCorreo: "o continúa con tu correo",
    separadorRegistro: "o regístrate con tu correo",
    googleSinCredencial: "Google no devolvió una credencial.",
    googleExito: "Sesión iniciada con Google.",
    googleError: "No pudimos iniciar sesión con Google.",
    googleNoCarga:
      "No se pudo cargar el acceso con Google. Revisa tu conexión o entra con tu correo.",
  },

  login: {
    metaTitulo: "Iniciar sesión",
    metaDescripcion: "Entra a tu cuenta de Cuánto Toca para ver tus grupos y gastos compartidos.",
    titulo: "Bienvenido de vuelta",
    descripcion: "Entra para seguir dividiendo gastos con tu gente.",
    sinCuenta: "¿No tienes cuenta?",
    crearGratis: "Crear una gratis",
    olvidasteContrasena: "¿Olvidaste tu contraseña?",
    usuarioOCorreo: "Usuario o correo",
    usuarioPlaceholder: "tu_usuario o tu-correo@dominio.com",
    contrasena: "Contraseña",
    contrasenaPlaceholder: "Tu contraseña",
    mostrarContrasena: "Mostrar contraseña",
    ocultarContrasena: "Ocultar contraseña",
    entrar: "Entrar",
    entrando: "Entrando...",
    revisaCorreo: "Revisa tu correo",
    codigoEnviado: (correo: string | null) =>
      `Mandamos un código de 6 dígitos${correo ? ` a ${correo}` : ""}. Caduca en 10 minutos.`,
    codigoVerificacion: "Código de verificación",
    verificando: "Verificando...",
    usarOtraCuenta: "Usar otra cuenta",
    reenviarCodigo: "Reenviar código",
  },

  registro: {
    metaTitulo: "Crear cuenta",
    metaDescripcion:
      "Crea tu cuenta gratis en Cuánto Toca para guardar tus grupos, invitar a tus amigos y llevar el control de los gastos compartidos.",
    titulo: "Crea tu cuenta",
    descripcion: "Gratis y sin límite de gastos. Lo que ya calculaste no se pierde.",
    yaTienesCuenta: "¿Ya tienes cuenta?",
    iniciaSesion: "Inicia sesión",
    nota: "Al crear la cuenta aceptas que guardemos tus grupos y gastos para mostrártelos cuando entres.",
    tuNombre: "Tu nombre",
    nombrePlaceholder: "Ana Ramírez",
    correo: "Correo",
    correoPlaceholder: "tu-correo@dominio.com",
    correoAyuda: "Te mandaremos un código para confirmar que es tuyo.",
    contrasena: "Contraseña",
    contrasenaPlaceholder: "Mínimo 8 caracteres",
    crearCuentaGratis: "Crear cuenta gratis",
    enviandoCodigo: "Enviando código...",
    confirmaCorreo: "Confirma tu correo",
    codigoEnviado: (correo: string | null) =>
      `Mandamos un código de 6 dígitos${correo ? ` a ${correo}` : ""}. Tu cuenta se crea al confirmarlo.`,
    crearMiCuenta: "Crear mi cuenta",
    usarOtroCorreo: "Usar otro correo",
  },

  unirse: {
    metaTitulo: "Unirse con código",
    metaDescripcion:
      "Escribe el código que te compartieron para entrar al grupo y registrar lo que pusiste.",
    titulo: "Entrar con código",
    descripcion: "Escribe el código que te compartieron para unirte al grupo.",
    codigoPlaceholder: "Ej. K7M2QPXY",
    entrar: "Entrar",
    enlaceMuerto: "Este enlace ya no sirve",
    enlaceMuertoDetalle:
      "Puede que el grupo se haya archivado o que quien lo creó haya generado un enlace nuevo. Pídele el código actualizado.",
    irCalculadora: "Ir a la calculadora",
    unirteA: (nombre: string) => `Unirte a “${nombre}”`,
    resumenGrupo: (gastos: number, moneda: string) =>
      `${gastos} gastos registrados · moneda ${moneda}. Si ya estás en la lista, reclama tu nombre para que los saldos queden a tu cuenta.`,
    cualEresTu: "¿Cuál de estos eres tú?",
    todosVinculados:
      "Todos los integrantes de la lista ya tienen cuenta vinculada. Puedes entrar como alguien nuevo.",
    entrando: "Entrando...",
    soy: (nombre: string) => `Soy ${nombre}`,
    entrarComoNuevo: "Entrar como integrante nuevo",
    mejorNuevo: "Mejor entro como alguien nuevo",
    yaEstas: "Ya estás en el grupo.",
    errorUnirse: "No se pudo unir al grupo.",
  },

  contrasena: {
    /** Pantalla del enlace que llega por correo. */
    enlaceInvalido: "Enlace inválido o expirado",
    enlaceInvalidoDetalle:
      "Lo sentimos, el enlace ya no es válido o ha expirado. Vuelve a solicitar el restablecimiento de contraseña.",
    restablecer: "Restablecer contraseña",
    nuevaContrasena: "Nueva contraseña",
    confirmarContrasena: "Confirmar contraseña",
    minimoSeis: "La contraseña debe tener al menos 6 caracteres",
    noCoinciden: "Las contraseñas no coinciden",
    cambiada: "Contraseña cambiada con éxito",
    errorCambio: "Error al cambiar la contraseña",
    errorCambioDetalle: "No se pudo actualizar la contraseña. Solicita un nuevo enlace.",
    errorDesconocido: "Error desconocido",
    cambiando: "Cambiando...",
    cambiarContrasena: "Cambiar contraseña",
    /** Pantalla de cambio obligatorio tras entrar. */
    obligatorioTitulo: "Cambiar contraseña",
    obligatorioDetalle: "Por seguridad, actualiza tu contraseña para continuar.",
    minimoOcho: "Mínimo 8 caracteres.",
    validacionMinimoOcho: "Mínimo 8 caracteres",
    repiteContrasena: "Repite la contraseña para confirmar.",
    mostrarContrasena: "Mostrar contraseña",
    ocultarContrasena: "Ocultar contraseña",
    mostrarConfirmacion: "Mostrar confirmación",
    ocultarConfirmacion: "Ocultar confirmación",
    guardando: "Guardando...",
    actualizar: "Actualizar contraseña",
    cargando: "Cargando...",
  },

  noEncontrado: {
    titulo: "Página o elemento no encontrado",
    detalle: "Lo sentimos, la página que estás buscando no existe o ha sido movida.",
    volver: "Volver al inicio",
  },

  /** Mensajes que devuelven las server actions de sesión y registro. */
  acciones: {
    faltanCredenciales: "Debes ingresar usuario/correo y contraseña.",
    credencialesInvalidas: "Usuario/correo o contraseña inválidos.",
    sesionIniciada: "Inicio de sesión exitoso.",
    escribeCodigo: "Escribe el código que te llegó.",
    codigoNuevo: "Te mandamos un código nuevo.",
    correoInvalido: "El correo no es válido.",
    contrasenaCorta: "La contraseña debe tener al menos 8 caracteres.",
    listo: "¡Listo!",
    completaCampos: "Completa todos los campos.",
    escribeNombre: "Escribe tu nombre.",
  },

  contacto: {
    escribenosA: "Escríbenos a",
  },

  /**
   * Errores que devuelven `auth.ts`, `lib/codigo-acceso.ts` y
   * `lib/registro-pendiente.ts`. Todos corren dentro de una petición, así que
   * pueden leer el idioma con `getDiccionario()` sin recibirlo por parámetro.
   */
  errores: {
    credenciales: "Usuario o contraseña inválidos",
    cambioContrasena: "Error al cambiar la contraseña",
    servidorSinConfigurar: "El servidor no está configurado. Intenta más tarde.",
    cuentaDesactivada: "Tu cuenta está desactivada. Contacta a un administrador.",
    cuentaNoDisponible: "Tu cuenta no está disponible.",

    googleSinCredencial: "No recibimos la credencial de Google.",
    googleSinValidar: "No pudimos validar tu cuenta de Google. Intenta de nuevo.",
    googleCorreoSinVerificar: "Tu correo de Google no está verificado.",
    googleFallo: "No pudimos iniciar sesión con Google.",

    sesionFallo: "No pudimos iniciar sesión. Intenta de nuevo.",
    sesionCaducada: "Tu solicitud caducó. Vuelve a iniciar sesión.",
    codigoSinValidar: "No pudimos validar el código.",

    correoYaRegistrado: "Ese correo ya tiene una cuenta. Inicia sesión.",
    registroFallo: "No pudimos crear tu cuenta. Intenta de nuevo.",
    registroIncompleto: "No pudimos completar tu registro.",
    registroCaducado: "Tu solicitud caducó. Vuelve a registrarte.",

    codigoReciente: "Ya te mandamos un código hace un momento. Revisa tu correo.",
    codigoNoEnviado: "No pudimos enviarte el código. Intenta de nuevo en un momento.",
    codigoSeisDigitos: "El código son 6 dígitos.",
    codigoSinPendiente: "No hay ningún código pendiente. Pide uno nuevo.",
    codigoCaducado: "El código caducó. Pide uno nuevo.",
    codigoDemasiadosIntentos: "Demasiados intentos. Pide un código nuevo.",
    codigoIncorrecto: (restantes: number) =>
      `Código incorrecto. Te ${restantes === 1 ? "queda 1 intento" : `quedan ${restantes} intentos`}.`,

    registroSinPendiente: "No hay ningún registro pendiente. Empieza de nuevo.",
    registroCodigoCaducado: "El código caducó. Vuelve a registrarte.",
    registroDemasiadosIntentos: "Demasiados intentos. Vuelve a registrarte.",
  },
};

export default es;
