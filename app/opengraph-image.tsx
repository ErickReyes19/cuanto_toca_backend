import { ImageResponse } from "next/og";

import { SITIO } from "@/lib/site";

export const alt = `${SITIO.nombre} · Divide gastos entre amigos`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Imagen que se ve al compartir el enlace en WhatsApp, X, Slack, etc.
 * Next la reutiliza para `og:image` y `twitter:image`.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #1c1917 0%, #0c0a09 60%)",
          color: "#fafaf9",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "#fafaf9",
              color: "#0c0a09",
              fontSize: 46,
              fontWeight: 700,
            }}
          >
            ¢
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 600, opacity: 0.85 }}>
            {SITIO.nombre}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 78, fontWeight: 700, lineHeight: 1.05 }}>
            ¿Cuánto le toca a cada quien?
          </div>
          <div style={{ display: "flex", fontSize: 34, opacity: 0.75, maxWidth: 900 }}>
            Anota quién puso qué y te decimos el número exacto de pagos para quedar a mano.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 26, opacity: 0.6 }}>
          <div style={{ display: "flex" }}>Gratis</div>
          <div style={{ display: "flex" }}>·</div>
          <div style={{ display: "flex" }}>Sin cuenta para calcular</div>
          <div style={{ display: "flex" }}>·</div>
          <div style={{ display: "flex" }}>Sin límite de gastos</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
