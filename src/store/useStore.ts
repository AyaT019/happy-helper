import { useState, useCallback, useEffect } from "react";

export type ReactionType = "love" | "haha" | "like";

export interface Comment {
  id: number;
  author: string;
  text: string;
  date: string;
}

export interface Sticker {
  id: number;
  name: string;
  price: number;
  category: string;
  emoji: string;
  img: string;
  badge: string;
  reactions?: Record<ReactionType, number>;
  comments?: Comment[];
}

export interface CartItem extends Sticker {
  qty: number;
}

export interface Pack {
  id: number;
  name: string;
  description: string;
  price: number;
  emoji: string;
  img: string;
  stickerIds: number[];
  visible: boolean;
  isHero: boolean;
  reactions?: Record<ReactionType, number>;
  comments?: Comment[];
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
  packs: Pack[];
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
  packs: [
    { id: 101, name: "Dreamy Starter Pack", description: "Begin your sticker journey with our most-loved dreamy designs.", price: 3.5, emoji: "✨", img: "", stickerIds: [1, 5], visible: true, isHero: true },
    { id: 102, name: "Nature Pack", description: "Fresh greens and natural vibes.", price: 2.5, emoji: "🌿", img: "", stickerIds: [2], visible: true, isHero: false },
    { id: 103, name: "Dark Mood Pack", description: "For the bold and moody aesthetic.", price: 3.0, emoji: "🦋", img: "", stickerIds: [6], visible: true, isHero: false },
  ],
  nextId: 200,
};

function loadData(): DB {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const parsed = JSON.parse(s);
      if (!parsed.nextId) parsed.nextId = 200;
      if (!parsed.packs) parsed.packs = defaultDB.packs;
      // Migrate older packs that may be missing the isHero field
      parsed.packs = parsed.packs.map((p: Pack) => ({ isHero: false, ...p }));
      return parsed;
    }
  } catch {}
  return { ...defaultDB, stickers: [...defaultDB.stickers], categories: [...defaultDB.categories], orders: [], packs: [...defaultDB.packs] };
}

const USER_KEY = "stickyy_user";

export function useStore() {
  const [db, setDb] = useState<DB>(loadData);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    try { return localStorage.getItem(USER_KEY); } catch { return null; }
  });

  const login = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCurrentUser(trimmed);
    localStorage.setItem(USER_KEY, trimmed);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(USER_KEY);
  }, []);

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

  const addPackToCart = useCallback((packId: number) => {
    const pack = db.packs.find((p) => p.id === packId);
    if (!pack || !pack.stickerIds.length) return;
    setCart((prev) => {
      let cart = [...prev];
      for (const sid of pack.stickerIds) {
        const sticker = db.stickers.find((s) => s.id === sid);
        if (!sticker) continue;
        const existing = cart.find((c) => c.id === sid);
        if (existing) {
          cart = cart.map((c) => (c.id === sid ? { ...c, qty: c.qty + 1 } : c));
        } else {
          cart = [...cart, { ...sticker, qty: 1 }];
        }
      }
      return cart;
    });
  }, [db.packs, db.stickers]);

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

  const addReaction = useCallback((stickerId: number, type: ReactionType) => {
    setDb((prev) => ({
      ...prev,
      stickers: prev.stickers.map((s) => {
        if (s.id !== stickerId) return s;
        const reactions = s.reactions || { love: 0, haha: 0, like: 0 };
        return { ...s, reactions: { ...reactions, [type]: reactions[type] + 1 } };
      }),
    }));
  }, []);

  const addComment = useCallback((stickerId: number, author: string, text: string) => {
    setDb((prev) => ({
      ...prev,
      stickers: prev.stickers.map((s) => {
        if (s.id !== stickerId) return s;
        const comments = s.comments || [];
        return {
          ...s,
          comments: [...comments, { id: Date.now(), author, text, date: new Date().toLocaleDateString("en-GB") }],
        };
      }),
    }));
  }, []);

  const deleteComment = useCallback((stickerId: number, commentId: number) => {
    setDb((prev) => ({
      ...prev,
      stickers: prev.stickers.map((s) => {
        if (s.id !== stickerId) return s;
        return { ...s, comments: (s.comments || []).filter((c) => c.id !== commentId) };
      }),
    }));
  }, []);

  const editComment = useCallback((stickerId: number, commentId: number, newText: string) => {
    setDb((prev) => ({
      ...prev,
      stickers: prev.stickers.map((s) => {
        if (s.id !== stickerId) return s;
        return {
          ...s,
          comments: (s.comments || []).map((c) =>
            c.id === commentId ? { ...c, text: newText } : c
          ),
        };
      }),
    }));
  }, []);

  // Pack CRUD
  const addPack = useCallback((pack: Omit<Pack, "id">) => {
    setDb((prev) => ({
      ...prev,
      packs: [...prev.packs, { ...pack, id: prev.nextId }],
      nextId: prev.nextId + 1,
    }));
  }, []);

  const updatePack = useCallback((id: number, updates: Partial<Pack>) => {
    setDb((prev) => ({
      ...prev,
      packs: prev.packs.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const deletePack = useCallback((id: number) => {
    setDb((prev) => ({ ...prev, packs: prev.packs.filter((p) => p.id !== id) }));
  }, []);

  return {
    db, cart, cartTotal, cartCount,
    currentUser, login, logout,
    addToCart, addPackToCart, changeQty, removeFromCart,
    submitOrder,
    addSticker, updateSticker, deleteSticker,
    addCategory, deleteCategory,
    markOrderDone, deleteOrder,
    addReaction, addComment, deleteComment, editComment,
    addPack, updatePack, deletePack,
  };
}
