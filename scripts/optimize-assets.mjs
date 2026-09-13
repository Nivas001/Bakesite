/**
 * Re-encodes oversized images in public/ and rewrites the references in src/.
 *
 *   node scripts/optimize-assets.mjs --dry     # report only
 *   node scripts/optimize-assets.mjs           # apply
 *
 * Two strategies, picked per folder:
 *
 *  - WEBP folders are referenced only from source, so the file is converted to
 *    .webp and every reference in src/ is rewritten to the new extension.
 *  - INPLACE folders may also be referenced by image_url values stored in the
 *    database, so the file keeps its name and format and is merely re-encoded
 *    smaller. Existing URLs keep working.
 *
 * Requires ffmpeg on PATH.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const DRY = process.argv.includes("--dry");

/** Converted to .webp; references in src/ are rewritten. */
const WEBP_DIRS = ["illustration", "hero", "about", "cakes", "packaging"];
/** Re-encoded in place under the same filename (URLs may live in the database). */
const INPLACE_DIRS = ["products"];

const MIN_BYTES = 120 * 1024; // leave genuinely small files alone
const MAX_WIDTH = 1600;
const QUALITY = 80;

const IMAGE_RE = /\.(png|jpe?g)$/i;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function ffmpeg(args) {
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], {
    stdio: ["ignore", "ignore", "pipe"],
  });
}

const mb = (n) => `${(n / 1048576).toFixed(2)} MB`;
const rename = new Map(); // old web path -> new web path
let before = 0;
let after = 0;

for (const dir of [...WEBP_DIRS, ...INPLACE_DIRS]) {
  const toWebp = WEBP_DIRS.includes(dir);
  for (const file of walk(path.join("public", dir))) {
    if (!IMAGE_RE.test(file)) continue;
    const size = fs.statSync(file).size;
    if (size < MIN_BYTES) continue;

    const web = "/" + file.split(path.sep).join("/").slice("public/".length);
    const scale = `scale='min(${MAX_WIDTH},iw)':-2`;

    if (toWebp) {
      const out = file.replace(IMAGE_RE, ".webp");
      const outWeb = web.replace(IMAGE_RE, ".webp");
      before += size;
      if (DRY) {
        after += Math.round(size * 0.05); // rough estimate for the report
      } else {
        ffmpeg(["-i", file, "-vf", scale, "-c:v", "libwebp", "-lossless", "0",
                "-quality", String(QUALITY), "-compression_level", "6", out]);
        after += fs.statSync(out).size;
        fs.rmSync(file);
      }
      rename.set(web, outWeb);
    } else {
      const tmp = file + ".tmp.jpg";
      before += size;
      if (DRY) {
        after += Math.round(size * 0.35);
      } else {
        ffmpeg(["-i", file, "-vf", scale, "-q:v", "5", tmp]);
        const newSize = fs.statSync(tmp).size;
        // Never make a file bigger than it already was.
        if (newSize < size) {
          fs.renameSync(tmp, file);
          after += newSize;
        } else {
          fs.rmSync(tmp);
          after += size;
        }
      }
    }
  }
}

// Rewrite source references for the converted files.
let touched = 0;
if (!DRY && rename.size > 0) {
  for (const file of walk("src")) {
    if (!/\.(tsx?|jsx?|css)$/.test(file)) continue;
    const original = fs.readFileSync(file, "utf8");
    let next = original;
    for (const [from, to] of rename) next = next.split(from).join(to);
    if (next !== original) {
      fs.writeFileSync(file, next);
      touched += 1;
    }
  }
}

console.log(`${DRY ? "[dry run] " : ""}images re-encoded: ${rename.size + INPLACE_DIRS.length}`);
console.log(`  before: ${mb(before)}`);
console.log(`  after:  ${mb(after)}`);
console.log(`  saved:  ${mb(before - after)}`);
if (!DRY) console.log(`  source files updated: ${touched}`);
