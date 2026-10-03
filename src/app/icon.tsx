import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#100e0c",
          color: "#e7b656",
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        M
      </div>
    ),
    size,
  );
}
