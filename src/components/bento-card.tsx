import { useState, type ReactNode, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  expandable?: boolean;
  expandedContent?: ReactNode;
  initialExpanded?: boolean;
}

export function BentoCard({
  children,
  className,
  expandable = true,
  expandedContent,
  initialExpanded = false,
}: BentoCardProps) {
  const [expanded, setExpanded] = useState(initialExpanded);

  const handleToggle = () => {
    if (expandable) setExpanded((prev) => !prev);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!expandable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setExpanded((prev) => !prev);
    }
  };

  return (
    <div
      className={cn(
        "bento-shine group relative h-full overflow-hidden rounded-[2rem] transition-all duration-500 ease-out will-change-transform",
        "hover:-translate-y-2 hover:scale-[1.02] hover:shadow-lift hover:ring-2 hover:ring-berry/20",
        "focus:ring-2 focus:ring-berry/30 focus:outline-none",
        expanded && "-translate-y-2 scale-[1.02] shadow-lift ring-2 ring-berry/20",
        className,
      )}
      onClick={handleToggle}
      role={expandable ? "button" : undefined}
      tabIndex={expandable ? 0 : undefined}
      onKeyDown={handleKeyDown}
      aria-expanded={expandable ? expanded : undefined}
    >
      <div className="h-full">{children}</div>
      {expandable && expandedContent && (
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 max-h-full overflow-y-auto transition-all duration-500 ease-out",
            expanded ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
          )}
        >
          <div className="border-t border-border/40 bg-background/85 p-6 backdrop-blur-md">
            {expandedContent}
          </div>
        </div>
      )}
    </div>
  );
}
