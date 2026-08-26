import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Ícono para "Agregar a pantalla de inicio" en iOS. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)",
          color: "#fafaf9",
          fontSize: 108,
          fontWeight: 700,
          letterSpacing: -4,
        }}
      >
        ¢
      </div>
    ),
    { ...size }
  );
}
