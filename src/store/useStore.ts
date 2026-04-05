import { useState, useCallback, useEffect } from "react";

export type ReactionType = "love" | "haha" | "like";

export interface Comment {
  id: string; // Mapping _id to id
  author: string;
  text: string;
  date: string;
}

export interface Sticker {
  id: string;
  name: string;
  price: number;
  category: string;
  categories: string[];
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
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  img: string;
  stickerIds: string[];
  visible: boolean;
  isHero: boolean;
  reactions?: Record<ReactionType, number>;
  comments?: Comment[];
}

export interface Order {
  id: string;
  name: string;
  phone: string;
  notes: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: "pending" | "done";
  date: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: "admin" | "user";
}

interface DB {
  stickers: Sticker[];
  categories: string[];
  orders: Order[];
  packs: Pack[];
}

const defaultDB: DB = {
  stickers: [],
  categories: [],
  orders: [],
  packs: [],
};

const USER_KEY = "stickyy_user_data";
const TOKEN_KEY = "stickyy_token";

const getHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

const mapId = (arr: any[]) => arr.map(item => ({
  ...item,
  id: item._id,
  categories: item.categories?.length ? item.categories : (item.category ? [item.category] : []),
  comments: item.comments ? item.comments.map((c: any) => ({...c, id: c._id})) : []
}));

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });

export function useStore() {
  const [db, setDb] = useState<DB>(defaultDB);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try { 
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const fetchData = useCallback(async () => {
    try {
      const role = currentUser?.role;
      const [stRes, paRes, caRes, orRes] = await Promise.all([
        fetch("/api/stickers").then(r => r.json()),
        fetch("/api/packs").then(r => r.json()),
        fetch("/api/categories").then(r => r.json()),
        role === "admin" ? fetch("/api/orders", { headers: getHeaders() }).then(r => r.json()).catch(() => []) : Promise.resolve([])
      ]);
      setDb({
        stickers: mapId(Array.isArray(stRes) ? stRes : []),
        packs: mapId(Array.isArray(paRes) ? paRes : []),
        categories: Array.isArray(caRes) ? caRes.map((c: any) => c.name) : [],
        orders: mapId(Array.isArray(orRes) ? orRes : []),
      });
    } catch (e) {
      console.error("Failed to load DB state", e);
    }
  }, [currentUser?.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auth Methods
  const loginReq = useCallback(async (phone: string, password: string): Promise<boolean> => {
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password })
      });
      if (r.ok) {
        const data = await r.json();
        setCurrentUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        localStorage.setItem(TOKEN_KEY, data.token);
        return true;
      }
      return false;
    } catch (e) { console.error(e); return false; }
  }, []);

  const registerReq = useCallback(async (phone: string, password: string, name: string): Promise<boolean> => {
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password, name })
      });
      if (r.ok) {
        const data = await r.json();
        setCurrentUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        localStorage.setItem(TOKEN_KEY, data.token);
        return true;
      }
      return false;
    } catch (e) { console.error(e); return false; }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  // Upload Method
  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    if (!file.type?.startsWith("image/")) return null;

    const formData = new FormData();
    formData.append("image", file);
    try {
      const r = await fetch("/api/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem(TOKEN_KEY)}` },
        body: formData
      });
      if (r.ok) {
        const data = await r.json();
        return data.url ?? null;
      }
      // Log the actual server error for debugging
      const errBody = await r.json().catch(() => ({}));
      console.error(`[uploadImage] Server error ${r.status}:`, errBody);
      return null;
    } catch (e) {
      console.error("[uploadImage] Network or unexpected error:", e);
      return null;
    }
  }, []);

  const addToCart = useCallback((id: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (existing) return prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c));
      const sticker = db.stickers.find((s) => s.id === id);
      if (!sticker) return prev;
      return [...prev, { ...sticker, qty: 1 }];
    });
  }, [db.stickers]);

  const addPackToCart = useCallback((packId: string) => {
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

  const changeQty = useCallback((id: string, delta: number) => {
    setCart((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c));
      return updated.filter((c) => c.qty > 0);
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const submitOrder = useCallback(async (name: string, phone: string, notes: string) => {
    const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const orderData = {
      name, phone, notes,
      items: cart.map((c) => ({ name: c.name, qty: c.qty, price: c.price })),
      total,
    };
    try {
      const r = await fetch("/api/orders", {
        method: "POST", headers: getHeaders(), body: JSON.stringify(orderData)
      });
      if (r.ok) {
        if (currentUser?.role === "admin") await fetchData();
        setCart([]);
      }
    } catch(e) { console.error(e) }
  }, [cart, currentUser, fetchData]);

  const addSticker = useCallback(async (sticker: Omit<Sticker, "id">) => {
    try {
      const r = await fetch("/api/stickers", {
        method: "POST", headers: getHeaders(), body: JSON.stringify(sticker)
      });
      if (r.ok) await fetchData();
    } catch(e) { console.error(e) }
  }, [fetchData]);

  const updateSticker = useCallback(async (id: string, updates: Partial<Sticker>) => {
    try {
      const r = await fetch(`/api/stickers/${id}`, {
        method: "PUT", headers: getHeaders(), body: JSON.stringify(updates)
      });
      if (r.ok) await fetchData();
    } catch(e) { console.error(e) }
  }, [fetchData]);

  const deleteSticker = useCallback(async (id: string) => {
    try {
      await fetch(`/api/stickers/${id}`, { method: "DELETE", headers: getHeaders() });
      await fetchData();
    } catch(e) { console.error(e) }
  }, [fetchData]);

  const addCategory = useCallback(async (name: string) => {
    try {
      const r = await fetch("/api/categories", {
        method: "POST", headers: getHeaders(), body: JSON.stringify({ name })
      });
      if (r.ok) await fetchData();
    } catch(e) { console.error(e) }
  }, [fetchData]);

  const deleteCategory = useCallback(async (name: string) => {
    try {
      await fetch(`/api/categories/${encodeURIComponent(name)}`, { method: "DELETE", headers: getHeaders() });
      await fetchData();
    } catch(e) { console.error(e) }
  }, [fetchData]);

  const markOrderDone = useCallback(async (id: string) => {
    try {
      await fetch(`/api/orders/${id}/done`, { method: "PATCH", headers: getHeaders() });
      await fetchData();
    } catch(e) { console.error(e) }
  }, [fetchData]);

  const deleteOrder = useCallback(async (id: string) => {
    try {
      await fetch(`/api/orders/${id}`, { method: "DELETE", headers: getHeaders() });
      await fetchData();
    } catch(e) { console.error(e) }
  }, [fetchData]);

  const addReaction = useCallback(async (stickerId: string, type: ReactionType) => {
    try {
      const r = await fetch(`/api/stickers/${stickerId}/reactions`, {
        method: "POST", headers: getHeaders(), body: JSON.stringify({ type })
      });
      if (r.ok) await fetchData();
    } catch(e) { console.error(e) }
  }, [fetchData]);

  const addComment = useCallback(async (stickerId: string, author: string, text: string) => {
    try {
      const r = await fetch(`/api/stickers/${stickerId}/comments`, {
        method: "POST", headers: getHeaders(), body: JSON.stringify({ author, text })
      });
      if (r.ok) await fetchData();
    } catch(e) { console.error(e) }
  }, [fetchData]);

  const deleteComment = useCallback(async (stickerId: string, commentId: string) => {
    try {
      await fetch(`/api/stickers/${stickerId}/comments/${commentId}`, { method: "DELETE", headers: getHeaders() });
      await fetchData();
    } catch(e) { console.error(e) }
  }, [fetchData]);

  const editComment = useCallback(async (stickerId: string, commentId: string, newText: string) => {
    try {
      const r = await fetch(`/api/stickers/${stickerId}/comments/${commentId}`, {
        method: "PATCH", headers: getHeaders(), body: JSON.stringify({ text: newText })
      });
      if (r.ok) await fetchData();
    } catch(e) { console.error(e) }
  }, [fetchData]);

  const addPack = useCallback(async (pack: Omit<Pack, "id">) => {
    try {
      const r = await fetch("/api/packs", {
        method: "POST", headers: getHeaders(), body: JSON.stringify(pack)
      });
      if (r.ok) await fetchData();
    } catch(e) { console.error(e) }
  }, [fetchData]);

  const updatePack = useCallback(async (id: string, updates: Partial<Pack>) => {
    try {
      const r = await fetch(`/api/packs/${id}`, {
        method: "PUT", headers: getHeaders(), body: JSON.stringify(updates)
      });
      if (r.ok) await fetchData();
    } catch(e) { console.error(e) }
  }, [fetchData]);

  const deletePack = useCallback(async (id: string) => {
    try {
      await fetch(`/api/packs/${id}`, { method: "DELETE", headers: getHeaders() });
      await fetchData();
    } catch(e) { console.error(e) }
  }, [fetchData]);

  const addPackReaction = useCallback(async (packId: string, type: ReactionType) => {
    try {
      const r = await fetch(`/api/packs/${packId}/reactions`, {
        method: "POST", headers: getHeaders(), body: JSON.stringify({ type })
      });
      if (r.ok) await fetchData();
    } catch(e) { console.error(e) }
  }, [fetchData]);

  const addPackComment = useCallback(async (packId: string, author: string, text: string) => {
    try {
      const r = await fetch(`/api/packs/${packId}/comments`, {
        method: "POST", headers: getHeaders(), body: JSON.stringify({ author, text })
      });
      if (r.ok) await fetchData();
    } catch(e) { console.error(e) }
  }, [fetchData]);

  const deletePackComment = useCallback(async (packId: string, commentId: string) => {
    try {
      await fetch(`/api/packs/${packId}/comments/${commentId}`, { method: "DELETE", headers: getHeaders() });
      await fetchData();
    } catch(e) { console.error(e) }
  }, [fetchData]);

  const editPackComment = useCallback(async (packId: string, commentId: string, newText: string) => {
    try {
      const r = await fetch(`/api/packs/${packId}/comments/${commentId}`, {
        method: "PATCH", headers: getHeaders(), body: JSON.stringify({ text: newText })
      });
      if (r.ok) await fetchData();
    } catch(e) { console.error(e) }
  }, [fetchData]);

  return {
    db, cart, cartTotal, cartCount,
    currentUser, loginReq, registerReq, logout,
    uploadImage,
    addToCart, addPackToCart, changeQty, removeFromCart,
    submitOrder,
    addSticker, updateSticker, deleteSticker,
    addCategory, deleteCategory,
    markOrderDone, deleteOrder,
    addReaction, addComment, deleteComment, editComment,
    addPack, updatePack, deletePack,
    addPackReaction, addPackComment, deletePackComment, editPackComment,
    refreshData: fetchData
  };
}
