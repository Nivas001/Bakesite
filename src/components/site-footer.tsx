import { Link } from "@tanstack/react-router";
import { NewsletterSignup } from "./newsletter-signup";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/70 bg-secondary/40">
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
    </footer>
  );
}