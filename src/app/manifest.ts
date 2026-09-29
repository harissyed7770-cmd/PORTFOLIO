import type { MetadataRoute } from "next";
import { person } from "@/content/ecosystem";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${person.name} — Founder OS`,
    short_name: "Haris Afnan",
    description: person.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#06070a",
    theme_color: "#06070a",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
