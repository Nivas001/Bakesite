export interface TimeSlot {
  id: string;
  label: string;
  start: string;
  end: string;
}

export const TIME_SLOTS: TimeSlot[] = [
  { id: "morning", label: "Morning · 8:00 – 11:00", start: "08:00", end: "11:00" },
  { id: "midday", label: "Midday · 11:00 – 14:00", start: "11:00", end: "14:00" },
  { id: "afternoon", label: "Afternoon · 14:00 – 17:00", start: "14:00", end: "17:00" },
  { id: "evening", label: "Evening · 17:00 – 20:00", start: "17:00", end: "20:00" },
];

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Selectable dates: tomorrow through 14 days out, minus blackout dates. */
export function selectableDates(blackout: string[], days = 14): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = 1; i <= days; i += 1) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const iso = toISODate(d);
    if (!blackout.includes(iso)) out.push(iso);
  }
  return out;
}

export function formatSlotDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function slotLabelFor(start: string): string {
  return TIME_SLOTS.find((s) => s.start === start.slice(0, 5))?.label ?? start;
}