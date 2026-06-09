import { createContext, ReactNode, useContext, useEffect, useMemo, useReducer } from "react";
import type { Product } from "@/types/store";

type CartItem = { product: Product; qty: number };
type State = { items: CartItem[]; open: boolean };
type Action =
  | { type: "add"; product: Product }
  | { type: "remove"; id: string }
  | { type: "qty"; id: string; qty: number }
  | { type: "clear" }
  | { type: "open"; open: boolean }
  | { type: "hydrate"; items: CartItem[] };

const CART_KEY = "adhunik-mahal-cart";

const CartCtx = createContext<{
  items: CartItem[];
  open: boolean;
  add: (p: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  setOpen: (o: boolean) => void;
  count: number;
} | null>(null);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { ...state, items: action.items };
    case "add": {
      const existing = state.items.find((item) => item.product.id === action.product.id);
      const items = existing
        ? state.items.map((item) => item.product.id === action.product.id ? { ...item, qty: item.qty + 1 } : item)
        : [...state.items, { product: action.product, qty: 1 }];
      return { ...state, items, open: true };
    }
    case "remove":
      return { ...state, items: state.items.filter((item) => item.product.id !== action.id) };
    case "qty":
      return { ...state, items: state.items.map((item) => item.product.id === action.id ? { ...item, qty: Math.max(1, action.qty) } : item) };
    case "clear":
      return { ...state, items: [] };
    case "open":
      return { ...state, open: action.open };
  }
}

function readCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], open: false });

  useEffect(() => {
    dispatch({ type: "hydrate", items: readCart() });
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const value = useMemo(() => ({
    items: state.items,
    open: state.open,
    add: (product: Product) => dispatch({ type: "add", product }),
    remove: (id: string) => dispatch({ type: "remove", id }),
    setQty: (id: string, qty: number) => dispatch({ type: "qty", id, qty }),
    clear: () => dispatch({ type: "clear" }),
    setOpen: (open: boolean) => dispatch({ type: "open", open }),
    count: state.items.reduce((sum, item) => sum + item.qty, 0),
  }), [state]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => {
  const context = useContext(CartCtx);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
