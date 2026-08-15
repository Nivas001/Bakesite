import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-center"
      toastOptions={{
        className:
          "!w-auto !max-w-fit mx-auto !rounded-full !px-4 !py-2 sm:!px-5 sm:!py-2.5 !bg-card/85 !backdrop-blur-2xl !border !border-border/80 !shadow-lift !text-cocoa !font-sans !text-xs !font-semibold !text-center !inline-flex !items-center !justify-center gap-2",
        classNames: {
          toast:
            "group toast !w-auto !max-w-fit mx-auto !rounded-full !px-4 !py-2 sm:!px-5 sm:!py-2.5 !bg-card/85 !backdrop-blur-2xl !border !border-border/80 !shadow-lift !text-cocoa !font-sans !text-xs !font-semibold !text-center !inline-flex !items-center !justify-center gap-2",
          title: "!font-sans !text-xs !font-bold !text-cocoa !text-center",
          description: "!font-sans !text-[11px] !text-muted-foreground !text-center",
          actionButton:
            "!font-sans group-[.toast]:bg-berry group-[.toast]:text-berry-foreground rounded-full text-xs font-semibold px-3 py-1 hover:bg-berry/90 transition-all",
          cancelButton:
            "!font-sans group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground rounded-full text-xs px-3 py-1",
          success: "!border-berry/40 !text-cocoa",
          info: "!border-border/80 !text-cocoa",
          error: "!border-destructive/40 !text-destructive",
          warning: "!border-accent !text-cocoa",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
