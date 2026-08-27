import { NextResponse, type NextRequest } from "next/server";

import { LANG_HTML, idiomaDeRuta } from "@/lib/i18n/idiomas";

/**
 * Capa de seguridad HTTP. En Next 16 el archivo `middleware` quedó deprecado y
 * se renombró a `proxy`; corre antes de renderizar cualquier ruta.
 *
 * Aquí van cabeceras: la autorización de cada pantalla sigue viviendo en los
 * layouts y server actions, que son los únicos que pueden consultar la base y
 * el rol de la sesión. Lo único que se agrega es el idioma de la URL, para que
 * páginas y server actions lo lean sin pasárselo por props.
 */

const ES_PRODUCCION = process.env.NODE_ENV === "production";

/** Orígenes de Google Identity Services (login con Google). */
const GOOGLE_SCRIPTS = "https://accounts.google.com https://apis.google.com";
const GOOGLE_FRAMES = "https://accounts.google.com";
const GOOGLE_CONEXIONES = "https://accounts.google.com https://www.googleapis.com";
const GOOGLE_IMAGENES = "https://lh3.googleusercontent.com https://*.googleusercontent.com";

/**
 * Google AdSense. Ojo: 'strict-dynamic' solo cubre SCRIPTS, así que los
 * iframes, las imágenes y las llamadas de los anuncios sí necesitan que sus
 * dominios estén listados aquí explícitamente.
 */
const ADS_SCRIPTS =
  "https://pagead2.googlesyndication.com https://partner.googleadservices.com " +
  "https://tpc.googlesyndication.com https://adservice.google.com";
const ADS_FRAMES =
  "https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com " +
  "https://*.adtrafficquality.google";
const ADS_IMAGENES =
  "https://*.g.doubleclick.net https://*.googlesyndication.com https://www.google.com " +
  "https://pagead2.googlesyndication.com https://*.adtrafficquality.google";
// adtrafficquality es la deteccion de trafico invalido de Google. Si se
// bloquea, AdSense lo cuenta en contra de la cuenta.
const ADS_CONEXIONES =
  "https://pagead2.googlesyndication.com https://*.g.doubleclick.net https://csi.gstatic.com " +
  "https://*.adtrafficquality.google";

function construirCsp(nonce: string) {
  // En desarrollo React usa `eval` para reconstruir los stacks del servidor y
  // Turbopack habla por WebSocket; en producción nada de eso hace falta.
  const scriptDev = ES_PRODUCCION ? "" : " 'unsafe-eval'";
  const conexionDev = ES_PRODUCCION ? "" : " ws: wss: http://localhost:* http://127.0.0.1:*";

  return [
    `default-src 'self'`,
    // 'strict-dynamic' hace que los navegadores modernos ignoren la lista de
    // dominios y confíen solo en lo que cargue un script con nonce. Los
    // dominios quedan como respaldo para navegadores que solo soportan CSP2.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${GOOGLE_SCRIPTS} ${ADS_SCRIPTS} https: 'unsafe-inline'${scriptDev}`,
    // Base UI y shadcn escriben estilos en el atributo `style` (ancho del
    // sidebar, posición de los popovers). Un nonce no cubre atributos inline,
    // así que aquí 'unsafe-inline' es obligatorio para que la UI no se rompa.
    `style-src 'self' 'unsafe-inline' ${GOOGLE_FRAMES}`,
    `img-src 'self' data: blob: ${GOOGLE_IMAGENES} ${ADS_IMAGENES}`,
    `font-src 'self' data:`,
    `connect-src 'self' ${GOOGLE_CONEXIONES} ${ADS_CONEXIONES}${conexionDev}`,
    `frame-src 'self' ${GOOGLE_FRAMES} ${ADS_FRAMES}`,
    `worker-src 'self' blob:`,
    `manifest-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    ...(ES_PRODUCCION ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

/**
 * Petición especulativa: el navegador va adelantando una ruta, no estrenando
 * documento.
 *
 * Solo se miran cabeceras estándar del navegador. Las suyas propias
 * (`RSC`, `Next-Router-Prefetch`) Next las consume antes de llegar al proxy,
 * así que aquí no existen: se ven únicamente `purpose` y `sec-purpose`.
 */
function esPrefetch(request: NextRequest) {
  return (
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("sec-purpose")?.includes("prefetch") === true
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const idioma = idiomaDeRuta(pathname);

  const requestHeaders = new Headers(request.headers);

  // El idioma sale del primer segmento de la ruta: `/en/...` es inglés y todo
  // lo demás español. No se redirige por `Accept-Language`: Googlebot rastrea
  // desde Estados Unidos y un redirect automático terminaría sacando la
  // portada en español del índice.
  //
  // Esto tiene que pasar también en los prefetch. Un prefetch de `/en/login`
  // renderiza la página igual, solo que en formato RSC: si se quedara sin
  // cabecera, la pantalla llegaría precargada en español y el usuario vería
  // el idioma equivocado al hacer clic.
  requestHeaders.set("x-idioma", idioma);
  // La ruta, para que el selector de idioma sepa a qué traducción apuntar.
  requestHeaders.set("x-ruta", pathname);

  // Los prefetch no estrenan documento, así que se ahorran nonce y CSP. Antes
  // esto lo hacía el `missing` del matcher, pero ahí también se saltaba el
  // idioma; ahora entran, recogen la cabecera y salen por aquí.
  if (esPrefetch(request)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const nonce = crypto.randomUUID().replaceAll("-", "");
  const csp = construirCsp(nonce);

  // Next lee el CSP del *request* para inyectar el nonce en sus propios
  // scripts durante el render.
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set("content-security-policy", csp);
  response.headers.set("content-language", LANG_HTML[idioma]);

  // Nada de sniffing de MIME types.
  response.headers.set("x-content-type-options", "nosniff");
  // Respaldo de `frame-ancestors` para navegadores viejos.
  response.headers.set("x-frame-options", "DENY");
  // No filtrar la ruta completa al salir del sitio.
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  // Apagamos APIs del navegador que esta app no usa.
  response.headers.set(
    "permissions-policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
  );
  // `allow-popups` es indispensable: el login de Google abre una ventana.
  response.headers.set("cross-origin-opener-policy", "same-origin-allow-popups");
  response.headers.set("cross-origin-resource-policy", "same-origin");
  response.headers.set("x-dns-prefetch-control", "on");

  if (ES_PRODUCCION) {
    // Cloudflare ya sirve por HTTPS; esto le dice al navegador que no vuelva a
    // intentar por HTTP durante dos años, subdominios incluidos.
    response.headers.set(
      "strict-transport-security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Todo menos los estáticos y los archivos de SEO, que no son HTML y
     * conviene que Cloudflare pueda cachear sin variaciones por nonce.
     *
     * Los prefetch ya no se excluyen aquí: entran al proxy para recoger el
     * idioma y salen antes de tocar el CSP (ver `esPrefetch`).
     */
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml|webmanifest)$).*)",
  ],
};
