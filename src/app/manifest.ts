import type { MetadataRoute } from "next";

// Web App Manifest (Next.js 16 metadata route). Makes the app installable
// ("Zum Homescreen hinzufügen"). Colors follow the Noir theme; start_url goes
// straight to the dashboard.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TravelPlanner – Reisen & Events gemeinsam planen",
    short_name: "TravelPlanner",
    description:
      "Kollaborativ Reisen und Events planen: Flüge, Unterkünfte, Gegenden, Kosten und Mitreisende an einem Ort.",
    lang: "de",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f4f4f5",
    theme_color: "#18181b",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
