/**
 * Branded social image system: Open Graph cards (1200×630) and Pinterest pins
 * (1000×1500, 2:3). Rendered at build time with next/og.
 *
 * Pins use original illustrations only. They never present an illustration
 * as a photograph of a specific recommended product.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ImageResponse } from "next/og";
import type { Article } from "./content";
import type { PinConcept } from "./schemas";

const FONT_DIR = path.join(process.cwd(), "src/assets/fonts");
const fonts = () => [
  { name: "Cormorant", data: fs.readFileSync(path.join(FONT_DIR, "CormorantGaramond-Medium.ttf")), weight: 500 as const, style: "normal" as const },
  { name: "Cormorant", data: fs.readFileSync(path.join(FONT_DIR, "CormorantGaramond-MediumItalic.ttf")), weight: 500 as const, style: "italic" as const },
  { name: "Inter", data: fs.readFileSync(path.join(FONT_DIR, "Inter-Medium.ttf")), weight: 500 as const, style: "normal" as const },
  { name: "Inter", data: fs.readFileSync(path.join(FONT_DIR, "Inter-SemiBold.ttf")), weight: 600 as const, style: "normal" as const },
];

const C = { ivory: "#F8F4EC", gold: "#B7975B", goldDark: "#7A5F2C", espresso: "#342C25", beige: "#E9DFD0", taupe: "#6E6152", white: "#FFFFFF" };

async function imageDataUri(src: string, width: number, height: number): Promise<string> {
  const file = path.join(process.cwd(), "public", src);
  const buf = await sharp(file).resize(width, height, { fit: "cover", position: "centre" }).png().toBuffer();
  return `data:image/png;base64,${buf.toString("base64")}`;
}

function markSvg(color: string, size: number) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path
        fill={color}
        d="M50 4C56 22 54 40 50 50 46 40 44 22 50 4ZM96 50C78 56 60 54 50 50 60 46 78 44 96 50ZM50 96C44 78 46 60 50 50 54 60 56 78 50 96ZM4 50C22 44 40 46 50 50 40 54 22 56 4 50Z"
      />
    </svg>
  );
}

function Wordmark({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {markSvg(C.gold, size * 1.4)}
      <div style={{ fontFamily: "Cormorant", fontSize: size, letterSpacing: size * 0.22, color }}>THE GILDED SKIN</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Open Graph                                                          */
/* ------------------------------------------------------------------ */

export async function renderOgImage(input: { title: string; eyebrow: string; image: string }) {
  const img = await imageDataUri(input.image, 520, 630);
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: C.ivory }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 56px 48px", width: 680 }}>
          <Wordmark color={C.espresso} size={20} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 18, letterSpacing: 4, color: C.goldDark, textTransform: "uppercase" }}>
              {input.eyebrow}
            </div>
            <div style={{ fontFamily: "Cormorant", fontSize: input.title.length > 60 ? 54 : 62, lineHeight: 1.05, color: C.espresso, marginTop: 18 }}>
              {input.title}
            </div>
          </div>
          <div style={{ display: "flex", width: 64, height: 2, background: C.gold }} />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} width={520} height={630} alt="" style={{ objectFit: "cover" }} />
      </div>
    ),
    { width: 1200, height: 630, fonts: fonts() },
  );
}

/* ------------------------------------------------------------------ */
/* Pinterest pins                                                       */
/* ------------------------------------------------------------------ */

const PIN_W = 1000;
const PIN_H = 1500;

function Domain({ color }: { color: string }) {
  return <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 22, letterSpacing: 5, color }}>THEGILDEDSKIN.COM</div>;
}

export async function renderPin(article: Pick<Article, "featuredImage" | "title">, pin: PinConcept) {
  const kicker = (pin.kicker ?? "Beauty Guide").toUpperCase();
  const headline = pin.title;
  const headSize = headline.length > 48 ? 82 : headline.length > 32 ? 96 : 108;
  let body: React.ReactElement;

  switch (pin.template) {
    case "comparison":
    case "routine": {
      // Dark editorial: espresso panel, gold kicker, illustration window.
      const img = await imageDataUri(article.featuredImage, 840, 700);
      body = (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: C.espresso, padding: 80 }}>
          <Wordmark color={C.ivory} size={22} />
          <div style={{ display: "flex", marginTop: 50, borderRadius: 420, overflow: "hidden", width: 840, height: 700, borderTopLeftRadius: 420, borderTopRightRadius: 420, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} width={840} height={700} alt="" />
          </div>
          <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 24, letterSpacing: 6, color: C.gold, marginTop: 56 }}>{kicker}</div>
          <div style={{ fontFamily: "Cormorant", fontSize: headSize * 0.82, lineHeight: 1.02, color: C.ivory, marginTop: 18 }}>{headline}</div>
          <div style={{ display: "flex", flex: 1 }} />
          <Domain color={C.gold} />
        </div>
      );
      break;
    }
    case "checklist": {
      const img = await imageDataUri(article.featuredImage, 1000, 560);
      body = (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: C.beige }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} width={1000} height={560} alt="" />
          <div style={{ display: "flex", flexDirection: "column", padding: "64px 80px 72px", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ display: "flex", width: 40, height: 40, border: `3px solid ${C.goldDark}`, alignItems: "center", justifyContent: "center" }}>
                <svg width="26" height="26" viewBox="0 0 24 24">
                  <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke={C.goldDark} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 24, letterSpacing: 6, color: C.goldDark }}>{kicker}</div>
            </div>
            <div style={{ fontFamily: "Cormorant", fontSize: headSize * 0.92, lineHeight: 1.02, color: C.espresso, marginTop: 30 }}>{headline}</div>
            <div style={{ display: "flex", flex: 1 }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Wordmark color={C.espresso} size={20} />
            </div>
          </div>
        </div>
      );
      break;
    }
    case "gift-guide": {
      const img = await imageDataUri(article.featuredImage, 760, 640);
      body = (
        <div style={{ display: "flex", width: "100%", height: "100%", background: C.ivory, padding: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", height: "100%", border: `3px solid ${C.gold}`, padding: "70px 80px" }}>
            <Wordmark color={C.espresso} size={20} />
            <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 24, letterSpacing: 6, color: C.goldDark, marginTop: 56 }}>{kicker}</div>
            <div style={{ fontFamily: "Cormorant", fontSize: headSize * 0.9, lineHeight: 1.02, color: C.espresso, marginTop: 20, textAlign: "center" }}>{headline}</div>
            <div style={{ display: "flex", flex: 1 }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} width={760} height={640} alt="" />
            <div style={{ display: "flex", marginTop: 34 }}>
              <Domain color={C.taupe} />
            </div>
          </div>
        </div>
      );
      break;
    }
    case "organization":
    case "roundup":
    default: {
      // Full-bleed illustration with an ivory card.
      const img = await imageDataUri(article.featuredImage, PIN_W, PIN_H);
      body = (
        <div style={{ display: "flex", width: "100%", height: "100%", position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} width={PIN_W} height={PIN_H} alt="" style={{ position: "absolute", top: 0, left: 0 }} />
          <div style={{ display: "flex", position: "absolute", top: 70, left: 0, right: 0, justifyContent: "center" }}>
            <Wordmark color={C.espresso} size={22} />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              position: "absolute",
              left: 70,
              right: 70,
              bottom: 70,
              background: C.ivory,
              padding: "60px 64px 54px",
              boxShadow: "0 20px 60px rgba(52,44,37,0.18)",
            }}
          >
            <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 24, letterSpacing: 6, color: C.goldDark }}>{kicker}</div>
            <div style={{ fontFamily: "Cormorant", fontSize: headSize * 0.86, lineHeight: 1.02, color: C.espresso, marginTop: 20 }}>{headline}</div>
            <div style={{ display: "flex", width: 80, height: 3, background: C.gold, marginTop: 34 }} />
            <div style={{ display: "flex", marginTop: 28 }}>
              <Domain color={C.taupe} />
            </div>
          </div>
        </div>
      );
    }
  }

  return new ImageResponse(body, { width: PIN_W, height: PIN_H, fonts: fonts() });
}
