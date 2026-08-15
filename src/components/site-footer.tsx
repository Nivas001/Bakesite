import { Link } from "@tanstack/react-router";
import { NewsletterSignup } from "./newsletter-signup";

export function SiteFooter() {
  return (
    <footer className="mt-16 sm:mt-20 relative">
      {/* Scalloped Pastry Crust Edge Top Divider */}
      <div className="w-full overflow-hidden leading-none select-none text-secondary/40">
        <svg
          className="w-full h-4 sm:h-6 block fill-current"
          viewBox="0 0 1200 24"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,24 L0,0 C20,20 40,20 60,0 C80,20 100,20 120,0 C140,20 160,20 180,0 C200,20 220,20 240,0 C260,20 280,20 300,0 C320,20 340,20 360,0 C380,20 400,20 420,0 C440,20 460,20 480,0 C500,20 520,20 540,0 C560,20 580,20 600,0 C620,20 640,20 660,0 C680,20 700,20 720,0 C740,20 760,20 780,0 C800,20 820,20 840,0 C860,20 880,20 900,0 C920,20 940,20 960,0 C980,20 1000,20 1020,0 C1040,20 1060,20 1080,0 C1100,20 1120,20 1140,0 C1160,20 1180,20 1200,0 L1200,24 Z"
          />
        </svg>
      </div>

      <div className="bg-secondary/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
          {/* 
            Footer Grid Layout:
            - Mobile (< 640px): 1 centered column with Newsletter only.
            - Tablet (640px - 1024px, sm:): 2 columns (Brand Bio + Newsletter). "Browse" and "How ordering works" are hidden.
            - Desktop (>= 1024px, lg:): All 4 columns (Brand, Browse, How ordering works, Newsletter).
          */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 items-start">
            
            {/* 1. Brand Bio: Hidden on mobile (<640px), visible on tablet & desktop */}
            <div className="hidden sm:block">
              <p className="font-display text-lg font-bold text-cocoa">Ani Bakes</p>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                A small-batch neighbourhood bakery. Everything is baked the morning of your slot.
              </p>
            </div>

            {/* 2. Browse Links: Desktop only (hidden on mobile & tablet) */}
            <div className="hidden lg:block text-sm">
              <p className="font-semibold">Browse</p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li><Link to="/shop" className="hover:text-foreground">All bakes</Link></li>
                <li><Link to="/offers" className="hover:text-foreground">Offers</Link></li>
                <li><Link to="/cart" className="hover:text-foreground">Cart</Link></li>
              </ul>
            </div>

            {/* 3. How Ordering Works: Desktop only (hidden on mobile & tablet) */}
            <div className="hidden lg:block text-sm">
              <p className="font-semibold">How ordering works</p>
              <p className="mt-3 text-muted-foreground">
                Pick a next-day slot, pay instantly to secure your bake queue, and our head baker prepares your bakes fresh.
              </p>
            </div>

            {/* 4. Newsletter: Shown on all devices */}
            <div className="text-sm text-center sm:text-left mx-auto sm:mx-0 max-w-md w-full">
              <p className="font-semibold text-cocoa sm:text-foreground">Fresh bakes newsletter</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                New bakes, seasonal specials and offers — about once a month.
              </p>
              <div className="mt-3 flex justify-center sm:justify-start">
                <NewsletterSignup />
              </div>
            </div>

          </div>
        </div>

        {/* Trademark / Copyright Bar */}
        <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Ani Bakes Bakery
        </div>
      </div>
    </footer>
  );
}