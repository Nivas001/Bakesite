import { useState } from "react";

export function WhatsAppFloatingButton() {
  const [showTooltip, setShowTooltip] = useState(false);

  const rawPhone =
    (typeof import.meta !== "undefined" &&
      typeof import.meta.env !== "undefined" &&
      (import.meta.env["VITE_BAKERY_WHATSAPP"] as string | undefined)) ||
    "919876543210";

  const cleanDigits = rawPhone.replace(/\D/g, "");
  const phoneWithCountry = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;

  const defaultMessage = encodeURIComponent(
    "Hi Sweet Crumb Bakery! 🍰 I'd like to ask about your fresh bakes and custom orders."
  );

  const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${defaultMessage}`;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip bubble */}
      <div
        className={`hidden sm:block rounded-2xl bg-cocoa text-background px-3.5 py-1.5 text-xs font-semibold shadow-lift transition-all duration-300 ${
          showTooltip
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 translate-x-2 pointer-events-none"
        }`}
      >
        <span>Chat on WhatsApp 👋</span>
      </div>

      {/* Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Sweet Crumb on WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95"
      >
        {/* Pulse radar wave */}
        <span className="absolute -inset-1 animate-ping rounded-full bg-[#25D366]/40 opacity-75" />

        {/* WhatsApp SVG Icon */}
        <svg
          viewBox="0 0 24 24"
          className="relative h-7 w-7 fill-current transition-transform duration-300 group-hover:rotate-6"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.971.53 1.95.811 2.796.812h.005c3.18 0 5.767-2.587 5.768-5.766 0-1.542-.6-2.991-1.69-4.081-1.09-1.09-2.54-1.69-4.083-1.691zm0-2.172c4.418 0 8 3.582 8 8 0 2.138-.838 4.148-2.359 5.669-1.52 1.52-3.53 2.359-5.641 2.361h-.006c-1.399 0-2.77-.362-3.98-1.05l-5.045 1.321 1.346-4.918c-.759-1.258-1.315-2.684-1.315-4.383 0-4.418 3.582-8 8-8z" />
          <path d="M15.42 14.535c-.21.589-1.05 1.139-1.46 1.179-.41.04-.94.06-1.52-.13-.37-.12-.86-.28-1.49-.55-2.62-1.14-4.32-3.8-4.45-3.98-.13-.17-1.06-1.41-1.06-2.69 0-1.28.67-1.91.91-2.17.24-.26.52-.33.7-.33.17 0 .35.01.5.02.16.01.38-.06.59.45.22.53.75 1.83.82 1.96.07.13.11.29.02.47-.08.18-.13.29-.26.44-.13.15-.27.33-.39.45-.13.12-.26.26-.11.52.15.26.67 1.1 1.43 1.78.98.87 1.81 1.14 2.07 1.27.26.13.41.11.56-.07.15-.17.65-.76.82-1.02.17-.26.35-.22.59-.13.24.09 1.52.72 1.78.85.26.13.43.2.5.31.06.11.06.63-.15 1.22z" />
        </svg>
      </a>
    </div>
  );
}
