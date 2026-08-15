import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { useFlag } from "@/lib/feature-flags";

export function ScrollToTop() {
  const enabled = useFlag("ff_scroll_to_top");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!enabled) return null;

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-4 z-50 flex size-10 items-center justify-center rounded-full bg-card/90 border border-border/80 shadow-lift backdrop-blur-md text-cocoa transition-all duration-300 hover:bg-berry hover:text-berry-foreground hover:border-berry/50 hover:scale-110 active:scale-95 cursor-pointer ${
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <ChevronUp className="size-4.5" />
    </button>
  );
}
