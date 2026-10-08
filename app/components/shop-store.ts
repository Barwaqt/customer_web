"use client";

import { useSyncExternalStore } from "react";
import data from "../shop-data.json";

type Cart = Record<string, number>;
type State = { cart: Cart; saved: string[] };
type Update<T> = T | ((previous: T) => T);
const empty: State = { cart: {}, saved: [] };
const key = "barwaqt-shop-v1";
let current: State = empty;
let lastRaw: string | null | undefined;
const listeners = new Set<() => void>();
const ids = new Set(data.products.map(p => p.id));
function snapshot(): State {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(key);
    if (raw === lastRaw) return current;
    lastRaw = raw;
    if (!raw) { current = empty; return current; }
    const parsed = JSON.parse(raw);
    const cart: Cart = {};
    for (const [id, qty] of Object.entries(parsed.cart || {})) {
      if (ids.has(id) && typeof qty === "number" && Number.isInteger(qty) && qty > 0) cart[id] = Math.min(qty, 99);
    }
    current = { cart, saved: Array.isArray(parsed.saved) ? parsed.saved.filter((id: unknown) => typeof id === "string" && ids.has(id)) : [] };
  } catch { /* Keep the in-memory cart when browser storage is unavailable. */ }
  return current;
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => { listeners.delete(listener); window.removeEventListener("storage", listener); };
}
function update(field: "cart" | "saved", value: Update<Cart> | Update<string[]>) {
  const previous = snapshot();
  const next = typeof value === "function" ? (value as (p: Cart | string[]) => Cart | string[])(previous[field]) : value;
  current = { ...previous, [field]: next };
  if (field === "cart") current.cart = Object.fromEntries(Object.entries(current.cart).filter(([id, qty]) => ids.has(id) && qty > 0).map(([id, qty]) => [id, Math.min(99, Math.floor(qty))]));
  try { lastRaw = JSON.stringify(current); localStorage.setItem(key, lastRaw); } catch { /* Session-only fallback. */ }
  listeners.forEach(listener => listener());
}
export function useShop() {
  const state = useSyncExternalStore(subscribe, snapshot, () => empty);
  return { ...state, setCart: (value: Update<Cart>) => update("cart", value), setSaved: (value: Update<string[]>) => update("saved", value) };
}
