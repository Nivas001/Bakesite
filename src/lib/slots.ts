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

/**
 * Checks if a specific time slot on a date is at least `minNoticeHours` in advance.
 * Example: For 24 hours notice, an order at Saturday 10:50 PM cannot select Sunday slots
 * before Sunday 10:50 PM.
 */
export function isSlotAvailable(
  dateISO: string,
  slotStart: string,
  minNoticeHours = 24,
  now = new Date(),
): boolean {
  if (!dateISO || !slotStart) return false;
  const parts = dateISO.split("-").map(Number);
  const [hh, mm] = slotStart.split(":").map(Number);
  if (parts.length < 3 || hh === undefined || mm === undefined) return false;

  const y = parts[0]!;
  const m = parts[1]!;
  const d = parts[2]!;

  const slotTime = new Date(y, m - 1, d, hh, mm, 0, 0);
  const minAllowedTime = new Date(now.getTime() + minNoticeHours * 60 * 60 * 1000);

  return slotTime.getTime() >= minAllowedTime.getTime();
}

/** Returns all active time slots available for a given date that satisfy the notice window */
export function getAvailableSlotsForDate(
  dateISO: string,
  minNoticeHours = 24,
  now = new Date(),
): TimeSlot[] {
  return TIME_SLOTS.filter((slot) => isSlotAvailable(dateISO, slot.start, minNoticeHours, now));
}

/**
 * Selectable dates: next `count` open days (skipping blackout dates and dates with zero available 24h slots),
 * starting from tomorrow.
 */
export function selectableDates(
  blackout: string[],
  count = 5,
  minNoticeHours = 24,
  now = new Date(),
): string[] {
  const out: string[] = [];
  let dayOffset = 1;

  while (out.length < count && dayOffset <= 45) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);
    const iso = toISODate(d);

    const isBlackedOut = blackout.includes(iso);
    const hasAvailableSlots = getAvailableSlotsForDate(iso, minNoticeHours, now).length > 0;

    if (!isBlackedOut && hasAvailableSlots) {
      out.push(iso);
    }
    dayOffset += 1;
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