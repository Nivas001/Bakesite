/**
 * Builds the two Ani Bakes audit reports as themed HTML and prints them to PDF.
 *
 *   node scripts/reports/generate.mjs
 *
 * Output lands in documents/. Rendering goes through headless Edge or Chrome,
 * which is already required elsewhere in this repo's tooling.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { baseCss, page, scoreBar, PALETTE } from "./theme.mjs";
import { AXES, PAGES, CROSS_CUTTING, ROADMAP } from "./uiux-content.mjs";
import { ARCHITECTURE, COLLECTIONS, ENDPOINTS, FINDINGS, POSTURE, HARDENING } from "./db-content.mjs";

const OUT_DIR = path.join(process.cwd(), "documents");
fs.mkdirSync(OUT_DIR, { recursive: true });

const DATE = new Date().toLocaleDateString("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const avg = (nums) => Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);

// ---------------------------------------------------------------- shared bits

function cover({ kicker, title, subtitle, scoreLabel, score, bullets }) {
  return `<div class="page" style="display:flex;flex-direction:column;justify-content:space-between;padding:24mm 18mm">
    <div>
      <div style="font-family:'TAN NIMBUS',Georgia,serif;font-size:15pt;color:${PALETTE.cocoa}">Ani&nbsp;Bakes</div>
      <div style="font-size:7pt;letter-spacing:.24em;text-transform:uppercase;color:${PALETTE.muted};font-weight:700;margin-top:1mm">
        anibakes.app &middot; Pondicherry
      </div>
    </div>

    <div>
      <div class="eyebrow" style="margin-bottom:3mm">${esc(kicker)}</div>
      <h1 class="font-blogh" style="font-size:36pt;line-height:1.02;margin-bottom:5mm">${esc(title)}</h1>
      <p class="lede" style="max-width:125mm;font-size:11pt">${subtitle}</p>

      <div style="display:flex;align-items:flex-end;gap:10mm;margin-top:12mm">
        <div>
          <div class="eyebrow">${esc(scoreLabel)}</div>
          <div class="bigscore">${score}<small>/100</small></div>
        </div>
        <div style="flex:1;border-left:1.5px solid ${PALETTE.border};padding-left:8mm">
          ${bullets.map((b) => `<div class="kv"><div class="k">${esc(b[0])}</div><div class="v">${b[1]}</div></div>`).join("")}
        </div>
      </div>
    </div>

    <div style="border-top:1.5px solid ${PALETTE.border};padding-top:3mm;display:flex;justify-content:space-between;font-size:7pt;letter-spacing:.14em;text-transform:uppercase;color:${PALETTE.muted};font-weight:700">
      <span>Prepared ${DATE}</span>
      <span>Internal &middot; not for distribution</span>
    </div>
  </div>`;
}

function html(title, body) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>${baseCss()}</style></head><body>${body}</body></html>`;
}

/** Edge detaches before the file lands, so wait for it to settle. */
function waitForFile(file, timeoutMs = 90_000) {
  const started = Date.now();
  let lastSize = -1;
  while (Date.now() - started < timeoutMs) {
    if (fs.existsSync(file)) {
      const size = fs.statSync(file).size;
      if (size > 0 && size === lastSize) return true;
      lastSize = size;
    }
    try {
      execFileSync(process.platform === "win32" ? "cmd" : "sleep", process.platform === "win32" ? ["/c", "timeout", "/t", "1", "/nobreak"] : ["1"], { stdio: "ignore" });
    } catch {
      /* timeout returns non-zero when not attached to a console */
    }
  }
  return fs.existsSync(file) && fs.statSync(file).size > 0;
}

function renderPdf(htmlPath, pdfPath) {
  const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const browser = fs.existsSync(edge) ? edge : chrome;
  const profile = fs.mkdtempSync(path.join(process.env["TEMP"] ?? "/tmp", "pdf-"));

  execFileSync(
    browser,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      `--user-data-dir=${profile}`,
      "--no-pdf-header-footer",
      "--run-all-compositor-stages-before-draw",
      "--virtual-time-budget=12000",
      `--print-to-pdf=${pdfPath}`,
      `file:///${htmlPath.replace(/\\/g, "/")}`,
    ],
    { stdio: "ignore" },
  );

  try {
    fs.rmSync(profile, { recursive: true, force: true });
  } catch {
    /* Windows may still hold the profile; it is disposable */
  }
}

// ------------------------------------------------------------- UI/UX report

function uiuxDoc() {
  const overall = avg(PAGES.flatMap((p) => p.scores));
  const openCount = PAGES.reduce((n, p) => n + p.open.length, 0);
  const fixedCount =
    PAGES.reduce((n, p) => n + p.fixed.length, 0) +
    CROSS_CUTTING.filter((c) => c.status === "fixed").length;

  const pages = [];

  pages.push(
    cover({
      kicker: "User experience audit",
      title: "Design review",
      subtitle:
        "A page-by-page assessment of anibakes.app, covering visual design, hierarchy, responsive behaviour, accessibility, interaction and performance — with what was repaired in this pass and what remains.",
      scoreLabel: "Composite experience score",
      score: overall,
      bullets: [
        ["Pages reviewed", `${PAGES.length}`],
        ["Issues resolved", `${fixedCount}`],
        ["Issues outstanding", `${openCount}`],
        ["Breakpoints tested", "390px and 1440px"],
      ],
    }),
  );

  // Executive summary
  const axisAverages = AXES.map((_, i) => avg(PAGES.map((p) => p.scores[i])));
  pages.push(
    page(
      `<div class="eyebrow">Summary</div>
       <h2 class="section">Where the site stands</h2>
       <p class="lede">Ani Bakes has a stronger visual identity than most bakery sites: a real typographic system, a
       distinctive display face and a hero idea that genuinely belongs to this brand. The weaknesses were not taste —
       they were craft. Contrast was failing across the board, the static payload was three times larger than it needed
       to be, and the section customers were most likely to play with did not respond to its own controls.</p>

       <div class="card tint">
         <h3 class="sub">Scores by dimension</h3>
         ${AXES.map((a, i) => scoreBar(a, axisAverages[i])).join("")}
       </div>

       <div class="grid">
         <div class="card good">
           <div class="eyebrow" style="color:${PALETTE.matcha}">Strongest</div>
           <h3 class="sub">Interaction &amp; motion</h3>
           <p>One shared motion system now drives every reveal, and the About page opens with a pinned sequence that
           builds the bakery's signature cake across five chapters as you scroll.</p>
         </div>
         <div class="card bad">
           <div class="eyebrow" style="color:${PALETTE.berryDeep}">Weakest</div>
           <h3 class="sub">Accessibility</h3>
           <p>Contrast is fixed, but the type scale still bottoms out at 9px, focus states are browser defaults, and the
           arcade games cannot be played from a keyboard.</p>
         </div>
       </div>

       <h3 class="sub" style="margin-top:4mm">How to read the scores</h3>
       <table>
         <tr><td style="width:22mm"><span class="chip fixed">85&ndash;100</span></td><td>Competitive with the best in the category. Ship as is.</td></tr>
         <tr><td><span class="chip medium">70&ndash;84</span></td><td>Good. Specific, named defects hold it back.</td></tr>
         <tr><td><span class="chip high">50&ndash;69</span></td><td>Functional but visibly unfinished to a customer.</td></tr>
         <tr><td><span class="chip critical">&lt; 50</span></td><td>Actively costing conversions or excluding users.</td></tr>
       </table>`,
      { footer: "UI/UX audit &middot; summary", pageNo: 2 },
    ),
  );

  // Page sections, two per printed page
  for (let i = 0; i < PAGES.length; i += 2) {
    const chunk = PAGES.slice(i, i + 2);
    pages.push(
      page(
        chunk
          .map(
            (p) => `
        <div style="margin-bottom:6mm">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2mm">
            <h2 class="section" style="margin:0">${esc(p.name)}</h2>
            <span class="mono" style="color:${PALETTE.muted}">${esc(p.route)}</span>
          </div>
          <p style="margin-bottom:3mm">${esc(p.verdict)}</p>

          <div class="grid" style="align-items:flex-start">
            <div style="flex:0 0 84mm">
              ${p.scores.map((s, k) => scoreBar(AXES[k], s)).join("")}
            </div>
            <div class="card" style="margin:0">
              <div class="eyebrow" style="margin-bottom:1.5mm">Working well</div>
              <ul>${p.strengths.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
              ${
                p.fixed.length
                  ? `<div class="eyebrow" style="color:${PALETTE.matcha};margin:2.5mm 0 1.5mm">Fixed this pass</div>
                     <ul>${p.fixed.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`
                  : ""
              }
            </div>
          </div>

          ${
            p.open.length
              ? `<table style="margin-top:3mm">
                  <tr><th style="width:46mm">Outstanding</th><th>What is wrong, and how to fix it</th><th style="width:12mm">Effort</th></tr>
                  ${p.open
                    .map(
                      (o) => `<tr>
                        <td><strong>${esc(o.title)}</strong></td>
                        <td>${esc(o.detail)}<br><span style="color:${PALETTE.matcha}"><strong>Fix &middot;</strong> ${esc(o.fix)}</span></td>
                        <td><span class="chip">${esc(o.effort)}</span></td>
                      </tr>`,
                    )
                    .join("")}
                </table>`
              : ""
          }
        </div>`,
          )
          .join('<hr class="rule">'),
        { footer: "UI/UX audit &middot; page reviews", pageNo: 3 + i / 2 },
      ),
    );
  }

  // Cross-cutting
  pages.push(
    page(
      `<div class="eyebrow">System-wide</div>
       <h2 class="section">Issues that were not page-specific</h2>
       ${CROSS_CUTTING.map(
         (c) => `<div class="card ${c.status === "fixed" ? "good" : "warn"}">
           <div style="display:flex;justify-content:space-between;align-items:baseline;gap:3mm;margin-bottom:1.5mm">
             <h3 class="sub" style="margin:0">${esc(c.title)}</h3>
             <span class="chip ${c.status === "fixed" ? "fixed" : "open"}">${c.status}</span>
           </div>
           <p style="margin:0">${esc(c.body)}</p>
         </div>`,
       ).join("")}`,
      { footer: "UI/UX audit &middot; system-wide", pageNo: 3 + Math.ceil(PAGES.length / 2) },
    ),
  );

  // Roadmap
  pages.push(
    page(
      `<div class="eyebrow">What to do next</div>
       <h2 class="section">Prioritised roadmap</h2>
       <p class="lede">Ordered by return on effort. The first group is the shortest path to a measurably better
       experience and can be done without design decisions.</p>

       <div class="card bad">
         <span class="chip high">Now &middot; this sprint</span>
         <ul style="margin-top:2.5mm">${ROADMAP.now.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
       </div>
       <div class="card warn">
         <span class="chip medium">Next &middot; this quarter</span>
         <ul style="margin-top:2.5mm">${ROADMAP.next.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
       </div>
       <div class="card">
         <span class="chip low">Later &middot; structural</span>
         <ul style="margin-top:2.5mm">${ROADMAP.later.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
       </div>

       <hr class="rule">
       <h3 class="sub">Closing note</h3>
       <p>The identity here is genuinely good, and that is the hard part to buy. What separates this site from the best
       in its category is not more ideas — it is finishing the ones already present: a type scale with a floor, a focus
       state someone chose, a checkout that explains itself, and a catalogue that never shows placeholder copy. None of
       the outstanding work is large.</p>`,
      { footer: "UI/UX audit &middot; roadmap", pageNo: 4 + Math.ceil(PAGES.length / 2) },
    ),
  );

  return html("Ani Bakes — UI/UX Audit", pages.join(""));
}

// ------------------------------------------------------- Security/DB report

function dbDoc() {
  const overall = avg(POSTURE.map((p) => p[1]));
  const bySeverity = (s) => FINDINGS.filter((f) => f.severity === s).length;
  const fixed = FINDINGS.filter((f) => f.status === "fixed").length;

  const pages = [];

  pages.push(
    cover({
      kicker: "Data, authentication & security",
      title: "Backend review",
      subtitle:
        "How the Appwrite database, authentication, storage and payment flow are wired, where the weaknesses are, and what has already been closed.",
      scoreLabel: "Security posture",
      score: overall,
      bullets: [
        ["Findings", `${FINDINGS.length} (${bySeverity("critical")} critical, ${bySeverity("high")} high)`],
        ["Resolved this pass", `${fixed}`],
        ["Collections", `${COLLECTIONS.length}`],
        ["Server functions", "37 across 8 modules"],
      ],
    }),
  );

  pages.push(
    page(
      `<div class="eyebrow">Architecture</div>
       <h2 class="section">How the data layer is wired</h2>
       <p class="lede">The core design is sound, and it is the thing most projects at this size get wrong: the browser
       never touches the database. Appwrite collections carry no public permissions, and every read and write goes
       through a server function that verifies the caller's session JWT before using a server-only API key.</p>

       <div class="card tint">
         ${ARCHITECTURE.map(([k, v]) => `<div class="kv"><div class="k">${esc(k)}</div><div class="v">${esc(v)}</div></div>`).join("")}
       </div>

       <h3 class="sub" style="margin-top:4mm">Collections</h3>
       <table>
         <tr><th>Collection</th><th>Holds</th><th style="width:30mm">Access</th><th>Notes</th></tr>
         ${COLLECTIONS.map(
           ([n, h, a, note]) =>
             `<tr><td class="mono">${esc(n)}</td><td>${esc(h)}</td><td>${esc(a)}</td><td>${esc(note)}</td></tr>`,
         ).join("")}
       </table>`,
      { footer: "Backend review &middot; architecture", pageNo: 2 },
    ),
  );

  pages.push(
    page(
      `<div class="eyebrow">Access control</div>
       <h2 class="section">Endpoint exposure matrix</h2>
       <p>Admin protection is applied consistently: all eleven admin endpoints call requireAppwriteAuth and then
       assertAdmin against the user_roles collection. Reviews are gated on a completed order that actually contained
       the product, and order mutations re-check ownership rather than trusting the client.</p>
       <table style="margin-top:3mm">
         <tr><th style="width:72mm">Endpoint</th><th style="width:34mm">Requires</th><th>Assessment</th></tr>
         ${ENDPOINTS.map(
           ([e, r, a]) =>
             `<tr><td class="mono">${esc(e)}</td><td>${esc(r)}</td><td>${esc(a)}</td></tr>`,
         ).join("")}
       </table>

       <div class="card good" style="margin-top:4mm">
         <h3 class="sub">Already correct before this review</h3>
         <ul style="margin-bottom:0">
           <li>CSRF middleware is explicitly re-registered in src/start.ts, which TanStack Start would otherwise drop once that file exists.</li>
           <li>Zod validators run on every mutating endpoint.</li>
           <li>The webhook uses timingSafeEqual with a length check rather than string comparison.</li>
           <li>.env is untracked, and no server secret is reachable from client code.</li>
           <li>The Appwrite API key is confined to a server-only module that client code never imports.</li>
         </ul>
       </div>`,
      { footer: "Backend review &middot; access control", pageNo: 3 },
    ),
  );

  // Findings, three per page
  for (let i = 0; i < FINDINGS.length; i += 3) {
    const chunk = FINDINGS.slice(i, i + 3);
    pages.push(
      page(
        `${i === 0 ? '<div class="eyebrow">Findings</div><h2 class="section">Detailed findings</h2>' : '<div class="eyebrow">Findings continued</div>'}
         ${chunk
           .map(
             (f) => `<div class="card ${f.status === "fixed" ? "good" : "warn"}">
               <div style="display:flex;justify-content:space-between;align-items:baseline;gap:3mm;margin-bottom:1.5mm">
                 <h3 class="sub" style="margin:0">${esc(f.id)} &middot; ${esc(f.title)}</h3>
                 <span style="white-space:nowrap">
                   <span class="chip ${f.severity}">${f.severity}</span>
                   <span class="chip ${f.status === "fixed" ? "fixed" : "open"}">${f.status}</span>
                 </span>
               </div>
               <div class="mono" style="color:${PALETTE.muted};margin-bottom:1.5mm">${esc(f.where)}</div>
               <p style="margin-bottom:2mm">${esc(f.what)}</p>
               <p style="margin:0;color:${PALETTE.matcha}"><strong>${f.status === "fixed" ? "Resolved &middot;" : "Recommended &middot;"}</strong> ${esc(f.action)}</p>
             </div>`,
           )
           .join("")}`,
        { footer: "Backend review &middot; findings", pageNo: 4 + i / 3 },
      ),
    );
  }

  const findingsPages = Math.ceil(FINDINGS.length / 3);

  pages.push(
    page(
      `<div class="eyebrow">Posture</div>
       <h2 class="section">Where the risk sits now</h2>
       <div class="card tint">
         ${POSTURE.map(([label, score]) => scoreBar(label, score)).join("")}
       </div>
       <table style="margin-top:2mm">
         ${POSTURE.map(
           ([label, , note]) =>
             `<tr><td style="width:42mm"><strong>${esc(label)}</strong></td><td>${esc(note)}</td></tr>`,
         ).join("")}
       </table>

       <div class="card bad" style="margin-top:4mm">
         <h3 class="sub">The one number to watch</h3>
         <p style="margin:0">Abuse resistance scores 52 because there is no rate limiting anywhere in the application.
         Every other category is in good shape, so this is now the single largest gap: promo codes can be brute-forced
         and public endpoints can be flooded. On Cloudflare this is a small change — a token bucket in KV keyed on
         CF-Connecting-IP — and it would lift this category above 80 on its own.</p>
       </div>`,
      { footer: "Backend review &middot; posture", pageNo: 4 + findingsPages },
    ),
  );

  pages.push(
    page(
      `<div class="eyebrow">What to do next</div>
       <h2 class="section">Hardening roadmap</h2>
       <div class="card bad">
         <span class="chip high">Now</span>
         <ul style="margin-top:2.5mm">${HARDENING.now.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
       </div>
       <div class="card warn">
         <span class="chip medium">Next</span>
         <ul style="margin-top:2.5mm">${HARDENING.next.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
       </div>
       <div class="card">
         <span class="chip low">Later</span>
         <ul style="margin-top:2.5mm">${HARDENING.later.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
       </div>

       <hr class="rule">
       <h3 class="sub">Operational checklist</h3>
       <table>
         <tr><th style="width:52mm">Item</th><th>Status</th></tr>
         <tr><td>.env excluded from version control</td><td><span class="chip fixed">confirmed</span></td></tr>
         <tr><td>Server secrets absent from the client bundle</td><td><span class="chip fixed">confirmed</span></td></tr>
         <tr><td>CSRF protection on server functions</td><td><span class="chip fixed">confirmed</span></td></tr>
         <tr><td>Webhook secret configured (RAZORPAY_WEBHOOK_SECRET)</td><td><span class="chip open">verify in production</span></td></tr>
         <tr><td>CSP moved from report-only to enforced</td><td><span class="chip open">pending review</span></td></tr>
         <tr><td>Appwrite API key scoped to the collections in use</td><td><span class="chip open">to review</span></td></tr>
         <tr><td>Key rotation schedule agreed</td><td><span class="chip open">to agree</span></td></tr>
         <tr><td>Backup and restore rehearsed for the bakery database</td><td><span class="chip open">to rehearse</span></td></tr>
       </table>`,
      { footer: "Backend review &middot; roadmap", pageNo: 5 + findingsPages },
    ),
  );

  return html("Ani Bakes — Database & Security Review", pages.join(""));
}

// ------------------------------------------------------------------- build

const docs = [
  ["Ani_Bakes_UIUX_Design_Review", uiuxDoc()],
  ["Ani_Bakes_Database_Security_Review", dbDoc()],
];

for (const [name, markup] of docs) {
  const htmlPath = path.join(OUT_DIR, `${name}.html`);
  const pdfPath = path.join(OUT_DIR, `${name}.pdf`);
  fs.writeFileSync(htmlPath, markup, "utf8");
  if (fs.existsSync(pdfPath)) fs.rmSync(pdfPath);
  renderPdf(htmlPath, pdfPath);
  const ok = waitForFile(pdfPath);
  console.log(
    `${ok ? "OK  " : "FAIL"} ${name}.pdf${ok ? ` (${Math.round(fs.statSync(pdfPath).size / 1024)}KB)` : ""}`,
  );
}
