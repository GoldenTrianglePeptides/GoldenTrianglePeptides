"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  variantId: string;
  productId: string;
  slug: string;
  name: string; // product name
  variantLabel: string; // e.g. "10 mg"
  priceCents: number;
  imageUrl: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
  ready: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
// v2 — schema includes variantId; legacy v1 carts (productId-only) are discarded.
const STORAGE_KEY = "gtp_cart_v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Hydrate the cart from localStorage on mount. Reading from localStorage is
  // synchronizing with an external store, so setState here is intentional.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
      // Clean up any legacy cart entry from before variants existed.
      localStorage.removeItem("gtp_cart_v1");
    } catch {
      // ignore malformed storage
    }
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist cart whenever it changes (after initial load).
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.variantId === item.variantId);
        if (existing) {
          return prev.map((i) =>
            i.variantId === item.variantId
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        }
        return [...prev, { ...item, quantity }];
      });
    },
    [],
  );

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.variantId === variantId
            ? { ...i, quantity: Math.max(0, quantity) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );
  const subtotalCents = useMemo(
    () => items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),
    [items],
  );

  const value: CartContextValue = {
    items,
    count,
    subtotalCents,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    ready,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
