/**
 * Original editorial illustration kit for The Gilded Skin.
 *
 * Generates still-life scenes (plinths, generic bottles, tools, botanicals)
 * as SVG. These are decorative illustrations of product *types* — they never
 * depict a specific branded product and are recorded as kind "illustration"
 * in content/images.json.
 */

export const C = {
  ivory: "#F8F4EC",
  cream: "#F1E9DC",
  beige: "#E9DFD0",
  sand: "#DCCDB6",
  taupe: "#9B8C7B",
  espresso: "#342C25",
  gold: "#B7975B",
  goldLight: "#D9C59C",
  goldDeep: "#8F7240",
  blush: "#E9CFC4",
  rose: "#DDB3A6",
  sage: "#B4BCA6",
  sageDeep: "#7F8C72",
  amber: "#C7955C",
  white: "#FFFDF9",
};

export type Obj = (o: { x: number; y: number; s?: number; tint?: string; flip?: boolean }) => string;

const t = (x: number, y: number, s = 1, flip = false) =>
  `transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${flip ? -s : s} ${s})"`;

export function defs(id: string): string {
  return `<defs>
  <linearGradient id="${id}-wall" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#FBF8F2"/><stop offset="1" stop-color="${C.beige}"/></linearGradient>
  <linearGradient id="${id}-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sand}"/><stop offset="1" stop-color="#CFBDA3"/></linearGradient>
  <linearGradient id="${id}-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.goldLight}"/><stop offset="0.5" stop-color="${C.gold}"/><stop offset="1" stop-color="${C.goldDeep}"/></linearGradient>
  <linearGradient id="${id}-glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/><stop offset="0.35" stop-color="#ffffff" stop-opacity="0.1"/><stop offset="1" stop-color="#000000" stop-opacity="0.12"/></linearGradient>
  <linearGradient id="${id}-shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#3a2a1a" stop-opacity="0.16"/></linearGradient>
  <radialGradient id="${id}-glow" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="#FFFDF7" stop-opacity="0.95"/><stop offset="1" stop-color="#FFFDF7" stop-opacity="0"/></radialGradient>
  <filter id="${id}-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="${id}-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>
  <filter id="${id}-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.16  0 0 0 0 0.12  0 0 0 0.05 0"/></filter>
</defs>`;
}

/** Backdrop: wall, surface, arched light window and diagonal sun stripes. */
export function backdrop(id: string, w: number, h: number, opts: { horizon?: number; arch?: boolean; stripes?: boolean; wall?: string } = {}): string {
  const hy = h * (opts.horizon ?? 0.66);
  let s = `<rect width="${w}" height="${h}" fill="${opts.wall ?? `url(#${id}-wall)`}"/>`;
  if (opts.arch !== false) {
    const aw = w * 0.42;
    const ax = w * 0.5 - aw / 2;
    const top = h * 0.08;
    s += `<path d="M${ax} ${hy} V${top + aw / 2} A${aw / 2} ${aw / 2} 0 0 1 ${ax + aw} ${top + aw / 2} V${hy} Z" fill="${C.cream}" opacity="0.9"/>`;
    s += `<ellipse cx="${w * 0.5}" cy="${top + aw * 0.6}" rx="${aw * 0.7}" ry="${aw * 0.8}" fill="url(#${id}-glow)"/>`;
  }
  s += `<rect y="${hy}" width="${w}" height="${h - hy}" fill="url(#${id}-floor)"/>`;
  s += `<rect y="${hy}" width="${w}" height="3" fill="#ffffff" opacity="0.45"/>`;
  if (opts.stripes !== false) {
    let stripes = "";
    for (let i = 0; i < 4; i++) {
      const x0 = w * (0.05 + i * 0.16);
      stripes += `<polygon points="${x0},0 ${x0 + w * 0.07},0 ${x0 + w * 0.55},${h} ${x0 + w * 0.42},${h}" fill="#ffffff"/>`;
    }
    s += `<g opacity="0.13" filter="url(#${id}-soft)">${stripes}</g>`;
  }
  return s;
}

export function grain(id: string, w: number, h: number): string {
  return `<rect width="${w}" height="${h}" filter="url(#${id}-grain)" opacity="0.6"/>`;
}

export function shadow(id: string, x: number, y: number, rx: number, ry = rx * 0.16, opacity = 0.28): string {
  return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${C.espresso}" opacity="${opacity}" filter="url(#${id}-blur)"/>`;
}

/* ----------------------------- objects ------------------------------ */
// Each object is drawn with its base centered on (0,0), extending upward.

export const plinth = (id: string): Obj => ({ x, y, s = 1, tint = C.ivory }) =>
  `<g ${t(x, y, s)}>
   <rect x="-150" y="-120" width="300" height="120" fill="${tint}"/>
   <rect x="-150" y="-120" width="300" height="120" fill="url(#${id}-shade)"/>
   <ellipse cx="0" cy="-120" rx="150" ry="26" fill="${C.white}"/>
   <ellipse cx="0" cy="0" rx="150" ry="26" fill="${tint}"/>
   <rect x="-150" y="-1" width="300" height="2" fill="${tint}"/>
  </g>`;

export const dropper = (id: string): Obj => ({ x, y, s = 1, tint = C.amber, flip }) =>
  `<g ${t(x, y, s, flip)}>
   <rect x="-44" y="-170" width="88" height="170" rx="18" fill="${tint}"/>
   <rect x="-44" y="-170" width="88" height="170" rx="18" fill="url(#${id}-glass)"/>
   <rect x="-30" y="-120" width="60" height="62" rx="3" fill="${C.ivory}" opacity="0.92"/>
   <rect x="-20" y="-104" width="40" height="3" fill="${C.goldDeep}" opacity="0.7"/>
   <rect x="-14" y="-94" width="28" height="2" fill="${C.taupe}" opacity="0.6"/>
   <rect x="-24" y="-196" width="48" height="30" rx="4" fill="url(#${id}-gold)"/>
   <path d="M-17 -196 C-19 -250 19 -250 17 -196 Z" fill="${C.espresso}"/>
   <rect x="-34" y="-160" width="8" height="120" rx="4" fill="#fff" opacity="0.35"/>
  </g>`;

export const pump = (id: string): Obj => ({ x, y, s = 1, tint = C.white, flip }) =>
  `<g ${t(x, y, s, flip)}>
   <rect x="-52" y="-240" width="104" height="240" rx="12" fill="${tint}"/>
   <rect x="-52" y="-240" width="104" height="240" rx="12" fill="url(#${id}-shade)"/>
   <rect x="-36" y="-170" width="72" height="80" fill="${C.beige}" opacity="0.7"/>
   <rect x="-24" y="-150" width="48" height="4" fill="${C.espresso}" opacity="0.55"/>
   <rect x="-16" y="-138" width="32" height="2" fill="${C.espresso}" opacity="0.35"/>
   <rect x="-20" y="-262" width="40" height="24" rx="3" fill="url(#${id}-gold)"/>
   <rect x="-7" y="-300" width="14" height="40" fill="url(#${id}-gold)"/>
   <path d="M-12 -312 H44 V-300 H-12 Z" fill="url(#${id}-gold)"/>
  </g>`;

export const jar = (id: string): Obj => ({ x, y, s = 1, tint = C.white, flip }) =>
  `<g ${t(x, y, s, flip)}>
   <rect x="-78" y="-92" width="156" height="92" rx="20" fill="${tint}"/>
   <rect x="-78" y="-92" width="156" height="92" rx="20" fill="url(#${id}-shade)"/>
   <rect x="-82" y="-128" width="164" height="44" rx="8" fill="url(#${id}-gold)"/>
   <rect x="-82" y="-110" width="164" height="2" fill="#fff" opacity="0.35"/>
   <rect x="-40" y="-60" width="80" height="3" fill="${C.taupe}" opacity="0.6"/>
  </g>`;

export const tube = (id: string): Obj => ({ x, y, s = 1, tint = C.blush, flip }) =>
  `<g ${t(x, y, s, flip)}>
   <path d="M-40 0 L-34 -190 L34 -190 L40 0 Z" fill="${tint}"/>
   <path d="M-40 0 L-34 -190 L34 -190 L40 0 Z" fill="url(#${id}-shade)"/>
   <rect x="-46" y="-206" width="92" height="16" rx="2" fill="${tint}"/>
   <rect x="-26" y="34" width="0" height="0"/>
   <rect x="-30" y="-2" width="60" height="38" rx="6" fill="url(#${id}-gold)" transform="translate(0 0)"/>
   <rect x="-18" y="-120" width="36" height="3" fill="${C.espresso}" opacity="0.45"/>
  </g>`;

export const roller = (id: string): Obj => ({ x, y, s = 1, tint = C.rose, flip }) =>
  `<g ${t(x, y, s, flip)}>
   <path d="M-120 -18 L60 -70" stroke="url(#${id}-gold)" stroke-width="12" stroke-linecap="round"/>
   <path d="M60 -70 L84 -96 M60 -70 L94 -62" stroke="url(#${id}-gold)" stroke-width="7" stroke-linecap="round"/>
   <g transform="rotate(-30 98 -84)"><rect x="72" y="-106" width="60" height="44" rx="20" fill="${tint}"/><rect x="72" y="-106" width="60" height="44" rx="20" fill="url(#${id}-glass)"/></g>
   <rect x="-160" y="-34" width="64" height="30" rx="14" fill="${tint}" transform="rotate(-16 -128 -19)"/>
  </g>`;

export const guaSha = (id: string): Obj => ({ x, y, s = 1, tint = C.sage, flip }) =>
  `<g ${t(x, y, s, flip)}>
   <path d="M-110 -10 C-130 -70 -60 -110 -20 -80 C0 -66 10 -64 30 -80 C70 -110 130 -70 110 -10 C80 10 -80 10 -110 -10 Z" fill="${tint}"/>
   <path d="M-110 -10 C-130 -70 -60 -110 -20 -80 C0 -66 10 -64 30 -80 C70 -110 130 -70 110 -10 C80 10 -80 10 -110 -10 Z" fill="url(#${id}-glass)"/>
   <circle cx="0" cy="-40" r="8" fill="${C.ivory}" opacity="0.55"/>
  </g>`;

export const brush = (id: string): Obj => ({ x, y, s = 1, tint = C.blush, flip }) =>
  `<g ${t(x, y, s, flip)}>
   <rect x="-34" y="-230" width="68" height="230" rx="34" fill="${tint}"/>
   <rect x="-34" y="-230" width="68" height="230" rx="34" fill="url(#${id}-shade)"/>
   <ellipse cx="0" cy="-262" rx="70" ry="64" fill="${tint}"/>
   <ellipse cx="0" cy="-262" rx="70" ry="64" fill="url(#${id}-shade)"/>
   <ellipse cx="0" cy="-262" rx="52" ry="46" fill="${C.white}" opacity="0.55"/>
   ${Array.from({ length: 5 }, (_, r) =>
     Array.from({ length: 5 }, (_, c) => `<circle cx="${-30 + c * 15}" cy="${-292 + r * 15}" r="3" fill="${C.taupe}" opacity="0.45"/>`).join(""),
   ).join("")}
   <rect x="-6" y="-120" width="12" height="12" rx="6" fill="url(#${id}-gold)"/>
  </g>`;

export const mask = (id: string): Obj => ({ x, y, s = 1, tint = C.white }) =>
  `<g ${t(x, y, s)}>
   <path d="M0 -360 C110 -360 150 -270 150 -190 C150 -80 80 0 0 0 C-80 0 -150 -80 -150 -190 C-150 -270 -110 -360 0 -360 Z" fill="${tint}"/>
   <path d="M0 -360 C110 -360 150 -270 150 -190 C150 -80 80 0 0 0 C-80 0 -150 -80 -150 -190 C-150 -270 -110 -360 0 -360 Z" fill="url(#${id}-shade)"/>
   <ellipse cx="-55" cy="-210" rx="34" ry="16" fill="${C.sand}"/>
   <ellipse cx="55" cy="-210" rx="34" ry="16" fill="${C.sand}"/>
   ${[
     [-90, -260], [-40, -290], [0, -300], [40, -290], [90, -260], [-110, -170], [110, -170], [-95, -120], [95, -120],
     [-60, -150], [60, -150], [0, -170], [0, -130], [-45, -100], [45, -100], [-20, -40], [20, -40],
   ]
     .map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="7" fill="#E7A79A" opacity="0.75"/><circle cx="${cx}" cy="${cy}" r="14" fill="#F2B8A8" opacity="0.18"/>`)
     .join("")}
  </g>`;

export const tray = (id: string): Obj => ({ x, y, s = 1 }) =>
  `<g ${t(x, y, s)}>
   <ellipse cx="0" cy="-10" rx="260" ry="46" fill="url(#${id}-gold)"/>
   <ellipse cx="0" cy="-22" rx="244" ry="38" fill="${C.goldLight}"/>
   <ellipse cx="0" cy="-22" rx="244" ry="38" fill="#fff" opacity="0.25"/>
  </g>`;

export const towel = (id: string): Obj => ({ x, y, s = 1, tint = C.white }) =>
  `<g ${t(x, y, s)}>
   <rect x="-150" y="-50" width="300" height="50" rx="22" fill="${tint}"/>
   <rect x="-150" y="-50" width="300" height="50" rx="22" fill="url(#${id}-shade)"/>
   <rect x="-140" y="-100" width="280" height="50" rx="22" fill="${C.beige}"/>
   <rect x="-140" y="-100" width="280" height="50" rx="22" fill="url(#${id}-shade)"/>
   <rect x="-150" y="-26" width="300" height="3" fill="${C.sand}"/>
   <rect x="-140" y="-76" width="280" height="3" fill="${C.sand}"/>
  </g>`;

export const sprig = (_id: string): Obj => ({ x, y, s = 1, tint = C.sageDeep, flip }) => {
  let leaves = "";
  for (let i = 0; i < 9; i++) {
    const yy = -40 - i * 44;
    const side = i % 2 === 0 ? 1 : -1;
    const lx = side * (18 + i * 1.5);
    leaves += `<ellipse cx="${lx}" cy="${yy}" rx="22" ry="12" transform="rotate(${side * -28} ${lx} ${yy})" fill="${tint}" opacity="${0.75 + (i % 3) * 0.08}"/>`;
  }
  return `<g ${t(x, y, s, flip)}><path d="M0 0 C-6 -120 8 -260 -4 -420" stroke="${C.sageDeep}" stroke-width="4" fill="none"/>${leaves}</g>`;
};

export const vase = (id: string): Obj => ({ x, y, s = 1, tint = C.white }) =>
  `<g ${t(x, y, s)}>
   <path d="M-40 0 C-80 -40 -80 -110 -30 -140 L-22 -200 L22 -200 L30 -140 C80 -110 80 -40 40 0 Z" fill="${tint}"/>
   <path d="M-40 0 C-80 -40 -80 -110 -30 -140 L-22 -200 L22 -200 L30 -140 C80 -110 80 -40 40 0 Z" fill="url(#${id}-shade)"/>
  </g>`;

export const sphere = (id: string): Obj => ({ x, y, s = 1, tint = C.goldLight }) =>
  `<g ${t(x, y, s)}><circle cx="0" cy="-60" r="60" fill="${tint}"/><circle cx="0" cy="-60" r="60" fill="url(#${id}-shade)"/><circle cx="-20" cy="-82" r="16" fill="#fff" opacity="0.35"/></g>`;

export const giftBox = (id: string): Obj => ({ x, y, s = 1, tint = C.white }) =>
  `<g ${t(x, y, s)}>
   <rect x="-130" y="-170" width="260" height="170" fill="${tint}"/>
   <rect x="-130" y="-170" width="260" height="170" fill="url(#${id}-shade)"/>
   <rect x="-142" y="-206" width="284" height="44" fill="${C.beige}"/>
   <rect x="-142" y="-206" width="284" height="44" fill="url(#${id}-shade)"/>
   <rect x="-14" y="-206" width="28" height="206" fill="url(#${id}-gold)"/>
   <path d="M0 -206 C-40 -270 -110 -250 -70 -214 C-50 -198 -20 -204 0 -206 Z" fill="url(#${id}-gold)"/>
   <path d="M0 -206 C40 -270 110 -250 70 -214 C50 -198 20 -204 0 -206 Z" fill="url(#${id}-gold)"/>
   <path d="M-6 -206 L-50 -120 M6 -206 L46 -128" stroke="url(#${id}-gold)" stroke-width="12" stroke-linecap="round"/>
  </g>`;

export const pouch = (id: string): Obj => ({ x, y, s = 1, tint = C.sand }) =>
  `<g ${t(x, y, s)}>
   <path d="M-190 0 C-200 -80 -190 -180 -170 -210 L170 -210 C190 -180 200 -80 190 0 Z" fill="${tint}"/>
   <path d="M-190 0 C-200 -80 -190 -180 -170 -210 L170 -210 C190 -180 200 -80 190 0 Z" fill="url(#${id}-shade)"/>
   <rect x="-170" y="-214" width="340" height="12" rx="6" fill="url(#${id}-gold)"/>
   <path d="M150 -208 L178 -160" stroke="url(#${id}-gold)" stroke-width="7" stroke-linecap="round"/>
   <rect x="168" y="-166" width="18" height="34" rx="6" fill="url(#${id}-gold)"/>
   <rect x="-120" y="-120" width="240" height="2" fill="#fff" opacity="0.4"/>
  </g>`;

export const fridge = (id: string): Obj => ({ x, y, s = 1, tint = C.white }) =>
  `<g ${t(x, y, s)}>
   <rect x="-150" y="-300" width="300" height="300" rx="34" fill="${tint}"/>
   <rect x="-150" y="-300" width="300" height="300" rx="34" fill="url(#${id}-shade)"/>
   <rect x="-122" y="-272" width="244" height="244" rx="20" fill="${C.cream}" stroke="${C.sand}" stroke-width="4"/>
   <rect x="-122" y="-160" width="244" height="5" fill="${C.sand}"/>
   <rect x="106" y="-210" width="10" height="90" rx="5" fill="url(#${id}-gold)"/>
   <rect x="-90" y="-250" width="40" height="88" rx="8" fill="${C.amber}" opacity="0.85"/>
   <rect x="-36" y="-236" width="34" height="74" rx="8" fill="${C.blush}"/>
   <rect x="12" y="-226" width="52" height="64" rx="10" fill="${C.white}"/>
   <rect x="-90" y="-140" width="72" height="104" rx="10" fill="${C.sage}" opacity="0.9"/>
   <rect x="0" y="-120" width="58" height="84" rx="8" fill="${C.white}"/>
  </g>`;

export const mirror = (id: string): Obj => ({ x, y, s = 1 }) =>
  `<g ${t(x, y, s)}>
   <rect x="-6" y="-120" width="12" height="120" fill="url(#${id}-gold)"/>
   <ellipse cx="0" cy="0" rx="70" ry="12" fill="url(#${id}-gold)"/>
   <circle cx="0" cy="-230" r="118" fill="url(#${id}-gold)"/>
   <circle cx="0" cy="-230" r="104" fill="#EFE7DA"/>
   <path d="M-60 -290 L20 -180" stroke="#fff" stroke-width="14" opacity="0.4" stroke-linecap="round"/>
  </g>`;
