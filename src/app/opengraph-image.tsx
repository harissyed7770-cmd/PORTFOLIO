import { ImageResponse } from "next/og";
import { person, worlds } from "@/content/ecosystem";

export const alt = `${person.name} — ${person.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "#06070a",
          color: "#f3f1eb",
          padding: 72,
          position: "relative",
        }}
      >
        {worlds.map((w, i) => {
          const a = (i / worlds.length) * Math.PI * 2;
          return (
            <div
              key={w.id}
              style={{
                position: "absolute",
                left: 900 + Math.cos(a) * 180,
                top: 315 + Math.sin(a) * 180,
                width: 14,
                height: 14,
                borderRadius: 14,
                background: w.accent,
              }}
            />
          );
        })}
        <div style={{ position: "absolute", left: 888, top: 303, width: 24, height: 24, borderRadius: 24, background: "#f3f1eb" }} />
        <div style={{ fontSize: 22, letterSpacing: 6, color: "#b9bcc4", display: "flex" }}>FOUNDER OS</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 120, fontWeight: 800, letterSpacing: -5, lineHeight: 0.9, textTransform: "uppercase" }}>{person.name}</div>
          <div style={{ fontSize: 40, marginTop: 24, color: "#dfe1e5", fontStyle: "italic" }}>{person.tagline}</div>
        </div>
        <div style={{ fontSize: 22, letterSpacing: 4, color: "#7d818b", display: "flex" }}>
          {`${worlds.length} WORLDS · ONE ECOSYSTEM · ${person.audience.display} ${person.audience.platform.toUpperCase()} FOLLOWERS`}
        </div>
      </div>
    ),
    size,
  );
}
