import type { ReactNode } from "react";
import {
  BarChart3,
  Calendar,
  Camera,
  FileText,
  Layers,
  LayoutDashboard,
  Mail,
  Package,
  ShoppingBag,
  Star,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminSectionId =
  | "overview"
  | "orders"
  | "inventory"
  | "shop_layout"
  | "users"
  | "offers"
  | "newsletter"
  | "reviews"
  | "calendar"
  | "analytics"
  | "gallery"
  | "content_editor";

export interface AdminSection {
  id: AdminSectionId;
  /** What it is, in the words a baker would use. */
  label: string;
  /** One line under the page title saying what this screen is for. */
  description: string;
  icon: LucideIcon;
}

export interface AdminSectionGroup {
  title: string;
  items: AdminSection[];
}

/**
 * The admin navigation, in plain English.
 *
 * The previous labels were written in the brand's voice — "Atelier Control",
 * "Gallery Atelier", "Page Text & Copywriting Studio" — which reads well on the
 * storefront and badly on a tool someone uses at 5 AM to find today's orders.
 * Each section also carries a one-line description, shown under the page title,
 * so nobody has to click a tab to learn what it does.
 */
export const ADMIN_SECTION_GROUPS: AdminSectionGroup[] = [
  {
    title: "Every day",
    items: [
      {
        id: "overview",
        label: "Dashboard",
        description: "What needs doing today, at a glance.",
        icon: LayoutDashboard,
      },
      {
        id: "orders",
        label: "Orders",
        description: "Approve, reschedule or cancel customer orders.",
        icon: ShoppingBag,
      },
      {
        id: "inventory",
        label: "Products",
        description: "Add bakes, set prices, hide what you are not making.",
        icon: Package,
      },
      {
        id: "calendar",
        label: "Closed dates",
        description: "Block days you are not baking so no slots can be booked.",
        icon: Calendar,
      },
    ],
  },
  {
    title: "Selling",
    items: [
      {
        id: "shop_layout",
        label: "Shop layout",
        description: "Choose the order categories and products appear in.",
        icon: Layers,
      },
      {
        id: "offers",
        label: "Discount codes",
        description: "Create and expire the codes customers type at checkout.",
        icon: Tag,
      },
      {
        id: "analytics",
        label: "Sales reports",
        description: "Revenue, best sellers and how the week is going.",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "People",
    items: [
      {
        id: "users",
        label: "Customers",
        description: "Everyone with an account, and how to reach them.",
        icon: Users,
      },
      {
        id: "newsletter",
        label: "Newsletter",
        description: "Write and send an email to your subscribers.",
        icon: Mail,
      },
      {
        id: "reviews",
        label: "Reviews & photos",
        description: "Customer reviews and the celebration photos on the homepage.",
        icon: Star,
      },
    ],
  },
  {
    title: "The website",
    items: [
      {
        id: "gallery",
        label: "About page gallery",
        description: "The photo wall shown on the About page.",
        icon: Camera,
      },
      {
        id: "content_editor",
        label: "Website text",
        description: "Edit the headings and paragraphs on the public pages.",
        icon: FileText,
      },
    ],
  },
];

export const ADMIN_SECTIONS: Record<string, AdminSection> = Object.fromEntries(
  ADMIN_SECTION_GROUPS.flatMap((group) => group.items).map((item) => [item.id, item]),
);

/* ------------------------------------------------------------------ */
/* Presentational pieces shared by every tab                           */
/* ------------------------------------------------------------------ */

/** The standard panel every admin section sits in. */
export function AdminCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-border/70 bg-card p-4 shadow-2xs sm:p-5 ${className}`}
    >
      {children}
    </div>
  );
}

/** Heading used at the top of a panel. */
export function AdminSectionHeading({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3.5 flex flex-wrap items-start justify-between gap-2">
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-cocoa sm:text-base">{title}</h3>
        {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

/**
 * A single number worth watching.
 *
 * `tone` only colours the icon and the footnote — the number itself always
 * stays in the text colour, so a screen of these does not read as a warning.
 */
export function AdminStat({
  label,
  value,
  footnote,
  icon: Icon,
  tone = "neutral",
  onClick,
}: {
  label: string;
  value: string | number;
  footnote?: string;
  icon: LucideIcon;
  tone?: "neutral" | "warning" | "good" | "info";
  onClick?: () => void;
}) {
  const tones = {
    neutral: "bg-secondary text-cocoa",
    warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    good: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    info: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  } as const;

  const footnoteTone = {
    neutral: "text-muted-foreground",
    warning: "text-amber-700 dark:text-amber-400",
    good: "text-emerald-700 dark:text-emerald-400",
    info: "text-purple-700 dark:text-purple-400",
  } as const;

  const content = (
    <>
      <div className="min-w-0">
        <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
        <p className="mt-1 font-display text-2xl font-bold text-cocoa tabular-nums">{value}</p>
        {footnote && (
          <p className={`mt-0.5 text-[11px] font-semibold ${footnoteTone[tone]}`}>{footnote}</p>
        )}
      </div>
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-2xl shadow-2xs ${tones[tone]}`}
      >
        <Icon className="size-5" />
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-3xl border border-border/70 bg-card p-4 text-left shadow-2xs transition-all hover:border-berry/40 hover:shadow-soft sm:p-5"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-3xl border border-border/70 bg-card p-4 shadow-2xs sm:p-5">
      {content}
    </div>
  );
}

/** Shown where a list would be if the list were empty. */
export function AdminEmpty({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-border/70 bg-card/50 p-8 text-center">
      <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-cocoa">
        <Icon className="size-5" />
      </span>
      <p className="text-sm font-bold text-cocoa">{title}</p>
      {hint && <p className="max-w-sm text-xs text-muted-foreground">{hint}</p>}
      {action}
    </div>
  );
}
