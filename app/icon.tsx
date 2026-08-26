import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** Favicon generado en tiempo de build: no depende de assets binarios. */
export default function Icon() {
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
          fontSize: 300,
          fontWeight: 700,
          letterSpacing: -12,
        }}
      >
        ¢
      </div>
    ),
    { ...size }
  );
}
