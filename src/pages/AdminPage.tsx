import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "@/store/StoreContext";

const ADMIN_PASSWORD = "stickyy2026";

const AdminPage = () => {
  const store = useAppStore();
  const { db, addSticker, updateSticker, deleteSticker, addCategory, deleteCategory, markOrderDone, deleteOrder, deleteComment } = store;

  const [loggedIn, setLoggedIn] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [tab, setTab] = useState<"stickers" | "orders" | "categories" | "comments">("stickers");

  // Sticker form
  const [editId, setEditId] = useState<number | null>(null);
  const [sName, setSName] = useState("");
  const [sPrice, setSPrice] = useState("");
  const [sCat, setSCat] = useState("");
  const [imgBase64, setImgBase64] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [newCat, setNewCat] = useState("");

  const tryLogin = () => {
    if (pw === ADMIN_PASSWORD) { setLoggedIn(true); setPwError(false); }
    else setPwError(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImgBase64(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setEditId(null); setSName(""); setSPrice(""); setSCat(""); setImgBase64("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSave = () => {
    const name = sName.trim();
    const price = parseFloat(sPrice);
    if (!name || isNaN(price)) { alert("Please fill in name and price."); return; }
    if (editId !== null) {
      updateSticker(editId, { name, price, category: sCat || "General", ...(imgBase64 ? { img: imgBase64 } : {}) });
    } else {
      addSticker({ name, price, category: sCat || "General", emoji: "🌸", img: imgBase64, badge: "" });
    }
    resetForm();
  };

  const startEdit = (id: number) => {
    const s = db.stickers.find((x) => x.id === id);
    if (!s) return;
    setEditId(id); setSName(s.name); setSPrice(String(s.price)); setSCat(s.category); setImgBase64(s.img || "");
  };

  const totalOrders = db.orders.length;
  const pendingOrders = db.orders.filter((o) => o.status === "pending").length;
  const revenue = db.orders.filter((o) => o.status === "done").reduce((s, o) => s + o.total, 0);
  const cats = db.categories.filter((c) => c !== "All");

  return (
    <div>
      <nav className="flex justify-between items-center px-5 py-[18px] sticky top-0 bg-background z-50 border-b border-border">
        <Link to="/" className="text-xl text-foreground">←</Link>
        <span className="font-display text-[22px]">Admin</span>
        {loggedIn ? (
          <button onClick={() => { setLoggedIn(false); setPw(""); }} className="border border-border text-muted-foreground px-3 py-1.5 rounded-full text-[11px]">
            Logout
          </button>
        ) : <div className="w-[60px]" />}
      </nav>

      {!loggedIn ? (
        <div className="max-w-[340px] mx-auto mt-16 text-center px-5">
          <h2 className="font-display text-[30px] mb-1.5">Welcome back</h2>
          <p className="text-muted-foreground text-[13px] mb-7">Enter your admin password to continue</p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tryLogin()}
            placeholder="Password"
            className="w-full bg-accent-foreground border border-border rounded-lg px-3.5 py-2.5 text-sm text-center tracking-widest outline-none focus:border-accent mb-3"
          />
          <button onClick={tryLogin} className="bg-primary text-primary-foreground w-full py-3.5 rounded-[14px] text-sm font-medium">
            Enter dashboard →
          </button>
          {pwError && <p className="text-destructive text-xs mt-2">Incorrect password. Try again.</p>}
        </div>
      ) : (
        <div className="px-5 pb-8">
          <div className="pt-4 pb-3">
            <h2 className="font-display text-2xl">Dashboard</h2>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {[
              { label: "Total orders", value: totalOrders, color: "" },
              { label: "Pending", value: pendingOrders, color: "text-yellow-700" },
              { label: "Revenue (done)", value: revenue.toFixed(3), color: "text-accent" },
              { label: "Stickers", value: db.stickers.length, color: "" },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-xl px-4 py-3.5">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{s.label}</div>
                <div className={`font-display text-[26px] ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex border border-border rounded-xl overflow-hidden mb-5">
            {(["stickers", "orders", "categories", "comments"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-medium tracking-wider capitalize ${
                  tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Stickers Tab */}
          {tab === "stickers" && (
            <div>
              <div className="bg-card rounded-2xl p-4 mb-4">
                <h3 className="text-sm font-medium mb-3.5">{editId !== null ? "Edit sticker" : "Add new sticker"}</h3>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-[100px] bg-muted rounded-lg flex items-center justify-center text-[40px] mb-2.5 overflow-hidden cursor-pointer border border-dashed border-border"
                >
                  {imgBase64 ? <img src={imgBase64} className="w-full h-full object-cover rounded-lg" /> : <span className="text-xs text-muted-foreground">+ Add image</span>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <input value={sName} onChange={(e) => setSName(e.target.value)} placeholder="Sticker name" className="w-full bg-accent-foreground border border-border rounded-lg px-3.5 py-2.5 text-sm mb-2.5 outline-none focus:border-accent" />
                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                  <input value={sPrice} onChange={(e) => setSPrice(e.target.value)} type="number" placeholder="Price (TND)" step="0.1" min="0" className="w-full bg-accent-foreground border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent" />
                  <select value={sCat} onChange={(e) => setSCat(e.target.value)} className="w-full bg-accent-foreground border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent">
                    <option value="">Category</option>
                    {cats.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} className="flex-1 bg-accent text-accent-foreground py-2.5 rounded-xl text-sm font-medium">Save sticker</button>
                  <button onClick={resetForm} className="bg-transparent border border-border text-foreground px-4 py-2.5 rounded-xl text-[13px]">Cancel</button>
                </div>
              </div>

              {db.stickers.map((s) => (
                <div key={s.id} className="flex items-center gap-2.5 py-2.5 border-b border-border">
                  <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center text-[22px] overflow-hidden shrink-0">
                    {s.img ? <img src={s.img} alt={s.name} className="w-full h-full object-cover" /> : s.emoji || "🌸"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground">{s.category} · {s.price.toFixed(3)} TND</div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => startEdit(s.id)} className="px-2.5 py-1 text-[11px] rounded-lg bg-muted text-foreground border border-border">Edit</button>
                    <button onClick={() => { if (confirm("Delete this sticker?")) deleteSticker(s.id); }} className="px-2.5 py-1 text-[11px] rounded-lg bg-destructive/10 text-destructive border border-destructive/20">Del</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Orders Tab */}
          {tab === "orders" && (
            <div>
              {!db.orders.length ? (
                <p className="text-muted-foreground text-[13px] py-4">No orders yet.</p>
              ) : (
                db.orders.map((o) => (
                  <div key={o.id} className="bg-card rounded-[14px] p-4 mb-2.5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-xs text-muted-foreground">#{o.id} · {o.date}</div>
                        <div className="text-sm font-medium">{o.name}</div>
                        <div className="text-xs text-muted-foreground">📞 {o.phone}</div>
                      </div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-lg font-medium uppercase tracking-wider ${
                        o.status === "done" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {o.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{o.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}</div>
                    {o.notes && <div className="text-xs text-muted-foreground mt-1 italic">"{o.notes}"</div>}
                    <div className="font-display text-base text-accent mt-1.5">{o.total.toFixed(3)} TND</div>
                    <div className="flex gap-2 mt-2.5">
                      {o.status === "pending" && (
                        <button onClick={() => markOrderDone(o.id)} className="px-2.5 py-1 text-[11px] rounded-lg bg-green-100 text-green-800 border border-green-200">Mark as done</button>
                      )}
                      <button onClick={() => { if (confirm("Delete this order?")) deleteOrder(o.id); }} className="px-2.5 py-1 text-[11px] rounded-lg bg-destructive/10 text-destructive border border-destructive/20">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Categories Tab */}
          {tab === "categories" && (
            <div>
              <div className="bg-card rounded-2xl p-4 mb-5">
                <h3 className="text-sm font-medium mb-3.5">Add new category</h3>
                <input
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (newCat.trim()) { addCategory(newCat.trim()); setNewCat(""); }
                    }
                  }}
                  placeholder="e.g. Vintage, Cute, Campus..."
                  className="w-full bg-accent-foreground border border-border rounded-lg px-3.5 py-2.5 text-sm mb-2.5 outline-none focus:border-accent"
                />
                <button onClick={() => { if (newCat.trim()) { addCategory(newCat.trim()); setNewCat(""); } }} className="bg-accent text-accent-foreground w-full py-3 rounded-xl text-[13px] font-medium">
                  + Create category
                </button>
              </div>

              <div className="flex items-center gap-2.5 mb-3.5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Your categories</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {!cats.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-[32px] mb-2.5">🗂️</div>
                  <p className="text-sm font-medium mb-1">No categories yet</p>
                  <p className="text-xs">Type a name above and hit "Create category"</p>
                </div>
              ) : (
                cats.map((c) => {
                  const count = db.stickers.filter((s) => s.category === c).length;
                  return (
                    <div key={c} className="flex items-center justify-between bg-card rounded-xl px-3.5 py-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center text-base">🏷️</div>
                        <div>
                          <div className="text-sm font-medium">{c}</div>
                          <div className="text-[11px] text-muted-foreground">{count} sticker{count !== 1 ? "s" : ""}</div>
                        </div>
                      </div>
                      <button onClick={() => { if (confirm(`Remove category "${c}"?`)) deleteCategory(c); }} className="px-2.5 py-1 text-[11px] rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                        Remove
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Comments Tab */}
          {tab === "comments" && (
            <div>
              {(() => {
                const allComments = db.stickers.flatMap((s) =>
                  (s.comments || []).map((c) => ({ ...c, stickerName: s.name, stickerId: s.id }))
                );
                if (!allComments.length) return <p className="text-muted-foreground text-[13px] py-4">No comments yet.</p>;
                return allComments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5 bg-card rounded-xl px-3.5 py-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center text-[11px] font-medium shrink-0 uppercase mt-0.5">
                      {c.author[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-medium">{c.author}</span>
                        <span className="text-[10px] text-muted-foreground">{c.date}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">on <span className="font-medium text-foreground">{c.stickerName}</span></div>
                      <p className="text-xs text-foreground/80 mt-1 leading-relaxed">{c.text}</p>
                    </div>
                    <button
                      onClick={() => { if (confirm("Delete this comment?")) deleteComment(c.stickerId, c.id); }}
                      className="px-2 py-1 text-[10px] rounded-lg bg-destructive/10 text-destructive border border-destructive/20 shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
