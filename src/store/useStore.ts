import { useState, useCallback, useEffect } from "react";

export interface Sticker {
  id: number;
  name: string;
  price: number;
  category: string;
  emoji: string;
  img: string;
  badge: string;
}

export interface CartItem extends Sticker {
  qty: number;
}

export interface Order {
  id: number;
  name: string;
  phone: string;
  notes: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: "pending" | "done";
  date: string;
}

interface DB {
  stickers: Sticker[];
  categories: string[];
  orders: Order[];
  nextId: number;
}

const STORAGE_KEY = "stickyy_data";

const defaultDB: DB = {
  stickers: [
    { id: 1, name: "Lunar Glow", price: 1.5, category: "Dreamy", emoji: "🌙", img: "", badge: "New" },
    { id: 2, name: "Soft Fern", price: 1.2, category: "Nature", emoji: "🌿", img: "", badge: "" },
    { id: 3, name: "Late Latte", price: 1.2, category: "Cozy", emoji: "☕", img: "", badge: "Hot" },
    { id: 4, name: "Film Reel", price: 2.0, category: "Aesthetic", emoji: "🎞", img: "", badge: "" },
    { id: 5, name: "Moonflower", price: 1.5, category: "Dreamy", emoji: "🌸", img: "", badge: "New" },
    { id: 6, name: "Dark Wings", price: 1.8, category: "Dark", emoji: "🦋", img: "", badge: "" },
  ],
  categories: ["All", "Dreamy", "Nature", "Cozy", "Aesthetic", "Dark"],
  orders: [],
  nextId: 7,
};

function loadData(): DB {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const parsed = JSON.parse(s);
      if (!parsed.nextId) parsed.nextId = 100;
      return parsed;
    }
  } catch {}
  return { ...defaultDB, stickers: [...defaultDB.stickers], categories: [...defaultDB.categories], orders: [] };
}

export function useStore() {
  const [db, setDb] = useState<DB>(loadData);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }, [db]);

  const addToCart = useCallback((id: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (existing) return prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c));
      const sticker = db.stickers.find((s) => s.id === id);
      if (!sticker) return prev;
      return [...prev, { ...sticker, qty: 1 }];
    });
  }, [db.stickers]);

  const changeQty = useCallback((id: number, delta: number) => {
    setCart((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c));
      return updated.filter((c) => c.qty > 0);
    });
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const submitOrder = useCallback((name: string, phone: string, notes: string) => {
    const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const order: Order = {
      id: Date.now(),
      name, phone, notes,
      items: cart.map((c) => ({ name: c.name, qty: c.qty, price: c.price })),
      total,
      status: "pending",
      date: new Date().toLocaleDateString("en-GB"),
    };
    setDb((prev) => ({ ...prev, orders: [order, ...prev.orders] }));
    setCart([]);
  }, [cart]);

  const addSticker = useCallback((sticker: Omit<Sticker, "id">) => {
    setDb((prev) => ({
      ...prev,
      stickers: [...prev.stickers, { ...sticker, id: prev.nextId }],
      nextId: prev.nextId + 1,
    }));
  }, []);

  const updateSticker = useCallback((id: number, updates: Partial<Sticker>) => {
    setDb((prev) => ({
      ...prev,
      stickers: prev.stickers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  const deleteSticker = useCallback((id: number) => {
    setDb((prev) => ({ ...prev, stickers: prev.stickers.filter((s) => s.id !== id) }));
  }, []);

  const addCategory = useCallback((name: string) => {
    setDb((prev) => {
      if (prev.categories.includes(name)) return prev;
      return { ...prev, categories: [...prev.categories, name] };
    });
  }, []);

  const deleteCategory = useCallback((name: string) => {
    setDb((prev) => ({ ...prev, categories: prev.categories.filter((c) => c !== name) }));
  }, []);

  const markOrderDone = useCallback((id: number) => {
    setDb((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === id ? { ...o, status: "done" as const } : o)),
    }));
  }, []);

  const deleteOrder = useCallback((id: number) => {
    setDb((prev) => ({ ...prev, orders: prev.orders.filter((o) => o.id !== id) }));
  }, []);

  return {
    db, cart, cartTotal, cartCount,
    addToCart, changeQty, removeFromCart,
    submitOrder,
    addSticker, updateSticker, deleteSticker,
    addCategory, deleteCategory,
    markOrderDone, deleteOrder,
  };
}
