import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { NewsletterSignup } from "./newsletter-signup";
import { Instagram, MessageCircle, Mail, Facebook, Heart } from "lucide-react";
import { useFlag, getSocialLinks, type SocialLinks } from "@/lib/feature-flags";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function SiteFooter() {
  const showSocial = useFlag("ff_footer_instagram");
  const [social, setSocial] = useState<SocialLinks>({
    instagram: "",
    whatsapp: "",
    email: "",
    facebook: "",
    x: "",
  });

  useEffect(() => {
    setSocial(getSocialLinks());
  }, []);

  const socialLinksRow = (
    <div className="flex flex-wrap items-center gap-3">
      {/* Instagram */}
      <a
        href={social.instagram || "https://www.instagram.com/aniiibakes_.__"}
        target="_blank"
        rel="noreferrer"
        aria-label="Instagram"
        title="Follow Ani Bakes on Instagram"
        className="group flex size-10 items-center justify-center rounded-2xl border border-border/80 bg-card/80 shadow-2xs transition-all duration-200 hover:scale-110 hover:shadow-soft hover:border-pink-300 dark:hover:border-pink-500/50"
      >
        <img
          src="/icons/icons8-instagram.svg"
          alt="Instagram"
          className="size-6 object-contain transition-transform group-hover:scale-105"
        />
      </a>

      {/* WhatsApp */}
      <a
        href={
          social.whatsapp
            ? (social.whatsapp.startsWith("http")
                ? social.whatsapp
                : `https://wa.me/${social.whatsapp.replace(/\D/g, "")}`)
            : "https://wa.me/919944000000"
        }
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        title="Chat with Ani Bakes on WhatsApp"
        className="group flex size-10 items-center justify-center rounded-2xl border border-border/80 bg-card/80 shadow-2xs transition-all duration-200 hover:scale-110 hover:shadow-soft hover:border-emerald-300 dark:hover:border-emerald-500/50"
      >
        <img
          src="/icons/icons8-whatsapp.svg"
          alt="WhatsApp"
          className="size-6 object-contain transition-transform group-hover:scale-105"
        />
      </a>

      {/* Gmail */}
      <a
        href={`mailto:${social.email || "orders@anibakes.app"}`}
        aria-label="Gmail / Email Us"
        title={`Email Us: ${social.email || "orders@anibakes.app"}`}
        className="group flex size-10 items-center justify-center rounded-2xl border border-border/80 bg-card/80 shadow-2xs transition-all duration-200 hover:scale-110 hover:shadow-soft hover:border-red-300 dark:hover:border-red-500/50"
      >
        <img
          src="/icons/icons8-gmail.svg"
          alt="Gmail"
          className="size-6 object-contain transition-transform group-hover:scale-105"
        />
      </a>

      {social.facebook && (
        <a
          href={social.facebook}
          target="_blank"
          rel="noreferrer"
          aria-label="Facebook"
          title="Facebook Page"
          className="flex size-10 items-center justify-center rounded-2xl border border-border/80 bg-card/80 text-muted-foreground transition-all hover:scale-110 hover:border-blue-500/60 hover:text-blue-600"
        >
          <Facebook className="size-5" />
        </a>
      )}
      {social.x && (
        <a
          href={social.x}
          target="_blank"
          rel="noreferrer"
          aria-label="X (Twitter)"
          title="X (Twitter)"
          className="flex size-10 items-center justify-center rounded-2xl border border-border/80 bg-card/80 text-muted-foreground transition-all hover:scale-110 hover:border-foreground/60 hover:text-foreground"
        >
          <XIcon className="size-4.5" />
        </a>
      )}
    </div>
  );

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
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 items-start">
            
            {/* 1. Brand Bio: Hidden on mobile (<640px), visible on tablet & desktop */}
            <div className="hidden sm:block">
              <p className="font-nimbus text-2xl font-bold text-cocoa">Ani Bakes<span className="text-berry">.</span></p>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                A small-batch neighbourhood bakery. Everything is baked the morning of your slot.
              </p>
              
              {/* Social Links (Desktop) */}
              {showSocial && <div className="mt-4">{socialLinksRow}</div>}
            </div>

            {/* 2. Browse Links: Desktop only */}
            <div className="hidden lg:block text-sm">
              <p className="font-semibold">Browse</p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li><Link to="/shop" className="hover:text-foreground">All bakes</Link></li>
                <li><Link to="/offers" className="hover:text-foreground">Offers</Link></li>
                <li><Link to="/cart" className="hover:text-foreground">Cart</Link></li>
              </ul>
            </div>

            {/* 3. How Ordering Works: Desktop only */}
            <div className="hidden lg:block text-sm">
              <p className="font-semibold">How ordering works</p>
              <p className="mt-3 text-muted-foreground">
                Pick a next-day slot, pay instantly to secure your bake queue, and our head baker prepares your bakes fresh.
              </p>
            </div>

            {/* 4. Newsletter: Shown on all devices */}
            <div className="text-sm text-center sm:text-left mx-auto sm:mx-0 max-w-md w-full">
              {/* Single sentence for mobile */}
              <p className="text-xs font-semibold text-cocoa sm:hidden">
                Join our newsletter for fresh bake specials & offers
              </p>

              {/* Standard 2-line layout for tablet and desktop */}
              <p className="hidden sm:block font-semibold text-cocoa">Fresh bakes newsletter</p>
              <p className="hidden sm:block mt-1.5 text-xs text-muted-foreground">
                New bakes, seasonal specials and offers — about once a month.
              </p>

              <div className="mt-2.5 sm:mt-3 flex justify-center sm:justify-start">
                <NewsletterSignup />
              </div>

              {/* Social Links (Mobile) */}
              {showSocial && (
                <div className="mt-5 flex justify-center sm:hidden">
                  {socialLinksRow}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Trademark / Copyright Bar */}
        <div className="border-t border-border/60 py-4 px-4">
          <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} <span className="font-nimbus font-bold text-cocoa text-sm">Ani Bakes</span> Bakery</span>
            <span className="flex items-center gap-1.5">
              Baked with <Heart className="size-3 text-berry animate-pulse" /> in Pondicherry
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}