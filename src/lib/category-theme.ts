export interface CategoryTheme {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  icon: string;
  tagline: string;
  // Visual color styles
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  textHeading: string;
  textSub: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  priceBg: string;
  priceText: string;
  buttonBg: string;
  buttonHover: string;
  buttonText: string;
  pillActiveBg: string;
  pillActiveText: string;
  pillBorder: string;
}

export const ALL_CATEGORY_THEME: CategoryTheme = {
  id: "all",
  slug: "all",
  name: "All Bakery Creations",
  shortName: "All Bakes",
  icon: "✨",
  tagline: "Freshly baked on the morning of your slot",
  cardBg: "bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F0] to-[#F5ECE0]",
  cardBorder: "border-[#2C1810]/15 hover:border-[#2C1810]/40",
  cardShadow: "shadow-[0_10px_30px_rgba(44,24,16,0.06)] hover:shadow-[0_18px_40px_rgba(44,24,16,0.12)]",
  textHeading: "text-[#2C1810]",
  textSub: "text-[#5C3218]/80",
  badgeBg: "bg-[#2C1810]/10",
  badgeText: "text-[#2C1810]",
  badgeBorder: "border-[#2C1810]/20",
  priceBg: "bg-[#2C1810] text-[#FFFDF9]",
  priceText: "text-[#2C1810]",
  buttonBg: "bg-[#2C1810]",
  buttonHover: "hover:bg-[#2C1810]/90",
  buttonText: "text-white",
  pillActiveBg: "bg-[#2C1810]",
  pillActiveText: "text-white",
  pillBorder: "border-[#2C1810]/30",
};

export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  all: ALL_CATEGORY_THEME,
  cakes: {
    id: "cakes",
    slug: "cakes",
    name: "Signature Celebration Cakes",
    shortName: "Cakes",
    icon: "🎂",
    tagline: "Handcrafted 3-tier & bento celebration masterpieces",
    cardBg: "bg-gradient-to-br from-[#FFF5F7] via-[#FFEBF0] to-[#FFDEE7]",
    cardBorder: "border-[#F4A7B7]/60 hover:border-[#E11D48]/70",
    cardShadow: "shadow-[0_10px_30px_rgba(225,29,72,0.08)] hover:shadow-[0_18px_40px_rgba(225,29,72,0.16)]",
    textHeading: "text-[#4C0519]",
    textSub: "text-[#881337]",
    badgeBg: "bg-[#FFE4E9]",
    badgeText: "text-[#9F1239]",
    badgeBorder: "border-[#FDA4AF]",
    priceBg: "bg-[#E11D48] text-white",
    priceText: "text-[#9F1239]",
    buttonBg: "bg-[#E11D48]",
    buttonHover: "hover:bg-[#BE123C]",
    buttonText: "text-white",
    pillActiveBg: "bg-[#E11D48]",
    pillActiveText: "text-white",
    pillBorder: "border-[#E11D48]",
  },
  breads: {
    id: "breads",
    slug: "breads",
    name: "Wild Sourdough & Loaves",
    shortName: "Breads & Loaves",
    icon: "🥖",
    tagline: "36-hour cold fermented sourdoughs with stone-milled grains",
    cardBg: "bg-gradient-to-br from-[#FFFDF5] via-[#FFF8E6] to-[#FDF0D0]",
    cardBorder: "border-[#F3D188]/60 hover:border-[#D97706]/70",
    cardShadow: "shadow-[0_10px_30px_rgba(217,119,6,0.08)] hover:shadow-[0_18px_40px_rgba(217,119,6,0.16)]",
    textHeading: "text-[#451A03]",
    textSub: "text-[#78350F]",
    badgeBg: "bg-[#FEF3C7]",
    badgeText: "text-[#92400E]",
    badgeBorder: "border-[#FCD34D]",
    priceBg: "bg-[#D97706] text-white",
    priceText: "text-[#92400E]",
    buttonBg: "bg-[#D97706]",
    buttonHover: "hover:bg-[#B45309]",
    buttonText: "text-white",
    pillActiveBg: "bg-[#D97706]",
    pillActiveText: "text-white",
    pillBorder: "border-[#D97706]",
  },
  pastries: {
    id: "pastries",
    slug: "pastries",
    name: "French Lamination & Pastries",
    shortName: "Pastries & Donuts",
    icon: "🥐",
    tagline: "84% French butter croissants, danishes & brioche donuts",
    cardBg: "bg-gradient-to-br from-[#F5FCF7] via-[#EAF8EE] to-[#DCF3E3]",
    cardBorder: "border-[#86EFAC]/60 hover:border-[#16A34A]/70",
    cardShadow: "shadow-[0_10px_30px_rgba(22,163,74,0.08)] hover:shadow-[0_18px_40px_rgba(22,163,74,0.16)]",
    textHeading: "text-[#052E16]",
    textSub: "text-[#14532D]",
    badgeBg: "bg-[#DCFCE7]",
    badgeText: "text-[#15803D]",
    badgeBorder: "border-[#86EFAC]",
    priceBg: "bg-[#16A34A] text-white",
    priceText: "text-[#15803D]",
    buttonBg: "bg-[#16A34A]",
    buttonHover: "hover:bg-[#15803D]",
    buttonText: "text-white",
    pillActiveBg: "bg-[#16A34A]",
    pillActiveText: "text-white",
    pillBorder: "border-[#16A34A]",
  },
  "cookies-brownies": {
    id: "cookies-brownies",
    slug: "cookies-brownies",
    name: "Artisan Brownies & Cookies",
    shortName: "Cookies & Brownies",
    icon: "🍪",
    tagline: "Fudge couverture brownies, sea salt crinkle cookies & cupcakes",
    cardBg: "bg-gradient-to-br from-[#FDF7F2] via-[#F8EDE3] to-[#F1DFC8]",
    cardBorder: "border-[#E8BC96]/60 hover:border-[#B45309]/70",
    cardShadow: "shadow-[0_10px_30px_rgba(180,83,9,0.08)] hover:shadow-[0_18px_40px_rgba(180,83,9,0.16)]",
    textHeading: "text-[#381E0D]",
    textSub: "text-[#5C3218]",
    badgeBg: "bg-[#FFEDD5]",
    badgeText: "text-[#9A3412]",
    badgeBorder: "border-[#FDBA74]",
    priceBg: "bg-[#B45309] text-white",
    priceText: "text-[#9A3412]",
    buttonBg: "bg-[#B45309]",
    buttonHover: "hover:bg-[#92400E]",
    buttonText: "text-white",
    pillActiveBg: "bg-[#B45309]",
    pillActiveText: "text-white",
    pillBorder: "border-[#B45309]",
  },
  cheesecakes: {
    id: "cheesecakes",
    slug: "cheesecakes",
    name: "Artisan Cheesecakes",
    shortName: "Cheesecakes",
    icon: "🥭",
    tagline: "Velvety cold-set Philadelphia cream cheese & fruit glazes",
    cardBg: "bg-gradient-to-br from-[#FFFDF0] via-[#FFFBE0] to-[#FFF5C2]",
    cardBorder: "border-[#FDE047]/60 hover:border-[#CA8A04]/70",
    cardShadow: "shadow-[0_10px_30px_rgba(202,138,4,0.08)] hover:shadow-[0_18px_40px_rgba(202,138,4,0.16)]",
    textHeading: "text-[#422006]",
    textSub: "text-[#713F12]",
    badgeBg: "bg-[#FEF9C3]",
    badgeText: "text-[#854D0E]",
    badgeBorder: "border-[#FDE047]",
    priceBg: "bg-[#CA8A04] text-white",
    priceText: "text-[#854D0E]",
    buttonBg: "bg-[#CA8A04]",
    buttonHover: "hover:bg-[#A16207]",
    buttonText: "text-white",
    pillActiveBg: "bg-[#CA8A04]",
    pillActiveText: "text-white",
    pillBorder: "border-[#CA8A04]",
  },
};

export function getCategoryTheme(slug: string | null | undefined): CategoryTheme {
  if (!slug || !CATEGORY_THEMES[slug]) {
    return ALL_CATEGORY_THEME;
  }
  return CATEGORY_THEMES[slug] ?? ALL_CATEGORY_THEME;
}
