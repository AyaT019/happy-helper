import { useState, useCallback, useEffect } from "react";

export type ReactionType = "love" | "haha" | "like";

export interface Comment {
  id: number;
  author: string;
  text: string;
  date: string;
  // Mongo comment id (used when backend mode is enabled)
  backendId?: string;
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
  // Mongo sticker id (used when backend mode is enabled)
  backendId?: string;
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
  // Mongo order id (used when backend mode is enabled)
  backendId?: string;
}

interface DB {
  stickers: Sticker[];
  categories: string[];
  orders: Order[];
  nextId: number;
}

const STORAGE_KEY = "stickyy_data";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
const ADMIN_PASSWORD = "stickyy2026";
type BackendMode = "unknown" | "backend" | "local";

type BackendReaction = Partial<Record<ReactionType, number>>;

interface BackendCommentDoc {
  _id: string;
  author: string;
  text: string;
  date: string;
}

interface BackendStickerDoc {
  _id: string;
  name: string;
  price: number;
  category: string;
  emoji?: string;
  img?: string;
  badge?: string;
  reactions?: BackendReaction;
  comments?: BackendCommentDoc[];
}

interface BackendCategoryDoc {
  _id: string;
  name: string;
}

interface BackendOrderItemDoc {
  name: string;
  qty: number;
  price: number;
}

interface BackendOrderDoc {
  _id: string;
  name: string;
  phone: string;
  notes?: string;
  items: BackendOrderItemDoc[];
  total: number;
  status: "pending" | "done";
  date: string;
}

type StickerUpdatable = Pick<Sticker, "name" | "price" | "category" | "emoji" | "img" | "badge">;

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

function objectIdToNumber(oid: unknown): number {
  // Convert Mongo ObjectId (or any string) into a stable-ish number for the existing UI.
  // This keeps the UI unchanged while still allowing backend lookups via `backendId`.
  const s = String(oid ?? "");
  if (!s) return Date.now();
  const tail = s.slice(-8);
  const n = parseInt(tail, 16);
  return Number.isFinite(n) ? n : Date.now();
}

function loadData(): DB {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const parsed = JSON.parse(s);
      if (!parsed.nextId) parsed.nextId = 100;
      return parsed;
    }
  } catch {
    // Ignore invalid localStorage payloads.
  }
  return { ...defaultDB, stickers: [...defaultDB.stickers], categories: [...defaultDB.categories], orders: [] };
}

const USER_KEY = "stickyy_user";

export function useStore() {
  const [db, setDb] = useState<DB>(loadData);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    try { return localStorage.getItem(USER_KEY); } catch { return null; }
  });
  const [backendMode, setBackendMode] = useState<BackendMode>("unknown");

  const apiFetch = useCallback(async <T,>(path: string, options?: RequestInit): Promise<T> => {
    const res = await fetch(`${API_BASE}${path}`, options);
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const message = data?.error || `Request failed (${res.status})`;
      throw new Error(message);
    }
    return data as T;
  }, []);

  const adminHeaders = useCallback(() => {
    return {
      "Content-Type": "application/json",
      "x-admin-password": ADMIN_PASSWORD,
    };
  }, []);

  const mapSticker = useCallback((doc: BackendStickerDoc): Sticker => {
    const backendId = String(doc?._id ?? "");
    const reactions: Record<ReactionType, number> = {
      love: Number(doc?.reactions?.love ?? 0),
      haha: Number(doc?.reactions?.haha ?? 0),
      like: Number(doc?.reactions?.like ?? 0),
    };
    return {
      id: objectIdToNumber(doc?._id),
      backendId,
      name: String(doc?.name ?? ""),
      price: Number(doc?.price ?? 0),
      category: String(doc?.category ?? "General"),
      emoji: String(doc?.emoji ?? "🌸"),
      img: String(doc?.img ?? ""),
      badge: String(doc?.badge ?? ""),
      // Always provide all keys so the UI can safely sum.
      reactions,
      comments: (doc?.comments || []).map((c: BackendCommentDoc) => ({
        id: objectIdToNumber(c?._id),
        backendId: c?._id ? String(c._id) : undefined,
        author: String(c?.author ?? ""),
        text: String(c?.text ?? ""),
        date: String(c?.date ?? ""),
      })),
    };
  }, []);

  const mapOrder = useCallback((doc: BackendOrderDoc): Order => {
    const backendId = String(doc?._id ?? "");
    return {
      id: objectIdToNumber(doc?._id),
      backendId,
      name: String(doc?.name ?? ""),
      phone: String(doc?.phone ?? ""),
      notes: String(doc?.notes ?? ""),
      items: (doc?.items || []).map((i: BackendOrderItemDoc) => ({
        name: String(i?.name ?? ""),
        qty: Number(i?.qty ?? 0),
        price: Number(i?.price ?? 0),
      })),
      total: Number(doc?.total ?? 0),
      status: (doc?.status === "done" ? "done" : "pending") as "pending" | "done",
      date: String(doc?.date ?? ""),
    };
  }, []);

  // Load backend data (stickers/categories/orders) once on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await apiFetch("/health", { method: "GET" });

        const [stickersDoc, categoriesDoc, ordersDoc] = await Promise.all([
          apiFetch<BackendStickerDoc[]>("/stickers", { method: "GET" }),
          apiFetch<BackendCategoryDoc[]>("/categories", { method: "GET" }),
          apiFetch<BackendOrderDoc[]>("/orders", { method: "GET", headers: adminHeaders() }).catch(() => [] as BackendOrderDoc[]),
        ]);

        if (cancelled) return;

        const stickers = stickersDoc.map(mapSticker);
        const backendCats = (categoriesDoc || []).map((c) => String(c?.name ?? "")).filter((n) => !!n && n !== "All");
        const orders = ordersDoc.map(mapOrder);
        const maxId = Math.max(0, ...stickers.map((s) => s.id), ...orders.map((o) => o.id));

        setDb({
          stickers,
          categories: ["All", ...backendCats],
          orders,
          nextId: maxId + 1,
        });
        setBackendMode("backend");
      } catch {
        if (!cancelled) setBackendMode("local");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiFetch, adminHeaders, mapOrder, mapSticker]);

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
    // Only persist local DB in local mode.
    if (backendMode === "local") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    }
  }, [db, backendMode]);

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
    const items = cart.map((c) => ({ name: c.name, qty: c.qty, price: c.price }));

    // Keep UX unchanged: clear cart immediately.
    setCart([]);

    const optimistic: Order = {
      id: Date.now(),
      name,
      phone,
      notes,
      items,
      total,
      status: "pending",
      date: new Date().toLocaleDateString("en-GB"),
    };

    if (backendMode !== "backend") {
      setDb((prev) => ({ ...prev, orders: [optimistic, ...prev.orders] }));
      return;
    }

    // Backend mode: create in Mongo (then replace optimistic order by re-mapping response).
    (async () => {
      try {
        const created = await apiFetch<BackendOrderDoc>("/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, notes, items, total }),
        });
        const mapped = mapOrder(created);
        setDb((prev) => ({ ...prev, orders: [mapped, ...prev.orders.filter((o) => o.id !== optimistic.id)] }));
      } catch (e) {
        // If backend fails, keep the optimistic order so the user isn't stuck.
        setDb((prev) => ({ ...prev, orders: [optimistic, ...prev.orders] }));
      }
    })();
  }, [apiFetch, backendMode, cart, mapOrder]);

  const addSticker = useCallback((sticker: Omit<Sticker, "id">) => {
    if (backendMode !== "backend") {
      setDb((prev) => ({
        ...prev,
        stickers: [...prev.stickers, { ...sticker, id: prev.nextId }],
        nextId: prev.nextId + 1,
      }));
      return;
    }

    (async () => {
      try {
        const category = sticker.category || "General";
        if (category !== "All" && !db.categories.includes(category)) {
          // Best-effort category sync so new products appear under the filter pills.
          await apiFetch("/categories", { method: "POST", headers: adminHeaders(), body: JSON.stringify({ name: category }) }).catch(() => null);
        }

        const created = await apiFetch<BackendStickerDoc>("/stickers", {
          method: "POST",
          headers: adminHeaders(),
          body: JSON.stringify(sticker),
        });
        const mapped = mapSticker(created);
        setDb((prev) => ({
          ...prev,
          stickers: [...prev.stickers, mapped],
          categories: (() => {
            if (prev.categories.includes(mapped.category)) return prev.categories;
            const withoutAll = prev.categories.filter((c) => c !== "All");
            return ["All", ...withoutAll, mapped.category];
          })(),
        }));
      } catch (e) {
        // If backend fails, fall back to local add so admin doesn't lose work.
        setDb((prev) => ({
          ...prev,
          stickers: [...prev.stickers, { ...sticker, id: prev.nextId }],
          nextId: prev.nextId + 1,
        }));
      }
    })();
  }, [adminHeaders, apiFetch, backendMode, db.categories, mapSticker]);

  const updateSticker = useCallback((id: number, updates: Partial<Sticker>) => {
    if (backendMode !== "backend") {
      setDb((prev) => ({
        ...prev,
        stickers: prev.stickers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      }));
      return;
    }

    (async () => {
      try {
        const current = db.stickers.find((s) => s.id === id);
        if (!current?.backendId) return;
        const payload: Partial<StickerUpdatable> = {};
        const keys: (keyof StickerUpdatable)[] = ["name", "price", "category", "emoji", "img", "badge"];
        for (const key of keys) {
          const v = updates[key];
          if (v !== undefined) payload[key] = v;
        }

        const updated = await apiFetch<BackendStickerDoc>(`/stickers/${current.backendId}`, {
          method: "PUT",
          headers: adminHeaders(),
          body: JSON.stringify(payload),
        });
        const mapped = mapSticker(updated);
        setDb((prev) => ({
          ...prev,
          stickers: prev.stickers.map((s) => (s.id === id ? mapped : s)),
        }));
      } catch {
        // Silent fallback to keep UI consistent.
        setDb((prev) => ({
          ...prev,
          stickers: prev.stickers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }));
      }
    })();
  }, [adminHeaders, apiFetch, backendMode, db.stickers, mapSticker]);

  const deleteSticker = useCallback((id: number) => {
    if (backendMode !== "backend") {
      setDb((prev) => ({ ...prev, stickers: prev.stickers.filter((s) => s.id !== id) }));
      return;
    }

    const current = db.stickers.find((s) => s.id === id);
    if (!current?.backendId) {
      setDb((prev) => ({ ...prev, stickers: prev.stickers.filter((s) => s.id !== id) }));
      return;
    }

    setDb((prev) => ({ ...prev, stickers: prev.stickers.filter((s) => s.id !== id) }));

    apiFetch<void>(`/stickers/${current.backendId}`, { method: "DELETE", headers: adminHeaders() }).catch(() => {
      // If delete failed, re-fetch would be ideal, but keep it simple.
    });
  }, [adminHeaders, apiFetch, backendMode, db.stickers]);

  const addCategory = useCallback((name: string) => {
    if (name === "All") return;

    if (backendMode !== "backend") {
      setDb((prev) => {
        if (prev.categories.includes(name)) return prev;
        return { ...prev, categories: [...prev.categories, name] };
      });
      return;
    }

    (async () => {
      try {
        await apiFetch<BackendCategoryDoc>("/categories", { method: "POST", headers: adminHeaders(), body: JSON.stringify({ name }) });
        setDb((prev) => {
          if (prev.categories.includes(name)) return prev;
          return { ...prev, categories: [...prev.categories, name] };
        });
      } catch {
        // Fallback to local add so admin keeps control.
        setDb((prev) => (prev.categories.includes(name) ? prev : { ...prev, categories: [...prev.categories, name] }));
      }
    })();
  }, [adminHeaders, apiFetch, backendMode]);

  const deleteCategory = useCallback((name: string) => {
    if (backendMode !== "backend") {
      setDb((prev) => ({ ...prev, categories: prev.categories.filter((c) => c !== name) }));
      return;
    }

    setDb((prev) => ({ ...prev, categories: prev.categories.filter((c) => c !== name) }));
    apiFetch<void>(`/categories/${encodeURIComponent(name)}`, { method: "DELETE", headers: adminHeaders() }).catch(() => {});
  }, [adminHeaders, apiFetch, backendMode]);

  const markOrderDone = useCallback((id: number) => {
    const current = db.orders.find((o) => o.id === id);

    if (backendMode !== "backend" || !current?.backendId) {
      setDb((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => (o.id === id ? { ...o, status: "done" as const } : o)),
      }));
      return;
    }

    setDb((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === id ? { ...o, status: "done" as const } : o)),
    }));

    apiFetch<void>(`/orders/${current.backendId}/done`, { method: "PATCH", headers: adminHeaders() }).catch(() => {});
  }, [adminHeaders, apiFetch, backendMode, db.orders]);

  const deleteOrder = useCallback((id: number) => {
    const current = db.orders.find((o) => o.id === id);

    if (backendMode !== "backend" || !current?.backendId) {
      setDb((prev) => ({ ...prev, orders: prev.orders.filter((o) => o.id !== id) }));
      return;
    }

    setDb((prev) => ({ ...prev, orders: prev.orders.filter((o) => o.id !== id) }));
    apiFetch<void>(`/orders/${current.backendId}`, { method: "DELETE", headers: adminHeaders() }).catch(() => {});
  }, [adminHeaders, apiFetch, backendMode, db.orders]);

  const addReaction = useCallback((stickerId: number, type: ReactionType) => {
    if (backendMode !== "backend") {
      setDb((prev) => ({
        ...prev,
        stickers: prev.stickers.map((s) => {
          if (s.id !== stickerId) return s;
          const reactions = s.reactions || { love: 0, haha: 0, like: 0 };
          return { ...s, reactions: { ...reactions, [type]: reactions[type] + 1 } };
        }),
      }));
      return;
    }

    const current = db.stickers.find((s) => s.id === stickerId);
    if (!current?.backendId) return;

    apiFetch<BackendStickerDoc>(`/stickers/${current.backendId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    })
      .then((updatedSticker) => {
        const mapped = mapSticker(updatedSticker);
        setDb((prev) => ({
          ...prev,
          stickers: prev.stickers.map((s) => (s.id === stickerId ? mapped : s)),
        }));
      })
      .catch(() => {});
  }, [apiFetch, backendMode, db.stickers, mapSticker]);

  const addComment = useCallback((stickerId: number, author: string, text: string) => {
    if (backendMode !== "backend") {
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
      return;
    }

    const current = db.stickers.find((s) => s.id === stickerId);
    if (!current?.backendId) return;

    apiFetch<BackendStickerDoc>(`/stickers/${current.backendId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, text }),
    })
      .then((updatedSticker) => {
        const mapped = mapSticker(updatedSticker);
        setDb((prev) => ({
          ...prev,
          stickers: prev.stickers.map((s) => (s.id === stickerId ? mapped : s)),
        }));
      })
      .catch(() => {});
  }, [apiFetch, backendMode, db.stickers, mapSticker]);

  const deleteComment = useCallback((stickerId: number, commentId: number) => {
    if (backendMode !== "backend") {
      setDb((prev) => ({
        ...prev,
        stickers: prev.stickers.map((s) => {
          if (s.id !== stickerId) return s;
          return { ...s, comments: (s.comments || []).filter((c) => c.id !== commentId) };
        }),
      }));
      return;
    }

    const current = db.stickers.find((s) => s.id === stickerId);
    const comment = current?.comments?.find((c) => c.id === commentId);
    setDb((prev) => ({
      ...prev,
      stickers: prev.stickers.map((s) => {
        if (s.id !== stickerId) return s;
        return { ...s, comments: (s.comments || []).filter((c) => c.id !== commentId) };
      }),
    }));

    if (!current?.backendId || !comment?.backendId) return;
    apiFetch<void>(
      `/stickers/${current.backendId}/comments/${comment.backendId}`,
      { method: "DELETE", headers: adminHeaders() }
    ).catch(() => {});
  }, [adminHeaders, apiFetch, backendMode, db.stickers]);

  const editComment = useCallback((stickerId: number, commentId: number, newText: string) => {
    if (backendMode !== "backend") {
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
      return;
    }

    const current = db.stickers.find((s) => s.id === stickerId);
    const comment = current?.comments?.find((c) => c.id === commentId);
    if (!current?.backendId || !comment?.backendId) return;

    // Optimistic update
    setDb((prev) => ({
      ...prev,
      stickers: prev.stickers.map((s) => {
        if (s.id !== stickerId) return s;
        return {
          ...s,
          comments: (s.comments || []).map((c) => (c.id === commentId ? { ...c, text: newText } : c)),
        };
      }),
    }));

    apiFetch<BackendStickerDoc>(`/stickers/${current.backendId}/comments/${comment.backendId}`, {
      method: "PATCH",
      headers: adminHeaders(),
      body: JSON.stringify({ text: newText }),
    })
      .then((updatedSticker) => {
        const mapped = mapSticker(updatedSticker);
        setDb((prev) => ({
          ...prev,
          stickers: prev.stickers.map((s) => (s.id === stickerId ? mapped : s)),
        }));
      })
      .catch(() => {});
  }, [adminHeaders, apiFetch, backendMode, db.stickers, mapSticker]);

  return {
    db, cart, cartTotal, cartCount,
    currentUser, login, logout,
    addToCart, changeQty, removeFromCart,
    submitOrder,
    addSticker, updateSticker, deleteSticker,
    addCategory, deleteCategory,
    markOrderDone, deleteOrder,
    addReaction, addComment, deleteComment, editComment,
  };
}
