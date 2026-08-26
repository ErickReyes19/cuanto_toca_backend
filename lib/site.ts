/**
 * Datos del sitio en un solo lugar: los usan el metadata del layout, el
 * sitemap, el robots.txt, el manifest y el JSON-LD de la portada.
 */

function normalizarUrl(valor: string | undefined) {
  const url = valor?.trim() || "http://localhost:3000";
  return url.replace(/\/+$/, "");
}

export const SITIO = {
  nombre: "Cuánto Toca",
  nombreCorto: "CuántoToca",
  url: normalizarUrl(process.env.NEXT_PUBLIC_APP_URL),
  descripcion:
    "Calcula quién le debe a quién después de una salida o de la despensa. Divide gastos entre amigos gratis, sin cuenta y sin límite de gastos.",
  descripcionCorta: "Divide gastos entre amigos y sabe quién le debe a quién.",
  locale: "es_HN",
  idioma: "es",
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
  /** Color de la barra del navegador en móvil y del manifest. */
  colorTema: "#0c0a09",
  colorFondo: "#ffffff",
} as const;

/** Rutas públicas que sí queremos en el sitemap y abiertas a los buscadores. */
export const RUTAS_PUBLICAS = [
  { ruta: "/", prioridad: 1, frecuencia: "weekly" as const },
  { ruta: "/registro", prioridad: 0.6, frecuencia: "monthly" as const },
  { ruta: "/login", prioridad: 0.4, frecuencia: "monthly" as const },
  { ruta: "/unirse", prioridad: 0.5, frecuencia: "monthly" as const },
];

/**
 * Todo lo que queda detrás de sesión o es de un solo uso. No debe indexarse ni
 * aparecer en el sitemap.
 */
export const RUTAS_PRIVADAS = [
  "/dashboard",
  "/grupos",
  "/usuarios",
  "/roles",
  "/permisos",
  "/reset-password",
  "/forgot-password",
  "/unirse/",
];
