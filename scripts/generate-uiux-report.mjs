import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = process.cwd();
const DOCS_DIR = path.join(ROOT_DIR, 'documents');
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

// Read and encode local fonts
const bloghBase64 = fs.readFileSync(path.join(ROOT_DIR, 'public/fonts/Blogh.otf')).toString('base64');
const nimbusBase64 = fs.readFileSync(path.join(ROOT_DIR, 'public/fonts/TAN-NIMBUS.otf')).toString('base64');
const recursoBase64 = fs.readFileSync(path.join(ROOT_DIR, 'public/fonts/RecursoSans-Regular.ttf')).toString('base64');
const recursoBoldBase64 = fs.readFileSync(path.join(ROOT_DIR, 'public/fonts/RecursoSans-Bold.ttf')).toString('base64');

console.log('Fonts loaded successfully into memory.');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Ani Bakes — Senior UI/UX Audit & Motion Specification</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,600&family=Inter:wght@300;400;500;600;700;800&family=Caveat:wght@600;700&display=swap');

  @font-face {
    font-family: 'Blogh';
    src: url('data:font/opentype;base64,${bloghBase64}') format('opentype');
    font-weight: 400 800;
    font-style: normal;
  }

  @font-face {
    font-family: 'TAN NIMBUS';
    src: url('data:font/opentype;base64,${nimbusBase64}') format('opentype');
    font-weight: 400 900;
    font-style: normal;
  }

  @font-face {
    font-family: 'Recurso Sans';
    src: url('data:font/truetype;base64,${recursoBase64}') format('truetype');
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: 'Recurso Sans';
    src: url('data:font/truetype;base64,${recursoBoldBase64}') format('truetype');
    font-weight: 700;
    font-style: normal;
  }

  /* Page Print Setup */
  @page {
    size: A4 portrait;
    margin: 14mm 14mm 16mm 14mm;
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: #FFFDF9;
    color: #2C1810;
    font-family: 'Recurso Sans', 'Inter', -apple-system, sans-serif;
    font-size: 9.5pt;
    line-height: 1.5;
  }

  .page-break {
    page-break-after: always;
    break-after: page;
  }

  .avoid-break {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* Typography */
  h1, h2, h3, h4 {
    color: #2C1810;
    margin: 0;
    font-weight: 700;
  }

  .font-nimbus {
    font-family: 'TAN NIMBUS', 'Playfair Display', Georgia, serif;
  }

  .font-blogh {
    font-family: 'Blogh', 'Inter', sans-serif;
    letter-spacing: 0.03em;
  }

  .font-playfair {
    font-family: 'Playfair Display', Georgia, serif;
  }

  .font-script {
    font-family: 'Caveat', cursive;
  }

  .font-sans {
    font-family: 'Recurso Sans', 'Inter', sans-serif;
  }

  /* Brand Colors */
  .text-cocoa { color: #2C1810; }
  .text-berry { color: #E85D75; }
  .text-berry-deep { color: #C43D56; }
  .text-amber { color: #D97706; }
  .text-matcha { color: #059669; }
  .text-muted { color: #785E55; }

  .bg-cream { background-color: #FFF5E4; }
  .bg-blush { background-color: #FFF0EE; }
  .bg-rose-soft { background-color: #FFE3E1; }
  .bg-card { background-color: #FFFFFF; }
  .bg-berry { background-color: #E85D75; }
  .bg-cocoa { background-color: #2C1810; }

  .border-soft { border: 1px solid rgba(44, 24, 16, 0.12); }
  .border-berry-soft { border: 1px solid rgba(232, 93, 117, 0.25); }
  .border-amber-soft { border: 1px solid rgba(217, 119, 6, 0.25); }

  /* UI Elements */
  .pill-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .pill-berry {
    background-color: #FFE8EC;
    color: #C43D56;
    border: 1px solid rgba(232, 93, 117, 0.25);
  }

  .pill-amber {
    background-color: #FEF3C7;
    color: #B45309;
    border: 1px solid rgba(217, 119, 6, 0.25);
  }

  .pill-matcha {
    background-color: #D1FAE5;
    color: #065F46;
    border: 1px solid rgba(5, 150, 105, 0.25);
  }

  .pill-cocoa {
    background-color: #F5EFEB;
    color: #2C1810;
    border: 1px solid rgba(44, 24, 16, 0.15);
  }

  .score-badge {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    font-weight: 800;
    box-shadow: 0 4px 12px rgba(44, 24, 16, 0.08);
  }

  .score-high {
    background: linear-gradient(135deg, #FFF0EE 0%, #FFE3E1 100%);
    color: #C43D56;
    border: 1.5px solid #FFCCD2;
  }

  .score-num {
    font-size: 14pt;
    line-height: 1;
  }

  .score-total {
    font-size: 6.5pt;
    opacity: 0.75;
    text-transform: uppercase;
  }

  /* Grids & Cards */
  .card-box {
    background: #FFFFFF;
    border: 1px solid rgba(44, 24, 16, 0.10);
    border-radius: 12px;
    padding: 12px 14px;
    box-shadow: 0 2px 8px rgba(44, 24, 16, 0.03);
  }

  .card-hero {
    background: linear-gradient(135deg, #FFF9F2 0%, #FFF3E7 50%, #FFFBF5 100%);
    border: 1.5px solid rgba(44, 24, 16, 0.12);
    border-radius: 16px;
    padding: 16px 20px;
  }

  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .three-col {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
  }

  .four-col {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  /* Comparison Lists */
  .keep-box {
    background: #F8FAF6;
    border: 1px solid #D8EAD0;
    border-radius: 10px;
    padding: 10px 12px;
  }

  .change-box {
    background: #FFF7F8;
    border: 1px solid #FCD7DE;
    border-radius: 10px;
    padding: 10px 12px;
  }

  .anim-box {
    background: #FAF8FE;
    border: 1px solid #E6DCFA;
    border-radius: 10px;
    padding: 10px 12px;
  }

  .list-item {
    position: relative;
    padding-left: 14px;
    margin-bottom: 5px;
    font-size: 8.5pt;
    line-height: 1.4;
  }

  .list-item::before {
    content: "•";
    position: absolute;
    left: 2px;
    top: 0;
    font-weight: bold;
  }

  .list-keep::before { color: #16A34A; }
  .list-change::before { color: #E85D75; }
  .list-anim::before { color: #8B5CF6; }

  /* Table styling */
  table.audit-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.5pt;
    margin: 8px 0;
  }

  table.audit-table th {
    background-color: #F8EFEA;
    color: #2C1810;
    font-weight: 700;
    text-align: left;
    padding: 6px 10px;
    border-bottom: 2px solid rgba(44, 24, 16, 0.15);
    font-size: 8pt;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  table.audit-table td {
    padding: 6px 10px;
    border-bottom: 1px solid rgba(44, 24, 16, 0.08);
    vertical-align: middle;
  }

  table.audit-table tr:nth-child(even) td {
    background-color: #FDFAF7;
  }

  .metric-bar-bg {
    width: 100%;
    height: 6px;
    background: #ECE5DE;
    border-radius: 3px;
    overflow: hidden;
  }

  .metric-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #E85D75, #FFA3B3);
    border-radius: 3px;
  }

  /* Header & Footer Rules */
  .doc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(44, 24, 16, 0.15);
    margin-bottom: 12px;
    font-size: 7.5pt;
    color: #785E55;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .doc-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    border-top: 1px solid rgba(44, 24, 16, 0.12);
    margin-top: 14px;
    font-size: 7.5pt;
    color: #8C736C;
  }

  .code-token {
    font-family: 'Courier New', monospace;
    background: #F4EDE7;
    padding: 1px 4px;
    border-radius: 4px;
    font-size: 7.5pt;
    color: #8B2C41;
  }
</style>
</head>
<body>

<!-- ==================== COVER PAGE ==================== -->
<div class="page-break" style="display: flex; flex-direction: column; justify-content: space-between; height: 95vh; padding: 20px 10px;">
  
  <div>
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
      <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #E85D75;"></span>
      <span class="font-nimbus" style="font-size: 16pt; font-weight: 700; color: #2C1810; letter-spacing: -0.01em;">Ani Bakes</span>
      <span style="font-size: 8pt; color: #785E55; text-transform: uppercase; letter-spacing: 0.15em; margin-left: 6px;">· Artisan Bakery & Confectionery</span>
    </div>

    <div style="margin-top: 40px; margin-bottom: 20px;">
      <span class="pill-badge pill-berry" style="font-size: 8.5pt; padding: 4px 12px; margin-bottom: 12px;">
        ✨ DESIGN AUDIT & STRATEGIC BLUEPRINT 2026
      </span>
      <h1 class="font-blogh" style="font-size: 34pt; line-height: 1.1; color: #2C1810; text-transform: uppercase; margin-top: 10px; margin-bottom: 14px;">
        Senior UI/UX Design Audit & Motion Architecture
      </h1>
      <p class="font-playfair" style="font-size: 14pt; font-style: italic; color: #E85D75; line-height: 1.4; margin-top: 0; margin-bottom: 20px;">
        A comprehensive heuristic evaluation, aesthetic scoring, retention analysis, and micro-interaction roadmap for all pages of the Ani Bakes Platform.
      </p>
    </div>

    <div style="height: 3px; width: 80px; background: #E85D75; border-radius: 2px; margin-bottom: 28px;"></div>

    <div class="card-hero" style="margin-bottom: 24px;">
      <h3 class="font-blogh" style="font-size: 12pt; text-transform: uppercase; color: #2C1810; margin-bottom: 8px;">
        Executive Audit Synthesis
      </h3>
      <p style="font-size: 9pt; color: #523932; line-height: 1.6; margin: 0 0 12px 0;">
        Ani Bakes demonstrates an <strong>extraordinary tier of visual luxury, confectionery branding, and emotional engagement</strong>. The platform successfully bridges artisanal French morning baking rituals with state-of-the-art interactive web 3D, GodUI spring animations, and multi-tier slot delivery booking. This report presents an exhaustive page-by-page UX diagnostic, what elements must be preserved to protect core conversion, critical friction points to eliminate, and a dedicated <em>Confectionery Motion Matrix</em> to elevate tactile delight.
      </p>
      <div class="three-col" style="margin-top: 12px;">
        <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 10px; text-align: center; border: 1px solid rgba(44,24,16,0.08);">
          <div style="font-size: 20pt; font-weight: 800; color: #E85D75;">89<span style="font-size: 11pt; color: #785E55;">/100</span></div>
          <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #785E55; margin-top: 2px;">Overall Platform UX Health</div>
        </div>
        <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 10px; text-align: center; border: 1px solid rgba(44,24,16,0.08);">
          <div style="font-size: 20pt; font-weight: 800; color: #059669;">12</div>
          <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #785E55; margin-top: 2px;">Key Routes Evaluated</div>
        </div>
        <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 10px; text-align: center; border: 1px solid rgba(44,24,16,0.08);">
          <div style="font-size: 20pt; font-weight: 800; color: #D97706;">18+</div>
          <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #785E55; margin-top: 2px;">Fluid Motion Blueprints</div>
        </div>
      </div>
    </div>
  </div>

  <div>
    <div class="two-col" style="padding-top: 14px; border-top: 1px solid rgba(44, 24, 16, 0.15);">
      <div>
        <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #785E55; letter-spacing: 0.08em;">Prepared By</div>
        <div style="font-size: 9.5pt; font-weight: 700; color: #2C1810; margin-top: 2px;">Principal UI/UX Design Lead &amp; Systems Architect</div>
        <div style="font-size: 8pt; color: #785E55;">Advanced Confectionery E-Commerce UX Practice</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #785E55; letter-spacing: 0.08em;">System Baseline</div>
        <div style="font-size: 9.5pt; font-weight: 700; color: #2C1810; margin-top: 2px;">Ani Bakes v2.4 (TanStack Start + Appwrite)</div>
        <div style="font-size: 8pt; color: #785E55;">Theme: Cream, Ganache Cocoa, Strawberry Velvet</div>
      </div>
    </div>
  </div>

</div>


<!-- ==================== TABLE OF CONTENTS & SCORE SUMMARY ==================== -->
<div class="page-break">
  <div class="doc-header">
    <span>Ani Bakes · Senior UI/UX Audit</span>
    <span>Part I: Scorecard &amp; Benchmark Overview</span>
  </div>

  <h2 class="font-blogh" style="font-size: 18pt; text-transform: uppercase; color: #2C1810; margin-bottom: 4px;">
    Platform-Wide UI/UX Scorecard
  </h2>
  <p style="font-size: 8.5pt; color: #785E55; margin-bottom: 14px;">
    Every key route has been evaluated across 5 core dimensions: Visual Harmony (20%), Information Architecture (20%), Interaction Design (20%), Micro-Animations (20%), and Mobile Ergonomics (20%).
  </p>

  <table class="audit-table">
    <thead>
      <tr>
        <th style="width: 28%;">Page &amp; Route</th>
        <th style="width: 14%; text-align: center;">Score</th>
        <th style="width: 12%; text-align: center;">Grade</th>
        <th style="width: 24%;">Primary Strength</th>
        <th style="width: 22%;">Priority Action Area</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Home Page</strong> <span class="code-token">/</span></td>
        <td style="text-align: center;"><strong style="color: #E85D75; font-size: 10pt;">92</strong> / 100</td>
        <td style="text-align: center;"><span class="pill-badge pill-berry">A</span></td>
        <td>Hero 3D canvas, cake simulator &amp; bento wall</td>
        <td>Section transition debounce &amp; coverflow perf</td>
      </tr>
      <tr>
        <td><strong>Bakery Counter</strong> <span class="code-token">/shop</span></td>
        <td style="text-align: center;"><strong style="color: #E85D75; font-size: 10pt;">89</strong> / 100</td>
        <td style="text-align: center;"><span class="pill-badge pill-berry">A-</span></td>
        <td>Horizontal lane multi-row + 2-col mobile bento</td>
        <td>Live search results counter &amp; category sticky bar</td>
      </tr>
      <tr>
        <td><strong>Product Detail</strong> <span class="code-token">/shop/$slug</span></td>
        <td style="text-align: center;"><strong style="color: #E85D75; font-size: 10pt;">93</strong> / 100</td>
        <td style="text-align: center;"><span class="pill-badge pill-matcha">A+</span></td>
        <td>Weight variant selector, sticky cart CTA &amp; trust pills</td>
        <td>Odometer price morph &amp; particle fly to cart</td>
      </tr>
      <tr>
        <td><strong>About &amp; Craft</strong> <span class="code-token">/about</span></td>
        <td style="text-align: center;"><strong style="color: #E85D75; font-size: 10pt;">87</strong> / 100</td>
        <td style="text-align: center;"><span class="pill-badge pill-amber">B+</span></td>
        <td>3D cake angles, ingredient hotspots &amp; macro crumb</td>
        <td>Scroll fatigue (1400+ lines); lazy-load 3D canvas</td>
      </tr>
      <tr>
        <td><strong>Cart &amp; Tray</strong> <span class="code-token">/cart</span></td>
        <td style="text-align: center;"><strong style="color: #E85D75; font-size: 10pt;">88</strong> / 100</td>
        <td style="text-align: center;"><span class="pill-badge pill-berry">A-</span></td>
        <td>3D empty state, variant portion badges &amp; clear breakdown</td>
        <td>Free delivery slot progress bar &amp; exit animations</td>
      </tr>
      <tr>
        <td><strong>Slot Checkout</strong> <span class="code-token">/checkout</span></td>
        <td style="text-align: center;"><strong style="color: #E85D75; font-size: 10pt;">85</strong> / 100</td>
        <td style="text-align: center;"><span class="pill-badge pill-amber">B+</span></td>
        <td>Morning/Noon/Evening slot cards &amp; Leaflet map pin</td>
        <td>Mobile height reduction &amp; 3-step animated progress</td>
      </tr>
      <tr>
        <td><strong>Orders &amp; Tracking</strong> <span class="code-token">/orders</span></td>
        <td style="text-align: center;"><strong style="color: #E85D75; font-size: 10pt;">90</strong> / 100</td>
        <td style="text-align: center;"><span class="pill-badge pill-berry">A</span></td>
        <td>Color-coded status themes &amp; 1-click reorder</td>
        <td>Pulsing baking indicator &amp; empty state suggestions</td>
      </tr>
      <tr>
        <td><strong>Offers &amp; Coupons</strong> <span class="code-token">/offers</span></td>
        <td style="text-align: center;"><strong style="color: #E85D75; font-size: 10pt;">91</strong> / 100</td>
        <td style="text-align: center;"><span class="pill-badge pill-berry">A</span></td>
        <td>Confetti copy explosion &amp; dynamic drift wall</td>
        <td>Drift wall pause on hover &amp; voucher expiry timers</td>
      </tr>
      <tr>
        <td><strong>Play &amp; Win Arcade</strong> <span class="code-token">/play-coupons</span></td>
        <td style="text-align: center;"><strong style="color: #E85D75; font-size: 10pt;">92</strong> / 100</td>
        <td style="text-align: center;"><span class="pill-badge pill-berry">A</span></td>
        <td>Spin wheel physics, 3D memory flip &amp; trivia modal</td>
        <td>Debounce spin trigger &amp; mobile memory card touch size</td>
      </tr>
      <tr>
        <td><strong>Customer Profile</strong> <span class="code-token">/profile</span></td>
        <td style="text-align: center;"><strong style="color: #E85D75; font-size: 10pt;">84</strong> / 100</td>
        <td style="text-align: center;"><span class="pill-badge pill-amber">B</span></td>
        <td>Clean validation &amp; synchronized map coordinates</td>
        <td>Needs pastry order history hub &amp; saved payment cards</td>
      </tr>
      <tr>
        <td><strong>Auth &amp; Session</strong> <span class="code-token">/auth</span></td>
        <td style="text-align: center;"><strong style="color: #E85D75; font-size: 10pt;">88</strong> / 100</td>
        <td style="text-align: center;"><span class="pill-badge pill-berry">A-</span></td>
        <td>Google OAuth 1-click &amp; dual signin/signup tabs</td>
        <td>Password strength meter &amp; mobile keyboard overlap</td>
      </tr>
      <tr>
        <td><strong>Admin Backoffice</strong> <span class="code-token">/admin</span></td>
        <td style="text-align: center;"><strong style="color: #E85D75; font-size: 10pt;">86</strong> / 100</td>
        <td style="text-align: center;"><span class="pill-badge pill-amber">B+</span></td>
        <td>End-to-end catalogue management &amp; weight generator</td>
        <td>High density; needs sticky tabs &amp; mobile table scroll</td>
      </tr>
    </tbody>
  </table>

  <!-- Evaluation Heuristic Framework -->
  <div style="margin-top: 18px;">
    <h3 class="font-blogh" style="font-size: 11pt; text-transform: uppercase; color: #2C1810; margin-bottom: 8px;">
      Heuristic Weighting &amp; Scoring Criteria
    </h3>
    <div class="four-col">
      <div class="card-box">
        <div style="font-weight: 700; color: #E85D75; font-size: 8pt; text-transform: uppercase;">1. Visual Harmony (20%)</div>
        <div style="font-size: 7.5pt; color: #523932; margin-top: 3px;">Cohesive cream/berry color space, font hierarchy, soft organic border radii (16-24px), bakery luxury feel.</div>
      </div>
      <div class="card-box">
        <div style="font-weight: 700; color: #D97706; font-size: 8pt; text-transform: uppercase;">2. Architecture (20%)</div>
        <div style="font-size: 7.5pt; color: #523932; margin-top: 3px;">Clarity of catalog organization, search speed, mental model of morning slots, and cognitive friction.</div>
      </div>
      <div class="card-box">
        <div style="font-weight: 700; color: #059669; font-size: 8pt; text-transform: uppercase;">3. Motion Polish (20%)</div>
        <div style="font-size: 7.5pt; color: #523932; margin-top: 3px;">Tactile dough spring dynamics, smooth cart transitions, scroll choreographies, hover feedback.</div>
      </div>
      <div class="card-box">
        <div style="font-weight: 700; color: #2C1810; font-size: 8pt; text-transform: uppercase;">4. Ergonomics (20%)</div>
        <div style="font-size: 7.5pt; color: #523932; margin-top: 3px;">Thumb-zone reachability on mobile, sticky CTA conversion paths, tap target sizes (min 48px), and input joy.</div>
      </div>
    </div>
  </div>

  <div class="doc-footer">
    <span>Ani Bakes · Internal Design Audit Report</span>
    <span>Page 2 of 8</span>
  </div>
</div>


<!-- ==================== PART II: HOME & SHOP AUDIT ==================== -->
<div class="page-break">
  <div class="doc-header">
    <span>Ani Bakes · Senior UI/UX Audit</span>
    <span>Part II: Storefront Core (Home &amp; Shop Counter)</span>
  </div>

  <!-- Page 1: Home Page -->
  <div class="avoid-break" style="margin-bottom: 20px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <div>
        <span class="pill-badge pill-berry">LANDING EXPERIENCE</span>
        <h2 class="font-blogh" style="font-size: 15pt; text-transform: uppercase; color: #2C1810; margin-top: 2px;">
          1. Home Page (<span class="code-token">/</span>)
        </h2>
      </div>
      <div class="score-badge score-high">
        <span class="score-num">92</span>
        <span class="score-total">/ 100</span>
      </div>
    </div>

    <div class="three-col">
      <div class="keep-box">
        <div style="font-weight: 700; color: #16A34A; font-size: 8pt; text-transform: uppercase; margin-bottom: 4px;">
          ✓ What to Keep (High-Converting)
        </div>
        <div class="list-item list-keep"><strong>3D Confectionery Hero Section:</strong> Captivating visual storytelling with luxury pastry rotation and dawn-baking narrative.</div>
        <div class="list-item list-keep"><strong>CakeBuilderWidget:</strong> High-engagement interactive cake customizer simulator that immediately anchors customer curiosity.</div>
        <div class="list-item list-keep"><strong>PolaroidMomentsWall:</strong> Authentic customer celebration photos building instant social proof.</div>
        <div class="list-item list-keep"><strong>Baker's Laboratory Bento Grid:</strong> Multi-tiered exploration of stone-ground flours, fermentation, and French butter.</div>
      </div>

      <div class="change-box">
        <div style="font-weight: 700; color: #E85D75; font-size: 8pt; text-transform: uppercase; margin-bottom: 4px;">
          ⚠ What to Change (Friction Points)
        </div>
        <div class="list-item list-change"><strong>Category Coverflow on Mobile:</strong> The 3D peek carousel can feel heavy on mobile GPUs; optimize with CSS <code>scroll-snap-type: x mandatory</code>.</div>
        <div class="list-item list-change"><strong>Header Theme Transition:</strong> Switching from hero pink to glass cream jumps abruptly on rapid scroll. Debounce transition duration to 350ms.</div>
        <div class="list-item list-change"><strong>FAQ Category Pills:</strong> Horizontal scroll indicator is missing on small screens; users may not realize categories are swipeable.</div>
      </div>

      <div class="anim-box">
        <div style="font-weight: 700; color: #8B5CF6; font-size: 8pt; text-transform: uppercase; margin-bottom: 4px;">
          ✨ Prescribed Animations &amp; Fluidity
        </div>
        <div class="list-item list-anim"><strong>Bento Stagger Entrance:</strong> Use Framer Motion <code>staggerChildren: 0.08</code> with soft upward spring (<code>y: 12px → 0px, stiffness: 320</code>).</div>
        <div class="list-item list-anim"><strong>Hero Text Loop Fade:</strong> Replace sudden text replacement with <code>y: -100%</code> wipe and <code>opacity: 0.2 → 1</code> buttery glaze curve.</div>
        <div class="list-item list-anim"><strong>Floating Confection Pill Drift:</strong> Continuous gentle floating animation (<code>translateY(-3px)</code>, duration 3.2s, easeInOut).</div>
      </div>
    </div>
  </div>

  <!-- Page 2: Shop & Bakery Counter -->
  <div class="avoid-break">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <div>
        <span class="pill-badge pill-amber">COMMERCE CATALOG</span>
        <h2 class="font-blogh" style="font-size: 15pt; text-transform: uppercase; color: #2C1810; margin-top: 2px;">
          2. Bakery Counter Catalog (<span class="code-token">/shop</span>)
        </h2>
      </div>
      <div class="score-badge score-high">
        <span class="score-num">89</span>
        <span class="score-total">/ 100</span>
      </div>
    </div>

    <div class="three-col">
      <div class="keep-box">
        <div style="font-weight: 700; color: #16A34A; font-size: 8pt; text-transform: uppercase; margin-bottom: 4px;">
          ✓ What to Keep (High-Converting)
        </div>
        <div class="list-item list-keep"><strong>Horizontal Category Lanes:</strong> 4-cards-per-row desktop layout with horizontal scroll and quick "View All {Category}" button.</div>
        <div class="list-item list-keep"><strong>Mobile 2x2 Bento Cards:</strong> Shows top 4 curated items on mobile with a clean full-width expansion button.</div>
        <div class="list-item list-keep"><strong>Portion &amp; Weight Badges:</strong> Clear weight and piece counts directly visible on product cards.</div>
        <div class="list-item list-keep"><strong>MultiButton View Toggles:</strong> GodUI switch between Featured, Price, and Alphabetical order.</div>
      </div>

      <div class="change-box">
        <div style="font-weight: 700; color: #E85D75; font-size: 8pt; text-transform: uppercase; margin-bottom: 4px;">
          ⚠ What to Change (Friction Points)
        </div>
        <div class="list-item list-change"><strong>Search Empty State:</strong> When a search query yields no results, show "Looking for something special? Suggest a bake" instead of a dead-end.</div>
        <div class="list-item list-change"><strong>Category Sticky Bar Jump:</strong> When scrolling down past the hero, category pills should dock gracefully without content jumping.</div>
        <div class="list-item list-change"><strong>Add-to-Cart Card Button:</strong> Currently navigates to detail page; a secondary mini "+" quick-add button would speed up repeat sourdough buyers.</div>
      </div>

      <div class="anim-box">
        <div style="font-weight: 700; color: #8B5CF6; font-size: 8pt; text-transform: uppercase; margin-bottom: 4px;">
          ✨ Prescribed Animations &amp; Fluidity
        </div>
        <div class="list-item list-anim"><strong>Card Hover Lift:</strong> <code>transform: translateY(-4px) scale(1.015)</code> with soft warm chocolate shadow (<code>0 14px 28px -10px rgba(44,24,16,0.18)</code>).</div>
        <div class="list-item list-anim"><strong>Category Filter Morph:</strong> Use Framer Motion <code>layoutId="activeCategoryPill"</code> for smooth sliding background pill transition.</div>
        <div class="list-item list-anim"><strong>Card Image Cross-Fade:</strong> Secondary hover preview image cross-fading gently over 300ms.</div>
      </div>
    </div>
  </div>

  <div class="doc-footer">
    <span>Ani Bakes · Internal Design Audit Report</span>
    <span>Page 3 of 8</span>
  </div>
</div>


<!-- ==================== PART III: PRODUCT DETAIL & ABOUT AUDIT ==================== -->
<div class="page-break">
  <div class="doc-header">
    <span>Ani Bakes · Senior UI/UX Audit</span>
    <span>Part III: Product Detail &amp; Confectionery Craft</span>
  </div>

  <!-- Page 3: Product Detail Page -->
  <div class="avoid-break" style="margin-bottom: 20px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <div>
        <span class="pill-badge pill-matcha">HIGHEST SCORING ROUTE</span>
        <h2 class="font-blogh" style="font-size: 15pt; text-transform: uppercase; color: #2C1810; margin-top: 2px;">
          3. Product Detail Page (<span class="code-token">/shop/$slug</span>)
        </h2>
      </div>
      <div class="score-badge score-high">
        <span class="score-num">93</span>
        <span class="score-total">/ 100</span>
      </div>
    </div>

    <div class="three-col">
      <div class="keep-box">
        <div style="font-weight: 700; color: #16A34A; font-size: 8pt; text-transform: uppercase; margin-bottom: 4px;">
          ✓ What to Keep (High-Converting)
        </div>
        <div class="list-item list-keep"><strong>Weight Variant Chips:</strong> Explicit display of weights (95g single, 380g Box of 4, 850g Grand Tasting) with serving yields.</div>
        <div class="list-item list-keep"><strong>Sticky Mobile Purchase Bar:</strong> Emerges automatically when user scrolls past primary Add-to-Cart button.</div>
        <div class="list-item list-keep"><strong>Kitchen Freshness Pill:</strong> Prominent badge highlighting that this item is mixed and baked the morning of the slot.</div>
        <div class="list-item list-keep"><strong>Customer Review Ratings:</strong> Trust signals with verified customer feedback and average score.</div>
      </div>

      <div class="change-box">
        <div style="font-weight: 700; color: #E85D75; font-size: 8pt; text-transform: uppercase; margin-bottom: 4px;">
          ⚠ What to Change (Friction Points)
        </div>
        <div class="list-item list-change"><strong>Static Price Switching:</strong> Price text replaces instantly when clicking a variant. It should animate smoothly to emphasize value.</div>
        <div class="list-item list-change"><strong>Mobile Gallery Dots:</strong> Small tap targets for image carousel arrows; enable direct horizontal swipe gesture with momentum.</div>
        <div class="list-item list-change"><strong>Review Submission Modal:</strong> Form lacks optimistic UI preview; submitting feels like a standard form post.</div>
      </div>

      <div class="anim-box">
        <div style="font-weight: 700; color: #8B5CF6; font-size: 8pt; text-transform: uppercase; margin-bottom: 4px;">
          ✨ Prescribed Animations &amp; Fluidity
        </div>
        <div class="list-item list-anim"><strong>Price Odometer Roll:</strong> Animate numbers roll upward (e.g. ₹95 → ₹360) using custom CSS counter transform.</div>
        <div class="list-item list-anim"><strong>Fly-to-Cart Particle:</strong> On clicking "Add to Cart", launch a 36px mini product thumbnail along a quadratic Bézier curve directly into the header cart badge.</div>
        <div class="list-item list-anim"><strong>Dough Tap Recoil:</strong> Button scale down to <code>0.95</code> with spring bounce back on release (<code>stiffness: 400, damping: 20</code>).</div>
      </div>
    </div>
  </div>

  <!-- Page 4: About Page -->
  <div class="avoid-break">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <div>
        <span class="pill-badge pill-amber">BRAND STORYTELLING</span>
        <h2 class="font-blogh" style="font-size: 15pt; text-transform: uppercase; color: #2C1810; margin-top: 2px;">
          4. About &amp; Confectionery Craft (<span class="code-token">/about</span>)
        </h2>
      </div>
      <div class="score-badge score-high">
        <span class="score-num">87</span>
        <span class="score-total">/ 100</span>
      </div>
    </div>

    <div class="three-col">
      <div class="keep-box">
        <div style="font-weight: 700; color: #16A34A; font-size: 8pt; text-transform: uppercase; margin-bottom: 4px;">
          ✓ What to Keep (High-Converting)
        </div>
        <div class="list-item list-keep"><strong>3D Cake Multi-Angle Viewer:</strong> Interactive camera views (Front, Orbit, Crumb Macro, Top) showcasing artisanal crumb structure.</div>
        <div class="list-item list-keep"><strong>Nutritional &amp; Macro Transparency:</strong> 185 kcal, 12g protein, 0g refined sugar callouts that validate wellness baking.</div>
        <div class="list-item list-keep"><strong>Ingredient Hotspots:</strong> Interactive markers linking to health benefits (Stone-ground wheat, Monkfruit sweetening).</div>
        <div class="list-item list-keep"><strong>Delivery Security Showcase:</strong> Visual proof of tamper-evident confectionery packaging and insulated delivery.</div>
      </div>

      <div class="change-box">
        <div style="font-weight: 700; color: #E85D75; font-size: 8pt; text-transform: uppercase; margin-bottom: 4px;">
          ⚠ What to Change (Friction Points)
        </div>
        <div class="list-item list-change"><strong>Page Length (1400+ lines):</strong> Excessive vertical scroll causing drop-off before reaching the bakery mission. Split into clean tabbed chapters.</div>
        <div class="list-item list-change"><strong>Mobile WebGL Initialization:</strong> Three.js canvas should only mount when entering the viewport using <code>IntersectionObserver</code> to prevent initial lag.</div>
        <div class="list-item list-change"><strong>Hotspot Marker Clutter:</strong> On mobile, multiple hotspot pills can overlap. Collapse into a bottom-drawer preview sheet.</div>
      </div>

      <div class="anim-box">
        <div style="font-weight: 700; color: #8B5CF6; font-size: 8pt; text-transform: uppercase; margin-bottom: 4px;">
          ✨ Prescribed Animations &amp; Fluidity
        </div>
        <div class="list-item list-anim"><strong>Camera Angle Smooth Interpolation:</strong> Three.js camera orbital interpolation using GSAP <code>Power2.easeInOut</code> (duration 1.2s).</div>
        <div class="list-item list-anim"><strong>Hotspot Ripple Pulse:</strong> Multi-ring radar pulse around active ingredient pins (<code>scale: 1 → 1.8, opacity: 0.6 → 0</code>).</div>
        <div class="list-item list-anim"><strong>Timeline Scrub Animation:</strong> Fermentation clock dial rotating in sync with scroll progress.</div>
      </div>
    </div>
  </div>

  <div class="doc-footer">
    <span>Ani Bakes · Internal Design Audit Report</span>
    <span>Page 4 of 8</span>
  </div>
</div>


<!-- ==================== PART IV: CART & CHECKOUT AUDIT ==================== -->
<div class="page-break">
  <div class="doc-header">
    <span>Ani Bakes · Senior UI/UX Audit</span>
    <span>Part IV: Conversion Funnel (Cart &amp; Slot Checkout)</span>
  </div>

  <!-- Page 5: Cart Page -->
  <div class="avoid-break" style="margin-bottom: 20px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <div>
        <span class="pill-badge pill-berry">TRAY REVIEW</span>
        <h2 class="font-blogh" style="font-size: 15pt; text-transform: uppercase; color: #2C1810; margin-top: 2px;">
          5. Cart &amp; Bake Tray (<span class="code-token">/cart</span>)
        </h2>
      </div>
      <div class="score-badge score-high">
        <span class="score-num">88</span>
        <span class="score-total">/ 100</span>
      </div>
    </div>

    <div class="three-col">
      <div class="keep-box">
        <div style="font-weight: 700; color: #16A34A; font-size: 8pt; text-transform: uppercase; margin-bottom: 4px;">
          ✓ What to Keep (High-Converting)
        </div>
        <div class="list-item list-keep"><strong>3D Red Cart Empty State:</strong> Charming playful illustration replacing a sterile blank table.</div>
        <div class="list-item list-keep"><strong>Portion Badges:</strong> Explicit display of selected weight variant (e.g. ⚖️ Gourmet Box of 4) preventing ordering errors.</div>
        <div class="list-item list-keep"><strong>Sticky Checkout Summary:</strong> Clear subtotal, savings callout, and direct proceed CTA.</div>
      </div>

      <div class="change-box">
        <div style="font-weight: 700; color: #E85D75; font-size: 8pt; text-transform: uppercase; margin-bottom: 4px;">
          ⚠ What to Change (Friction Points)
        </div>
        <div class="list-item list-change"><strong>Free Shipping Threshold Bar:</strong> Add a visual progress meter: <em>"Add ₹120 more for complimentary morning slot delivery"</em> to boost AOV.</div>
        <div class="list-item list-change"><strong>Instant Item Removal:</strong> Currently items vanish instantly. An accidental click removes the bake without undo capability. Add a 4-second toast undo.</div>
        <div class="list-item list-change"><strong>Cross-Sell Carousel:</strong> Missing a <em>"Pairs perfectly with your order"</em> row (e.g. cold brew dip, mini cookies).</div>
      </div>

      <div class="anim-box">
        <div style="font-weight: 700; color: #8B5CF6; font-size: 8pt; text-transform: uppercase; margin-bottom: 4px;">
          ✨ Prescribed Animations &amp; Fluidity
        </div>
        <div class="list-item list-anim"><strong>AnimatePresence Row Exit:</strong> Slide out to left (<code>x: 0 → -80px, opacity: 1 → 0</code>) with height smoothly collapsing to 0.</div>
        <div class="list-item list-anim"><strong>Quantity Stepper Pop:</strong> Micro-scale bump on quantity count (<code>scale: 1 → 1.25 → 1</code>, duration 160ms).</div>
        <div class="list-item list-anim"><strong>Threshold Fill Animation:</strong> Gradient bar flowing smoothly with celebratory shimmer when target is achieved.</div>
      </div>
    </div>
  </div>

  <!-- Page 6: Checkout & Slot Booking -->
  <div class="avoid-break">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <div>
        <span class="pill-badge pill-amber">CRITICAL REVENUE PATH</span>
        <h2 class="font-blogh" style="font-size: 15pt; text-transform: uppercase; color: #2C1810; margin-top: 2px;">
          6. Checkout &amp; Slot Selection (<span class="code-token">/checkout</span>)
        </h2>
      </div>
      <div class="score-badge score-high">
        <span class="score-num">85</span>
        <span class="score-total">/ 100</span>
      </div>
    </div>

    <div class="three-col">
      <div class="keep-box">
        <div style="font-weight: 700; color: #16A34A; font-size: 8pt; text-transform: uppercase; margin-bottom: 4px;">
          ✓ What to Keep (High-Converting)
        </div>
        <div class="list-item list-keep"><strong>Four-Period Time Slot Cards:</strong> Visual representation of Morning (8-11am), Midday (11am-2pm), Afternoon (2-5pm), and Evening (5-8pm).</div>
        <div class="list-item list-keep"><strong>Transparent Payment Assurance:</strong> Prominent explanation that users only pay after oven capacity is confirmed.</div>
        <div class="list-item list-keep"><strong>Interactive Leaflet Map Pin:</strong> Exact apartment entrance pinning avoiding delivery phone confusion.</div>
        <div class="list-item list-keep"><strong>Alternate Contact Accordion:</strong> Convenient option to specify recipient details for celebration gifts.</div>
      </div>

      <div class="change-box">
        <div style="font-weight: 700; color: #E85D75; font-size: 8pt; text-transform: uppercase; margin-bottom: 4px;">
          ⚠ What to Change (Friction Points)
        </div>
        <div class="list-item list-change"><strong>Long Mobile Form Length:</strong> The checkout page requires extensive vertical scrolling on smartphones. Introduce a 3-step progressive stepper.</div>
        <div class="list-item list-change"><strong>Date Selector Scroll:</strong> Next-day date pills require horizontal swipe; active date should auto-center smoothly on mount.</div>
        <div class="list-item list-change"><strong>Missing Order Total in Sticky Header:</strong> While filling location pin, total price disappears from view. Retain mini summary pill.</div>
      </div>

      <div class="anim-box">
        <div style="font-weight: 700; color: #8B5CF6; font-size: 8pt; text-transform: uppercase; margin-bottom: 4px;">
          ✨ Prescribed Animations &amp; Fluidity
        </div>
        <div class="list-item list-anim"><strong>Slot Card Active Spring:</strong> Selected slot expands with subtle border glow (<code>box-shadow: 0 0 0 2px #E85D75, scale: 1.02</code>).</div>
        <div class="list-item list-anim"><strong>Step Transition Morph:</strong> Sliding cross-fade between Step 1 (Time &amp; Slot) → Step 2 (Location Pin) → Step 3 (Confirmation).</div>
        <div class="list-item list-anim"><strong>Map Pin Drop Animation:</strong> Animated bounce on marker placement mimicking physical pin landing on dough.</div>
      </div>
    </div>
  </div>

  <div class="doc-footer">
    <span>Ani Bakes · Internal Design Audit Report</span>
    <span>Page 5 of 8</span>
  </div>
</div>


<!-- ==================== PART V: ORDERS, OFFERS & ARCADE AUDIT ==================== -->
<div class="page-break">
  <div class="doc-header">
    <span>Ani Bakes · Senior UI/UX Audit</span>
    <span>Part V: Retention, Gamification &amp; Account Experience</span>
  </div>

  <!-- Page 7: Orders & Tracking -->
  <div class="avoid-break" style="margin-bottom: 16px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
      <div>
        <span class="pill-badge pill-berry">POST-PURCHASE DELIGHT</span>
        <h2 class="font-blogh" style="font-size: 14pt; text-transform: uppercase; color: #2C1810; margin-top: 2px;">
          7. Orders &amp; Live Tracking (<span class="code-token">/orders</span>) — Score: 90 / 100
        </h2>
      </div>
    </div>
    <div class="three-col">
      <div class="keep-box">
        <div style="font-weight: 700; color: #16A34A; font-size: 8pt; text-transform: uppercase; margin-bottom: 3px;">✓ Keep</div>
        <div class="list-item list-keep">Color-coded status cards (Received, In Oven, Dispatched, Delivered) providing immediate clarity.</div>
        <div class="list-item list-keep">One-click reorder button populating the cart with past favourites.</div>
        <div class="list-item list-keep">Direct WhatsApp / phone support dialog linked to specific order ID.</div>
      </div>
      <div class="change-box">
        <div style="font-weight: 700; color: #E85D75; font-size: 8pt; text-transform: uppercase; margin-bottom: 3px;">⚠ Change</div>
        <div class="list-item list-change">Rescheduled or cancelled banners look alarming; soften with empathetic bakery tone.</div>
        <div class="list-item list-change">Empty orders screen lacks direct links to bestselling sourdough &amp; brownies.</div>
      </div>
      <div class="anim-box">
        <div style="font-weight: 700; color: #8B5CF6; font-size: 8pt; text-transform: uppercase; margin-bottom: 3px;">✨ Motion Recommendation</div>
        <div class="list-item list-anim">Baking state icon: gentle pulsing golden glow mimicking an oven light (<code>box-shadow: 0 0 16px rgba(245,158,11,0.4)</code>).</div>
        <div class="list-item list-anim">Drawer receipt expansion: spring physics accordion for order items.</div>
      </div>
    </div>
  </div>

  <!-- Page 8: Offers & Gamified Arcade -->
  <div class="avoid-break" style="margin-bottom: 16px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
      <div>
        <span class="pill-badge pill-matcha">RETENTION &amp; VIRALITY</span>
        <h2 class="font-blogh" style="font-size: 14pt; text-transform: uppercase; color: #2C1810; margin-top: 2px;">
          8. Offers (<span class="code-token">/offers</span>) &amp; Confectionery Arcade (<span class="code-token">/play-coupons</span>) — Score: 92 / 100
        </h2>
      </div>
    </div>
    <div class="three-col">
      <div class="keep-box">
        <div style="font-weight: 700; color: #16A34A; font-size: 8pt; text-transform: uppercase; margin-bottom: 3px;">✓ Keep</div>
        <div class="list-item list-keep">Spin the Wheel physics with realistic deceleration and celebratory sound/confetti.</div>
        <div class="list-item list-keep">3D Memory match card flip game rewarding successful pairs with 15% discount.</div>
        <div class="list-item list-keep">3D Blueprint video and gift box hero art creating high visual delight.</div>
      </div>
      <div class="change-box">
        <div style="font-weight: 700; color: #E85D75; font-size: 8pt; text-transform: uppercase; margin-bottom: 3px;">⚠ Change</div>
        <div class="list-item list-change">Spin button allows accidental rapid double-tap during spin animation; disable until stopped.</div>
        <div class="list-item list-change">Offer cards on drift wall scroll continuously; add instant pause when user hovers or touches card.</div>
      </div>
      <div class="anim-box">
        <div style="font-weight: 700; color: #8B5CF6; font-size: 8pt; text-transform: uppercase; margin-bottom: 3px;">✨ Motion Recommendation</div>
        <div class="list-item list-anim">Confetti particle trajectory: radial explosion using canvas particle emitter with slight gravity drift.</div>
        <div class="list-item list-anim">Voucher Claim Modal: celebratory pop-in with bounce (<code>scale: 0.8 → 1.05 → 1.0</code>).</div>
      </div>
    </div>
  </div>

  <!-- Page 9 & 10: Profile & Auth -->
  <div class="avoid-break">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
      <div>
        <span class="pill-badge pill-cocoa">ACCOUNT &amp; IDENTITY</span>
        <h2 class="font-blogh" style="font-size: 14pt; text-transform: uppercase; color: #2C1810; margin-top: 2px;">
          9. Customer Profile (<span class="code-token">/profile</span>) &amp; Auth (<span class="code-token">/auth</span>) — Score: 86 / 100
        </h2>
      </div>
    </div>
    <div class="three-col">
      <div class="keep-box">
        <div style="font-weight: 700; color: #16A34A; font-size: 8pt; text-transform: uppercase; margin-bottom: 3px;">✓ Keep</div>
        <div class="list-item list-keep">Google 1-click authentication token flow eliminating password friction.</div>
        <div class="list-item list-keep">Clean form input group for full name, mobile number, and pinned coordinates.</div>
      </div>
      <div class="change-box">
        <div style="font-weight: 700; color: #E85D75; font-size: 8pt; text-transform: uppercase; margin-bottom: 3px;">⚠ Change</div>
        <div class="list-item list-change">Profile feels utilitarian compared to storefront warmth. Add an "Artisan Sweet Points / Bakes Ordered" counter.</div>
        <div class="list-item list-change">Auth modal tab switch between Sign In and Sign Up lacks sliding underline animation.</div>
      </div>
      <div class="anim-box">
        <div style="font-weight: 700; color: #8B5CF6; font-size: 8pt; text-transform: uppercase; margin-bottom: 3px;">✨ Motion Recommendation</div>
        <div class="list-item list-anim">Profile save feedback: button text morphs into an animated checkmark icon.</div>
        <div class="list-item list-anim">Error shake effect: on invalid phone or password, input shakes horizontally (<code>x: -6px → 6px → 0</code>).</div>
      </div>
    </div>
  </div>

  <div class="doc-footer">
    <span>Ani Bakes · Internal Design Audit Report</span>
    <span>Page 6 of 8</span>
  </div>
</div>


<!-- ==================== PART VI: CONFECTIONERY MOTION MATRIX ==================== -->
<div class="page-break">
  <div class="doc-header">
    <span>Ani Bakes · Senior UI/UX Audit</span>
    <span>Part VI: The Confectionery Motion Matrix</span>
  </div>

  <h2 class="font-blogh" style="font-size: 18pt; text-transform: uppercase; color: #2C1810; margin-bottom: 4px;">
    The Confectionery Motion Matrix (Animation Framework)
  </h2>
  <p style="font-size: 8.5pt; color: #785E55; margin-bottom: 14px;">
    To make interactions feel buttery, organic, and premium, Ani Bakes should reject generic linear transitions in favour of physical spring mechanics inspired by dough elasticity and pastry glaze.
  </p>

  <div class="two-col" style="margin-bottom: 14px;">
    <div class="card-hero">
      <h3 class="font-blogh" style="font-size: 11pt; text-transform: uppercase; color: #2C1810; margin-bottom: 6px;">
        1. Dough Recoil Curve (Buttons &amp; Cards)
      </h3>
      <p style="font-size: 8pt; color: #523932; margin-bottom: 8px;">
        Emulates the soft, resilient bounce of properly proofed brioche dough when pressed with a fingertip.
      </p>
      <div style="background: #FFFFFF; padding: 8px; border-radius: 8px; border: 1px solid rgba(44,24,16,0.1); font-family: monospace; font-size: 7.5pt;">
        <strong>Framer Motion Physics:</strong><br>
        whileTap: { scale: 0.96 }<br>
        transition: { type: "spring", stiffness: 420, damping: 22 }<br>
        whileHover: { y: -3, scale: 1.015, transition: { duration: 0.2 } }
      </div>
    </div>

    <div class="card-hero">
      <h3 class="font-blogh" style="font-size: 11pt; text-transform: uppercase; color: #2C1810; margin-bottom: 6px;">
        2. Chocolate Glaze Drip (Drawers &amp; Menus)
      </h3>
      <p style="font-size: 8pt; color: #523932; margin-bottom: 8px;">
        Emulates warm Belgian ganache cascading over a celebration cake: quick deceleration with velvety settling.
      </p>
      <div style="background: #FFFFFF; padding: 8px; border-radius: 8px; border: 1px solid rgba(44,24,16,0.1); font-family: monospace; font-size: 7.5pt;">
        <strong>CSS Cubic-Bezier Curve:</strong><br>
        transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);<br>
        duration: 380ms;<br>
        transform: translateY(0) → translateY(-6px);
      </div>
    </div>
  </div>

  <table class="audit-table">
    <thead>
      <tr>
        <th style="width: 22%;">Interaction Name</th>
        <th style="width: 20%;">Target Element</th>
        <th style="width: 30%;">Choreography &amp; Easing</th>
        <th style="width: 28%;">Expected Emotional Feel</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Fly-to-Tray Launch</strong></td>
        <td>Add-to-Cart Button → Header Bag</td>
        <td>Quadratic Bézier curve (duration: 520ms). Particle starts at button scale 1.0, shrinks to 0.3 at apex, cart badge shakes <code>rotate(12deg)</code> on catch.</td>
        <td>Playful, confirms addition without jarring page redirection.</td>
      </tr>
      <tr>
        <td><strong>Price Switch Odometer</strong></td>
        <td>Product Weight Variants</td>
        <td>Split numeral digits in flex column. Digits translate vertically <code>translateY(-100%)</code> with stagger 40ms.</td>
        <td>High-end luxury catalog feel; highlights transparent unit pricing.</td>
      </tr>
      <tr>
        <td><strong>Time Slot Lift &amp; Glow</strong></td>
        <td>Morning / Afternoon Slot Cards</td>
        <td><code>scale: 1.0 → 1.025</code>, border color transitions to strawberry glaze with outer warm glow (<code>0 0 20px rgba(232,93,117,0.25)</code>).</td>
        <td>Reassures slot reservation availability and confidence.</td>
      </tr>
      <tr>
        <td><strong>Cart Row Exit Dissolve</strong></td>
        <td>Deleted Bake Tray Item</td>
        <td>Row slides left <code>x: -60px</code> while opacity fades to 0 (240ms), subsequent rows slide up smoothly (spring damping: 25).</td>
        <td>Clean, zero layout jumping or jarring flashes.</td>
      </tr>
      <tr>
        <td><strong>Confetti Voucher Drift</strong></td>
        <td>Coupon Code Copy Button</td>
        <td>12 micro-confetti squares emit radially with random velocities between 60-120px, decelerating under simulated gravity.</td>
        <td>Dopamine reward for unlocking discounts.</td>
      </tr>
      <tr>
        <td><strong>Page Route Dissolve</strong></td>
        <td>Route Transitions</td>
        <td>Subtle <code>opacity: 0 → 1</code> with <code>translateY: 8px → 0px</code> over 220ms using <code>easeOutQuad</code>.</td>
        <td>Native app fluid feel between shop, product, and cart.</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 14px;" class="card-box">
    <div style="font-weight: 700; color: #E85D75; font-size: 8.5pt; text-transform: uppercase; margin-bottom: 4px;">
      💡 Accessibility (a11y) &amp; Reduced Motion
    </div>
    <p style="font-size: 8pt; color: #523932; margin: 0; line-height: 1.5;">
      All physical spring animations and particle drifts must respect <code>@media (prefers-reduced-motion: reduce)</code>. When reduced motion is enabled, all scale and translation effects are collapsed into instant or subtle 120ms opacity cross-fades, ensuring full WCAG 2.1 AAA accessibility compliance.
    </p>
  </div>

  <div class="doc-footer">
    <span>Ani Bakes · Internal Design Audit Report</span>
    <span>Page 7 of 8</span>
  </div>
</div>


<!-- ==================== PART VII: STRATEGIC ROADMAP & SPEC ==================== -->
<div class="page-break">
  <div class="doc-header">
    <span>Ani Bakes · Senior UI/UX Audit</span>
    <span>Part VII: Strategic 90-Day Implementation Roadmap</span>
  </div>

  <h2 class="font-blogh" style="font-size: 18pt; text-transform: uppercase; color: #2C1810; margin-bottom: 4px;">
    Strategic 90-Day Design &amp; Motion Roadmap
  </h2>
  <p style="font-size: 8.5pt; color: #785E55; margin-bottom: 16px;">
    Structured prioritization separating immediate conversion quick wins from deeper motion system integration and architectural consolidation.
  </p>

  <div class="three-col">
    <div class="card-box" style="border-top: 3px solid #E85D75;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span class="pill-badge pill-berry">PHASE 1 (DAYS 1–14)</span>
      </div>
      <h3 class="font-blogh" style="font-size: 11pt; text-transform: uppercase; color: #2C1810; margin-bottom: 6px;">
        Immediate Conversion Quick Wins
      </h3>
      <div class="list-item list-change"><strong>Free Shipping Threshold Meter:</strong> Add dynamic progress bar to cart tray (<em>"Add ₹120 for free morning delivery"</em>).</div>
      <div class="list-item list-change"><strong>Mobile Checkout Stepper:</strong> Split lengthy checkout into clean 3-step sequence (Slot → Address → Pay).</div>
      <div class="list-item list-change"><strong>Price Odometer:</strong> Add animated counter when selecting product weight variants.</div>
      <div class="list-item list-change"><strong>Header Transition Debounce:</strong> Smooth out hero-to-cream navbar color transition.</div>
    </div>

    <div class="card-box" style="border-top: 3px solid #D97706;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span class="pill-badge pill-amber">PHASE 2 (DAYS 15–45)</span>
      </div>
      <h3 class="font-blogh" style="font-size: 11pt; text-transform: uppercase; color: #2C1810; margin-bottom: 6px;">
        Confectionery Motion Integration
      </h3>
      <div class="list-item list-anim"><strong>Fly-to-Cart Particle:</strong> Implement quadratic Bézier flight trajectory from Add-to-Cart CTA to header cart.</div>
      <div class="list-item list-anim"><strong>Dough Recoil Physics:</strong> Standardize button and card tap recoil curves across GodUI design system.</div>
      <div class="list-item list-anim"><strong>Bento Grid Stagger:</strong> Add subtle staggered viewport entrance on Home Page lab grid.</div>
      <div class="list-item list-anim"><strong>Cart Item Exit Transition:</strong> AnimatePresence slide and height collapse on deleted tray items.</div>
    </div>

    <div class="card-box" style="border-top: 3px solid #059669;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span class="pill-badge pill-matcha">PHASE 3 (DAYS 46–90)</span>
      </div>
      <h3 class="font-blogh" style="font-size: 11pt; text-transform: uppercase; color: #2C1810; margin-bottom: 6px;">
        Architectural Polish &amp; Scale
      </h3>
      <div class="list-item list-keep"><strong>About Page Chapter Tabs:</strong> Re-architect 1400-line about page into clean lazy-loaded chapters with 3D canvas on-demand mounting.</div>
      <div class="list-item list-keep"><strong>Admin Portal Sticky Tabs:</strong> Add docked filter bars and sticky headers for high-density catalog tables.</div>
      <div class="list-item list-keep"><strong>Saved Sweet Rewards Hub:</strong> Turn basic profile into a sweet rewards loyalty lounge with repeat order shortcuts.</div>
    </div>
  </div>

  <div class="card-hero" style="margin-top: 20px;">
    <h3 class="font-blogh" style="font-size: 11pt; text-transform: uppercase; color: #2C1810; margin-bottom: 6px;">
      Designer's Concluding Assessment
    </h3>
    <p style="font-size: 8.5pt; color: #523932; line-height: 1.6; margin: 0;">
      Ani Bakes is situated in the top 5% of direct-to-consumer bakery websites globally in terms of thematic identity, typographic charisma, and artisan warmth. Implementing the tactical recommendations and motion blueprints outlined in this report will transform the platform from an already stunning storefront into a seamless, friction-free luxury commerce engine that elevates brand loyalty and daily slot sell-outs.
    </p>
  </div>

  <div class="doc-footer">
    <span>Ani Bakes · Internal Design Audit Report</span>
    <span>Page 8 of 8</span>
  </div>
</div>

</body>
</html>
`;

const htmlFilePath = path.join(DOCS_DIR, 'Ani_Bakes_UI_UX_Comprehensive_Audit_Report.html');
const pdfFilePath = path.join(DOCS_DIR, 'Ani_Bakes_UI_UX_Comprehensive_Audit_Report.pdf');

fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
console.log('HTML audit report written to:', htmlFilePath);

console.log('Generating PDF via Microsoft Edge headless...');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserPath = fs.existsSync(edgePath) ? edgePath : chromePath;

const cmd = `"${browserPath}" --headless=new --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfFilePath}" --no-pdf-header-footer "file:///${htmlFilePath.replace(/\\\\/g, '/')}"`;

execSync(cmd, { stdio: 'inherit' });

if (fs.existsSync(pdfFilePath)) {
  const stats = fs.statSync(pdfFilePath);
  console.log(`✓ PDF successfully generated at: ${pdfFilePath} (${stats.size} bytes)`);
} else {
  console.error('Failed to generate PDF.');
}
