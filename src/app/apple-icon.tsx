import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#f27a1a",
          color: "#fff",
          fontSize: 110,
          fontWeight: 800,
        }}
      >
        K
      </div>
    ),
    size,
  );
}
