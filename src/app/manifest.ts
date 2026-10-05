import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ordova — Bishop Arts, Dallas",
    short_name: "Ordova",
    description: "Concept store and small-batch label in Bishop Arts, Dallas.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f3ee",
    theme_color: "#151513",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
