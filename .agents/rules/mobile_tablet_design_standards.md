# Mobile & Tablet Responsiveness Design Standards

## 1. Product & Catalog Grids
- **Mobile (< 640px)**: Always use a **2-column grid** (`grid-cols-2 gap-2.5 sm:gap-4`) with compact card padding (`p-2.5 rounded-2xl`). Never use full-width 1-column product cards that force endless vertical scrolling.
- **Tablet (640px – 1024px)**: Use **3 columns** (`sm:grid-cols-3 md:grid-cols-3 gap-4`) to prevent cards from stretching too wide on iPads/Android tablets.
- **Desktop (>= 1024px)**: Use 3 to 4 columns (`lg:grid-cols-3 xl:grid-cols-4 lg:gap-6`).

## 2. Category & Filter Navigation
- Filter pills and category button bars must use an **overflow horizontal scrolling track** on mobile (`flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap`) rather than wrapping into multi-row stacked layouts.

## 3. Interactive Steppers & Actions
- Stepper design: `[ − ]  quantity  [ + ]` (minimal, no extra internal icons).
- Card buttons: Compact and aligned to the far right (`justify-end ml-auto`).

## 4. Mobile Footer
- On mobile screens, keep only the focused Newsletter Signup (with single-sentence headline) and Copyright Trademark, hiding heavy navigational link blocks.

## 5. Artisanal Slot Scheduling
- Require strict 24-hour advance preparation notice for bake orders.
- Slots starting in less than 24 hours from current time are unavailable.
- Dates with 0 available slots are automatically skipped in date selectors.
