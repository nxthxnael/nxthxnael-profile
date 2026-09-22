import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "nxthxnael — Developer, Designer, Entrepreneur",
    short_name: "nxthxnael",
    description: "Portfolio of nxthxnael — developer, designer, and entrepreneur.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f7fb",
    theme_color: "#4338ca",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
