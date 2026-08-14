import { Link } from "@tanstack/react-router";
import { NewsletterSignup } from "./newsletter-signup";

export function SiteFooter() {
  return (
    <footer className="mt-20 relative">
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
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-lg font-bold text-cocoa">Sweet Crumb</p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              A small-batch neighbourhood bakery. Everything is baked the morning of your slot.
            </p>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Browse</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li><Link to="/shop" className="hover:text-foreground">All bakes</Link></li>
              <li><Link to="/offers" className="hover:text-foreground">Offers</Link></li>
              <li><Link to="/cart" className="hover:text-foreground">Cart</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="font-semibold">How ordering works</p>
            <p className="mt-3 text-muted-foreground">
              Pick a next-day slot, we confirm availability, then you pay. No payment is taken before
              the bakery approves your slot.
            </p>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Fresh bakes newsletter</p>
            <p className="mt-2 text-muted-foreground">
              New bakes, seasonal specials and offers — about once a month.
            </p>
            <NewsletterSignup />
          </div>
        </div>
        <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Sweet Crumb Bakery
        </div>
      </div>
    </footer>
  );
}