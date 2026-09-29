import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { person, worlds } from "@/content/ecosystem";
import { siteUrl } from "@/lib/site";
import { genesisBootScript } from "@/lib/boot";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const description = `${person.name} — ${person.positioning.join(", ")}. ${person.tagline} A personal digital universe: eleven worlds, one ecosystem.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${person.name} — Building ideas into ecosystems`,
    template: `%s · ${person.name}`,
  },
  description,
  applicationName: `${person.name} — Founder OS`,
  authors: [{ name: person.name }],
  creator: person.name,
  keywords: [
    person.name,
    ...person.positioning,
    ...worlds.map((w) => w.name),
    "ecosystem",
    "founder",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    title: `${person.name} — Building ideas into ecosystems`,
    description,
    url: "/",
    siteName: person.name,
    firstName: person.firstName,
    lastName: person.lastName,
  },
  twitter: {
    card: "summary_large_image",
    title: `${person.name} — Building ideas into ecosystems`,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#06070a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: person.name,
  url: siteUrl,
  jobTitle: "Founder",
  description,
  knowsAbout: ["Artificial intelligence", "Entrepreneurship", "Digital strategy", "Education", "Media", "Social impact", "Real estate"],
  affiliation: worlds.map((w) => ({
    "@type": "Organization",
    name: w.name,
    ...(w.url ? { url: w.url } : {}),
  })),
  ...(person.links.linkedin ? { sameAs: [person.links.linkedin] } : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${instrument.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: genesisBootScript }} />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
