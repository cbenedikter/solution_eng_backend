import { ImageResponse } from "next/og"

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = "image/png"

// Image generation
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 24,
        background: "transparent",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Outer red circle */}
      <div
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          background: "#E53E3E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Inner white circle */}
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Red "1" */}
          <div
            style={{
              color: "#E53E3E",
              fontSize: "14px",
              fontWeight: "bold",
              fontFamily: "Arial, sans-serif",
            }}
          >
            1
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  )
}
