import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card/95 group-[.toaster]:text-cocoa group-[.toaster]:border-border/80 group-[.toaster]:shadow-lift rounded-2xl p-3 sm:p-3.5 text-xs font-semibold backdrop-blur-md border",
          title: "text-xs font-bold text-cocoa",
          description: "group-[.toast]:text-muted-foreground text-[11px] font-normal",
          actionButton:
            "group-[.toast]:bg-berry group-[.toast]:text-berry-foreground rounded-full text-xs font-semibold px-3 py-1 hover:bg-berry/90 transition-all",
          cancelButton:
            "group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground rounded-full text-xs px-3 py-1",
          success: "!border-berry/30 !bg-card/95 !text-cocoa",
          info: "!border-border/80 !bg-card/95 !text-cocoa",
          error: "!border-destructive/40 !bg-card/95 !text-destructive",
          warning: "!border-accent !bg-card/95 !text-cocoa",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
