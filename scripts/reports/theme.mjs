/**
 * Shared print theme for the Ani Bakes audit reports.
 *
 * The site's own faces are inlined as base64 so the PDFs render in the brand
 * typography with no network access. Blogh keeps the same unicode-range it has
 * in src/styles.css — it only contains Latin letters and space, so digits and
 * punctuation must fall through to the body face rather than render as tofu.
 */
import fs from "node:fs";
import path from "node:path";

const FONT_DIR = path.join(process.cwd(), "public/fonts");

const b64 = (file) => fs.readFileSync(path.join(FONT_DIR, file)).toString("base64");

export const PALETTE = {
  cream: "#FFF5E4",
  card: "#FFFDF9",
  cocoa: "#2C1810",
  ink: "#432A20",
  body: "#5B4139",
  muted: "#8A6C61",
  berry: "#FF9494",
  berryDeep: "#C13B42",
  blush: "#FFE3E1",
  rose: "#FFD1D1",
  gold: "#D9A441",
  matcha: "#3F7D57",
  border: "#E7D3C4",
};

export function baseCss() {
  return `
@font-face {
  font-family: "Blogh";
  src: url("data:font/opentype;base64,${b64("Blogh.otf")}") format("opentype");
  font-weight: 400 800;
  /* Matches src/styles.css: letters and space only. */
  unicode-range: U+0041-005A, U+0061-007A, U+0020;
}
@font-face {
  font-family: "TAN NIMBUS";
  src: url("data:font/opentype;base64,${b64("TAN-NIMBUS.otf")}") format("opentype");
  font-weight: 400 900;
}
@font-face {
  font-family: "Recurso Sans";
  src: url("data:font/truetype;base64,${b64("RecursoSans-Regular.ttf")}") format("truetype");
  font-weight: 400;
}
@font-face {
  font-family: "Recurso Sans";
  src: url("data:font/truetype;base64,${b64("RecursoSans-Medium.ttf")}") format("truetype");
  font-weight: 500;
}
@font-face {
  font-family: "Recurso Sans";
  src: url("data:font/truetype;base64,${b64("RecursoSans-Bold.ttf")}") format("truetype");
  font-weight: 700;
}
@font-face {
  font-family: "Recurso Sans";
  src: url("data:font/truetype;base64,${b64("RecursoSans-Black.ttf")}") format("truetype");
  font-weight: 900;
}

:root {
  --cream: ${PALETTE.cream};
  --card: ${PALETTE.card};
  --cocoa: ${PALETTE.cocoa};
  --ink: ${PALETTE.ink};
  --body: ${PALETTE.body};
  --muted: ${PALETTE.muted};
  --berry: ${PALETTE.berry};
  --berry-deep: ${PALETTE.berryDeep};
  --blush: ${PALETTE.blush};
  --rose: ${PALETTE.rose};
  --gold: ${PALETTE.gold};
  --matcha: ${PALETTE.matcha};
  --border: ${PALETTE.border};
}

@page { size: A4; margin: 0; }

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: "Recurso Sans", "Inter", ui-sans-serif, system-ui, sans-serif;
  color: var(--body);
  background: var(--cream);
  font-size: 9.4pt;
  line-height: 1.55;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.page {
  position: relative;
  width: 210mm;
  min-height: 297mm;
  padding: 16mm 15mm 18mm;
  background: var(--cream);
  page-break-after: always;
  overflow: hidden;
}
.page:last-child { page-break-after: auto; }

.font-blogh { font-family: "Blogh", "Recurso Sans", sans-serif; text-transform: uppercase; letter-spacing: 0.01em; }
.font-nimbus { font-family: "TAN NIMBUS", "Recurso Sans", Georgia, serif; }

h1, h2, h3, h4 { color: var(--cocoa); line-height: 1.15; }

.eyebrow {
  font-size: 7pt;
  font-weight: 900;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--berry-deep);
}

h2.section {
  font-family: "Blogh", "Recurso Sans", sans-serif;
  text-transform: uppercase;
  font-size: 16pt;
  margin: 2mm 0 3mm;
}

h3.sub {
  font-family: "TAN NIMBUS", Georgia, serif;
  font-size: 12pt;
  margin: 0 0 1.5mm;
}

p { margin-bottom: 2.2mm; }
strong { color: var(--ink); font-weight: 700; }

.lede { font-size: 10.2pt; line-height: 1.6; color: var(--ink); }

.rule { height: 1.5px; background: var(--border); margin: 4mm 0; border: 0; }

/* ---------------------------------------------------------------- surfaces */
.card {
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: 5mm;
  padding: 5mm;
  margin-bottom: 3.5mm;
}
.card.tint { background: linear-gradient(135deg, #FFF9F2, #FFF1E4); }
.card.warn { border-color: #E9B9A6; background: #FFF6F0; }
.card.good { border-color: #B9DBC6; background: #F3FBF5; }
.card.bad  { border-color: #E8AEB2; background: #FFF2F3; }

.grid { display: flex; flex-wrap: wrap; gap: 3mm; }
.grid > * { flex: 1 1 0; min-width: 0; }

/* ------------------------------------------------------------------ chips */
.chip {
  display: inline-block;
  border-radius: 999px;
  padding: 0.6mm 2.4mm;
  font-size: 6.8pt;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid var(--border);
  background: var(--blush);
  color: var(--cocoa);
  white-space: nowrap;
}
.chip.critical { background: #7E1122; color: #fff; border-color: #7E1122; }
.chip.high     { background: var(--berry-deep); color: #fff; border-color: var(--berry-deep); }
.chip.medium   { background: #E4A32C; color: #3B2704; border-color: #C98A18; }
.chip.low      { background: #E7EDE8; color: #35513F; border-color: #BFD3C6; }
.chip.fixed    { background: var(--matcha); color: #fff; border-color: var(--matcha); }
.chip.open     { background: #FFF; color: var(--berry-deep); border-color: var(--berry-deep); }

/* ------------------------------------------------------------------ score */
.score-row { display: flex; align-items: center; gap: 2.5mm; margin-bottom: 1.8mm; }
.score-row .label { flex: 0 0 42mm; font-size: 8.4pt; font-weight: 700; color: var(--ink); }
.score-row .bar { flex: 1; height: 3.4mm; border-radius: 999px; background: #F0E0D2; overflow: hidden; }
.score-row .bar span { display: block; height: 100%; border-radius: 999px; }
.score-row .num { flex: 0 0 14mm; text-align: right; font-size: 8.4pt; font-weight: 900; color: var(--cocoa); font-variant-numeric: tabular-nums; }

.bigscore {
  font-family: "TAN NIMBUS", Georgia, serif;
  font-size: 34pt;
  /* TAN NIMBUS sits high in its em box, so a line-height of 1 lets the glyphs
     ride up into the eyebrow above. */
  line-height: 1.18;
  margin-top: 1.5mm;
  color: var(--cocoa);
}
.bigscore small { font-size: 12pt; color: var(--muted); }

/* ----------------------------------------------------------------- tables */
table { width: 100%; border-collapse: collapse; font-size: 8.1pt; }
th {
  text-align: left;
  font-size: 6.9pt;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 900;
  padding: 2mm 2mm;
  border-bottom: 1.5px solid var(--border);
}
td { padding: 2mm; border-bottom: 1px solid #F0E2D6; vertical-align: top; color: var(--body); }
td.mono, .mono { font-family: "SFMono-Regular", Consolas, monospace; font-size: 7.4pt; color: var(--ink); }
tr:last-child td { border-bottom: 0; }

ul { margin: 0 0 2mm 4mm; }
li { margin-bottom: 1.4mm; }
li::marker { color: var(--berry-deep); }

.kv { display: flex; gap: 2mm; font-size: 8.2pt; margin-bottom: 1.2mm; }
.kv .k { flex: 0 0 32mm; color: var(--muted); font-weight: 700; }
.kv .v { flex: 1; color: var(--ink); }

/* ----------------------------------------------------------- page chrome */
.doc-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1.5px solid var(--border);
  padding-bottom: 2.5mm;
  margin-bottom: 5mm;
}
.doc-header .brand { font-family: "TAN NIMBUS", Georgia, serif; font-size: 11pt; color: var(--cocoa); }
.doc-header .meta { font-size: 7pt; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); font-weight: 700; }

.doc-footer {
  position: absolute;
  left: 15mm; right: 15mm; bottom: 8mm;
  display: flex;
  justify-content: space-between;
  font-size: 6.8pt;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  border-top: 1px solid var(--border);
  padding-top: 2mm;
}
`;
}

/** A horizontal score bar. `value` is out of 100. */
export function scoreBar(label, value) {
  const colour =
    value >= 85 ? PALETTE.matcha : value >= 70 ? PALETTE.gold : value >= 50 ? "#E07A3F" : PALETTE.berryDeep;
  return `<div class="score-row">
    <div class="label">${label}</div>
    <div class="bar"><span style="width:${value}%;background:${colour}"></span></div>
    <div class="num">${value}</div>
  </div>`;
}

export function page(inner, { footer = "", pageNo = "", total = "" } = {}) {
  return `<div class="page">
    <div class="doc-header">
      <div class="brand">Ani&nbsp;Bakes</div>
      <div class="meta">${footer}</div>
    </div>
    ${inner}
    <div class="doc-footer">
      <span>anibakes.app &middot; internal audit</span>
      <span>${pageNo}${total ? ` / ${total}` : ""}</span>
    </div>
  </div>`;
}
