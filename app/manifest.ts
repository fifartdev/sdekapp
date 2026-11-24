import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ΚΕΔ ΟΣΕΚΑ - Ορισμοί Διαιτητών",
    short_name: "ΚΕΔ ΟΣΕΚΑ",
    description: "Εφαρμογή Ορισμών Διαιτητών - ΚΕΔ ΟΣΕΚΑ",
    lang: "el",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    theme_color: "#143694",
    // Matches the icon background so the launch splash and icon read as one.
    background_color: "#215aa7",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
