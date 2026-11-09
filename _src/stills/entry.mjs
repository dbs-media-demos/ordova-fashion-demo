// Bundled by render.mjs (esbuild) into a standalone page that runs the site's own cloth scene.
import { createClothScene } from "../../src/components/fx/cloth/ClothScene.ts";

const q = new URLSearchParams(location.search);
const canvas = document.querySelector("canvas");
canvas.style.width = "1200px";
canvas.style.height = "800px";
createClothScene(canvas, { mode: q.get("mode") || "hero", fabric: q.get("fabric") || "linen" })
  .then((scene) => {
    window.__scene = scene;
    window.__ready = true; // settled, compiled and drawn once: snapshot() renders on demand
  })
  .catch((e) => (window.__error = String(e && e.stack ? e.stack : e)));
