import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";

// Fonts and the default photo are read once; paths relative to this file are traced into the deployment.
const [display, mono, photo] = await Promise.all([
  readFile(new URL("../../../assets/fonts/Syne-800.ttf", import.meta.url)),
  readFile(new URL("../../../assets/fonts/DMMono-400.ttf", import.meta.url)),
  readFile(new URL("../../../assets/og/og-photo.jpg", import.meta.url)),
]);
const defaultPhoto = `data:image/jpeg;base64,${photo.toString("base64")}`;

/** Branded 1200×630 share card: /api/og?title=…&kicker=…&img=/images/… */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "Fewer, better clothes").slice(0, 90).toUpperCase();
  const kicker = (searchParams.get("kicker") ?? "Bishop Arts · Dallas").slice(0, 50).toUpperCase();
  const img = searchParams.get("img");
  const src = img && img.startsWith("/images/") ? new URL(img, req.url).toString() : defaultPhoto;
  const size = title.length > 50 ? 46 : title.length > 28 ? 58 : 76;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: "#ece7de", fontFamily: "Mono" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 60, width: 700, height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "Syne", fontSize: 40, color: "#151513", letterSpacing: -1 }}>
            <svg width="32" height="32" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38.5" fill="none" stroke="#151513" strokeWidth="21" strokeDasharray="231.9 10" strokeDashoffset="-5" transform="rotate(-90 50 50)" />
            </svg>
            RDOVA
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", fontSize: 20, color: "#2b36f0", letterSpacing: 3 }}>{kicker}</div>
            <div style={{ display: "flex", fontFamily: "Syne", fontSize: size, lineHeight: 0.95, color: "#151513", letterSpacing: -2 }}>{title}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: "#5c5850", letterSpacing: 2 }}>
            <div style={{ display: "flex" }}>CUT & SEWN IN DALLAS</div>
            <div style={{ display: "flex" }}>FREE SHIPPING OVER $150</div>
          </div>
        </div>
        <div style={{ display: "flex", width: 500, height: 630, position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={src} width={500} height={630} style={{ objectFit: "cover", width: 500, height: 630 }} />
          <div style={{ position: "absolute", left: 0, top: 0, width: 10, height: 630, backgroundColor: "#2b36f0", display: "flex" }} />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Syne", data: display, weight: 800, style: "normal" },
        { name: "Mono", data: mono, weight: 400, style: "normal" },
      ],
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
  );
}
