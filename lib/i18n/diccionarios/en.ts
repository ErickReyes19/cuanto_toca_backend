import type { Diccionario } from "../tipos";

/**
 * English dictionary, written for a US audience rather than translated word
 * for word: "split the bill", "roommates", "grocery run", "group chat".
 *
 * Typed as `Diccionario`, so leaving a key out of this file is a build error,
 * not a page that silently falls back to Spanish.
 */
const en: Diccionario = {
  sitio: {
    tagline: "Split expenses with friends",
    descripcion:
      "Figure out who owes who after a trip, a dinner or a grocery run. Split expenses with friends for free — no account required, no limit on expenses.",
    descripcionCorta: "Split expenses with friends and see exactly who owes who.",
    palabrasClave: [
      "split expenses",
      "split the bill with friends",
      "shared expense calculator",
      "who owes who",
      "shared expenses",
      "split restaurant bill",
      "roommate expenses",
      "expense splitter",
    ],
  },

  nav: {
    calculadora: "Calculator",
    comoFunciona: "How it works",
    unirseConCodigo: "Join with a code",
    irAlPanel: "Go to dashboard",
    tengoCodigo: "I have a code",
    iniciarSesion: "Log in",
    crearCuenta: "Sign up",
    misGrupos: "My groups",
    cambiarIdioma: "Change language",
  },

  pie: {
    lema: "Split expenses with friends and get the exact set of payments that settles everyone up.",
    columnaCasos: "How to split",
    columnaCuenta: "Account",
    columnaLegal: "Legal",
    derechos: (anio: number) => `© ${anio} Cuánto Toca. All rights reserved.`,
    remate: "Built to settle the bill without the awkward part.",
  },

  paginas: {
    viaje: {
      titulo: "How to split trip expenses with friends",
      enlace: "Split trip expenses",
      metaTitulo: "How to split trip expenses with friends",
      entradilla:
        "Gas, lodging, meals and tickets, all paid by different people. Here's how to sort it out and see who owes who without doing the math by hand.",
    },
    despensa: {
      titulo: "How to split a grocery bill between several people",
      enlace: "Split a grocery bill",
      metaTitulo: "How to split a grocery bill",
      entradilla:
        "One card pays for the whole cart, but the shampoo is one person's, the beer belongs to two and the rice is everyone's. Here's how to split it item by item without arguing.",
    },
    restaurante: {
      titulo: "How to split a restaurant bill without the awkward math",
      enlace: "Split a restaurant bill",
      metaTitulo: "How to split a restaurant bill",
      entradilla:
        "One person got an appetizer and dessert, another just had a lemonade, and the tip is its own problem. Here's how to split it fairly in under a minute at the table.",
    },
    roommates: {
      titulo: "How to track shared expenses with roommates",
      enlace: "Roommate expenses",
      metaTitulo: "Shared expenses between roommates",
      entradilla:
        "Rent, power, water, internet and groceries — every month, paid by different people. Here's how to keep track without anyone relying on memory.",
    },
    privacidad: {
      titulo: "Privacy Policy",
      enlace: "Privacy",
      metaTitulo: "Privacy Policy",
      entradilla:
        "What data Cuánto Toca stores, what it's used for, who it's shared with, and how to ask for it to be deleted.",
    },
    terminos: {
      titulo: "Terms of Use",
      enlace: "Terms",
      metaTitulo: "Terms of Use",
      entradilla:
        "The rules for using Cuánto Toca: what you can expect from the service and what we expect from you.",
    },
    contacto: {
      titulo: "Contact",
      enlace: "Contact",
      metaTitulo: "Contact",
      entradilla:
        "Write to us if something is broken, if you want your account deleted, or if you have an idea for making the tool better.",
    },
  },

  articulo: {
    preguntasFrecuentes: "Frequently asked questions",
    tambienTeSirve: "You might also find this useful",
    ultimaActualizacion: (fecha: string) => `Last updated: ${fecha}`,
    fechaLegales: "August 27, 2026",
  },

  portada: {
    metaTitulo: "Split expenses with friends",
    insignia: "Free, with no limit on expenses",
    titular: "Who owes what?",
    bajada:
      "Write down who paid for what and we'll give you the exact set of payments that settles everyone up. No account needed to run the numbers.",
    caracteristicas: [
      {
        titulo: "Exact to the cent",
        detalle: "We split down to the last cent, so the parts always add up to the total.",
      },
      {
        titulo: "Invite by link",
        detalle: "Share a code in the group chat and everyone logs what they paid.",
      },
      {
        titulo: "No strings",
        detalle: "Add as many expenses as you need. No daily cap, no paywall.",
      },
    ],
    preguntas: [
      {
        pregunta: "Do I need an account to split a bill?",
        respuesta:
          "No. The calculator on this page works without one: add the people, note who paid what, and you get the result. An account is only for saving the group and inviting everyone else by link.",
      },
      {
        pregunta: "How do you work out who owes who?",
        respuesta:
          "We compute each person's balance (what they paid minus what they owed), then reduce the payments to the smallest possible number — so nobody sends three transfers when one will do.",
      },
      {
        pregunta: "Does it work if one person puts the whole grocery run on their card?",
        respuesta:
          "Yes. You can log each item and mark who it belongs to: shared items get split across everyone, and one person's items are charged entirely to them — even though a single card paid for all of it.",
      },
      {
        pregunta: "Do cents get lost when the split isn't even?",
        respuesta:
          "No. The remainder is distributed down to the last cent, so the parts always add up to exactly the total of the expense.",
      },
      {
        pregunta: "Does it cost anything, or cap how many expenses I can add?",
        respuesta:
          "It's free, with no daily cap and no paywall. Add as many expenses as you need.",
      },
    ],
    funciones: [
      "Split expenses equally, by exact amount, by percentage or by shares",
      "Itemized grocery receipts, line by line",
      "Smallest set of payments needed to settle up",
      "Invite link so everyone can log what they paid",
    ],
  },

  calculadora: {
    pasoGrupo: "1. The group",
    pasoGrupoDetalle: "Pick the type, give it a name and add everyone who took part.",
    tipoViaje: "Outing or trip",
    tipoViajeDetalle: "Each expense is split among the people who were there.",
    tipoDespensa: "Groceries",
    tipoDespensaDetalle: "Item by item, marking who each one belongs to.",
    nombreViaje: "e.g. Beach weekend",
    nombreDespensa: "e.g. Groceries for the month",
    moneda: "Currency",
    nombreIntegrante: "Person's name",
    agregar: "Add",
    quitarA: (nombre: string) => `Remove ${nombre}`,
    sinIntegrantes: "Nobody here yet. Add at least two people.",
    maximoIntegrantes: "The calculator holds up to 50 people.",

    pasoGastos: "2. The expenses",
    pasoGastosDetalle: "Who paid what. Each expense is split among the people you check.",
    faltanIntegrantes: "Add at least two people before logging expenses.",
    pagaron: (nombres: string[]) =>
      nombres.length > 1
        ? `Paid by ${nombres.slice(0, -1).join(", ")} and ${nombres[nombres.length - 1]}`
        : `Paid by ${nombres[0] ?? "—"}`,
    entrePersonas: (n: number) => `split among ${n} ${n === 1 ? "person" : "people"}`,
    eliminarGasto: "Delete expense",
    queSeGasto: "What was it for? e.g. Drinks",
    seDivideEntre: (n: number) => `Split among (${n})`,
    agregarGasto: "Add expense",

    pasoResultado: "3. Who owes what",
    totalDelGrupo: (total: string) => `Group total: ${total}`,
    sinResultado: "Add expenses to see the result.",
    empezarDeNuevo: "Start over",
    calculoBorrado: "Calculation cleared.",
    resultadoVacio:
      "This is where each person's balance and the shortest list of payments will show up.",
    saldos: "Balances",
    quienPagaAQuien: (n: number) =>
      `Who pays who (${n} ${n === 1 ? "transfer" : "transfers"})`,
    guardarGrupo: "Want to save this group?",
    guardarGrupoDetalle: "Create a free account and you won't lose anything you've entered.",
    guardarEInvitar: "Save and invite",

    errorMonto: "Enter a valid amount greater than zero.",
    errorDescripcion: "Describe the expense (for example: Dinner).",
    errorReparto: "Choose who the expense is split among.",
    errorPagadores: {
      SIN_PAGADORES: "Choose who paid.",
      REPETIDO: "The same person is listed twice among the payers.",
      MONTO_CERO: "Each payer needs an amount greater than zero.",
      NO_CUADRA: "What each person paid doesn't add up to the expense total.",
    },
  },

  liquidacion: {
    pusoLeTocaba: (puso: string, tocaba: string) => `Paid ${puso} · owed ${tocaba}`,
    aMano: "settled",
    leDeben: "is owed",
    debe: "owes",
    todosAMano: "Everyone's settled",
    todosAManoDetalle: "Nothing left to pay — the group is square.",
  },

  pagadores: {
    quienPuso: "Who paid?",
    repartirIgual: "Split evenly",
    cuantoPuso: (nombre: string) => `How much ${nombre} paid`,
    cuadra: (total: string) => `Matches the total: ${total}`,
    faltan: (monto: string) => `${monto} still unassigned.`,
    sePasan: (monto: string) => `Over by ${monto}.`,
    pista: "Check more than one person if they paid together.",
  },

  auth: {
    titular: "Stop doing math in the group chat.",
    bajada:
      "Write down who paid what and we'll give you the exact set of payments that settles everyone up.",
    ventajas: [
      {
        titulo: "Exact to the cent",
        detalle: "Down to the last cent. The parts always add up to the total.",
      },
      {
        titulo: "Invite by link",
        detalle: "Share a code and everyone logs what they paid.",
      },
      {
        titulo: "Free, no caps",
        detalle: "As many expenses as you need, with no paywall.",
      },
    ],
    volverAlInicio: "Back to home",
    separadorCorreo: "or continue with your email",
    separadorRegistro: "or sign up with your email",
    googleSinCredencial: "Google didn't return a credential.",
    googleExito: "Signed in with Google.",
    googleError: "We couldn't sign you in with Google.",
    googleNoCarga:
      "Google sign-in failed to load. Check your connection or log in with your email.",
  },

  login: {
    metaTitulo: "Log in",
    metaDescripcion:
      "Log in to your Cuánto Toca account to see your groups and shared expenses.",
    titulo: "Welcome back",
    descripcion: "Log in to keep splitting expenses with your people.",
    sinCuenta: "Don't have an account?",
    crearGratis: "Create one free",
    olvidasteContrasena: "Forgot your password?",
    usuarioOCorreo: "Username or email",
    usuarioPlaceholder: "your_username or you@example.com",
    contrasena: "Password",
    contrasenaPlaceholder: "Your password",
    mostrarContrasena: "Show password",
    ocultarContrasena: "Hide password",
    entrar: "Log in",
    entrando: "Logging in...",
    revisaCorreo: "Check your email",
    codigoEnviado: (correo: string | null) =>
      `We sent a 6-digit code${correo ? ` to ${correo}` : ""}. It expires in 10 minutes.`,
    codigoVerificacion: "Verification code",
    verificando: "Verifying...",
    usarOtraCuenta: "Use another account",
    reenviarCodigo: "Resend code",
  },

  registro: {
    metaTitulo: "Sign up",
    metaDescripcion:
      "Create your free Cuánto Toca account to save your groups, invite your friends and keep track of shared expenses.",
    titulo: "Create your account",
    descripcion: "Free, with no limit on expenses. Nothing you've already entered is lost.",
    yaTienesCuenta: "Already have an account?",
    iniciaSesion: "Log in",
    nota: "By creating an account you agree that we store your groups and expenses so we can show them to you when you log in.",
    tuNombre: "Your name",
    nombrePlaceholder: "Ana Ramirez",
    correo: "Email",
    correoPlaceholder: "you@example.com",
    correoAyuda: "We'll send a code to confirm it's yours.",
    contrasena: "Password",
    contrasenaPlaceholder: "At least 8 characters",
    crearCuentaGratis: "Create free account",
    enviandoCodigo: "Sending code...",
    confirmaCorreo: "Confirm your email",
    codigoEnviado: (correo: string | null) =>
      `We sent a 6-digit code${correo ? ` to ${correo}` : ""}. Your account is created once you confirm it.`,
    crearMiCuenta: "Create my account",
    usarOtroCorreo: "Use another email",
  },

  unirse: {
    metaTitulo: "Join with a code",
    metaDescripcion:
      "Enter the code you were given to join the group and log what you paid.",
    titulo: "Join with a code",
    descripcion: "Enter the code you were given to join the group.",
    codigoPlaceholder: "e.g. K7M2QPXY",
    entrar: "Join",
    enlaceMuerto: "This link no longer works",
    enlaceMuertoDetalle:
      "The group may have been archived, or whoever created it generated a new link. Ask them for the current code.",
    irCalculadora: "Go to the calculator",
    unirteA: (nombre: string) => `Join “${nombre}”`,
    resumenGrupo: (gastos: number, moneda: string) =>
      `${gastos} expenses logged · ${moneda}. If you're already on the list, claim your name so the balances land on your account.`,
    cualEresTu: "Which one is you?",
    todosVinculados:
      "Everyone on the list already has an account linked. You can join as someone new.",
    entrando: "Joining...",
    soy: (nombre: string) => `I'm ${nombre}`,
    entrarComoNuevo: "Join as a new member",
    mejorNuevo: "Actually, join as someone new",
    yaEstas: "You're in the group.",
    errorUnirse: "Couldn't join the group.",
  },

  contrasena: {
    enlaceInvalido: "Invalid or expired link",
    enlaceInvalidoDetalle:
      "Sorry, this link is no longer valid or has expired. Request a new password reset.",
    restablecer: "Reset password",
    nuevaContrasena: "New password",
    confirmarContrasena: "Confirm password",
    minimoSeis: "Password must be at least 6 characters",
    noCoinciden: "Passwords don't match",
    cambiada: "Password changed successfully",
    errorCambio: "Couldn't change the password",
    errorCambioDetalle: "The password wasn't updated. Request a new link.",
    errorDesconocido: "Unknown error",
    cambiando: "Changing...",
    cambiarContrasena: "Change password",
    obligatorioTitulo: "Change your password",
    obligatorioDetalle: "For security, update your password to continue.",
    minimoOcho: "At least 8 characters.",
    validacionMinimoOcho: "At least 8 characters",
    repiteContrasena: "Type the password again to confirm.",
    mostrarContrasena: "Show password",
    ocultarContrasena: "Hide password",
    mostrarConfirmacion: "Show confirmation",
    ocultarConfirmacion: "Hide confirmation",
    guardando: "Saving...",
    actualizar: "Update password",
    cargando: "Loading...",
  },

  noEncontrado: {
    titulo: "Page not found",
    detalle: "Sorry, the page you're looking for doesn't exist or has been moved.",
    volver: "Back to home",
  },

  acciones: {
    faltanCredenciales: "Enter your username or email and your password.",
    credencialesInvalidas: "Invalid username, email or password.",
    sesionIniciada: "Logged in successfully.",
    escribeCodigo: "Enter the code we sent you.",
    codigoNuevo: "We sent you a new code.",
    correoInvalido: "That email isn't valid.",
    contrasenaCorta: "Password must be at least 8 characters.",
    listo: "All set!",
    completaCampos: "Fill in every field.",
    escribeNombre: "Enter your name.",
  },

  contacto: {
    escribenosA: "Write to us at",
  },

  errores: {
    credenciales: "Invalid username or password",
    cambioContrasena: "Couldn't change the password",
    servidorSinConfigurar: "The server isn't configured. Try again later.",
    cuentaDesactivada: "Your account is disabled. Contact an administrator.",
    cuentaNoDisponible: "Your account isn't available.",

    googleSinCredencial: "We didn't receive a credential from Google.",
    googleSinValidar: "We couldn't validate your Google account. Try again.",
    googleCorreoSinVerificar: "Your Google email isn't verified.",
    googleFallo: "We couldn't sign you in with Google.",

    sesionFallo: "We couldn't log you in. Try again.",
    sesionCaducada: "Your request expired. Log in again.",
    codigoSinValidar: "We couldn't validate the code.",

    correoYaRegistrado: "That email already has an account. Log in instead.",
    registroFallo: "We couldn't create your account. Try again.",
    registroIncompleto: "We couldn't finish your registration.",
    registroCaducado: "Your request expired. Sign up again.",

    codigoReciente: "We already sent you a code a moment ago. Check your email.",
    codigoNoEnviado: "We couldn't send the code. Try again in a moment.",
    codigoSeisDigitos: "The code is 6 digits.",
    codigoSinPendiente: "There's no pending code. Request a new one.",
    codigoCaducado: "The code expired. Request a new one.",
    codigoDemasiadosIntentos: "Too many attempts. Request a new code.",
    codigoIncorrecto: (restantes: number) =>
      `Wrong code. ${restantes === 1 ? "1 attempt left" : `${restantes} attempts left`}.`,

    registroSinPendiente: "There's no pending registration. Start over.",
    registroCodigoCaducado: "The code expired. Sign up again.",
    registroDemasiadosIntentos: "Too many attempts. Sign up again.",
  },
};

export default en;
