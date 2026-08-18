import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  unitPrice: number;
  basePrice: number;
  imageUrl: string | null;
  quantity: number;
  variantLabel?: string | null;
  variantWeightGrams?: number | null;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  discountTotal: number;
  total: number;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number, variantLabel?: string | null) => void;
  remove: (productId: string, variantLabel?: string | null) => void;
  clear: () => void;
}

const STORAGE_KEY = "sweet-crumb-cart";
const CartContext = createContext<CartContextValue | null>(null);

function getLineKey(productId: string, variantLabel?: string | null) {
  return variantLabel ? `${productId}__${variantLabel}` : productId;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore malformed cart */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable */
    }
  }, [lines]);

  const add = useCallback((line: Omit<CartLine, "quantity">, quantity = 1) => {
    setLines((prev) => {
      const key = getLineKey(line.productId, line.variantLabel);
      const existing = prev.find((l) => getLineKey(l.productId, l.variantLabel) === key);
      if (existing) {
        return prev.map((l) =>
          getLineKey(l.productId, l.variantLabel) === key ? { ...l, quantity: l.quantity + quantity } : l,
        );
      }
      return [...prev, { ...line, quantity }];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number, variantLabel?: string | null) => {
    setLines((prev) => {
      const key = getLineKey(productId, variantLabel);
      if (quantity <= 0) {
        return prev.filter((l) => getLineKey(l.productId, l.variantLabel) !== key);
      }
      return prev.map((l) => (getLineKey(l.productId, l.variantLabel) === key ? { ...l, quantity } : l));
    });
  }, []);

  const remove = useCallback((productId: string, variantLabel?: string | null) => {
    const key = getLineKey(productId, variantLabel);
    setLines((prev) => prev.filter((l) => getLineKey(l.productId, l.variantLabel) !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = lines.reduce((sum, l) => sum + l.basePrice * l.quantity, 0);
    const total = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    return {
      lines,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal,
      discountTotal: Math.round((subtotal - total) * 100) / 100,
      total,
      add,
      setQuantity,
      remove,
      clear,
    };
  }, [lines, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}