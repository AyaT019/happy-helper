import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "@/store/StoreContext";
import * as XLSX from "xlsx";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? "";

const AdminPage = () => {
  const store = useAppStore();
  const { db, addSticker, updateSticker, deleteSticker, addCategory, deleteCategory, markOrderDone, deleteOrder, deleteComment, addPack, updatePack, deletePack } = store;

  const [loggedIn, setLoggedIn] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [tab, setTab] = useState<"stickers" | "orders" | "categories" | "packs">("stickers");

  // Sticker form
  const [editId, setEditId] = useState<number | null>(null);
  const [sName, setSName] = useState("");
  const [sPrice, setSPrice] = useState("");
  const [sCat, setSCat] = useState("");
  const [imgBase64, setImgBase64] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const excelRef = useRef<HTMLInputElement>(null);
  const [newCat, setNewCat] = useState("");
  const [importMessage, setImportMessage] = useState("");

  // Pack form
  const [packEditId, setPackEditId] = useState<number | null>(null);
  const [pName, setPName] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pEmoji, setPEmoji] = useState("");
  const [pImg, setPImg] = useState("");
  const [pStickerIds, setPStickerIds] = useState<number[]>([]);
  const [pVisible, setPVisible] = useState(true);
  const [pIsHero, setPIsHero] = useState(false);
  const packFileRef = useRef<HTMLInputElement>(null);

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

  const handlePackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPImg(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      if (!rows.length) { setImportMessage("No rows found."); return; }
      const getField = (row: Record<string, unknown>, keys: string[]) => {
        for (const key of keys) {
          if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") return String(row[key]).trim();
        }
        return "";
      };
      let imported = 0, skipped = 0;
      rows.forEach((row) => {
        const name = getField(row, ["name", "Name", "product", "Product"]);
        const priceText = getField(row, ["price", "Price"]);
        const category = getField(row, ["category", "Category"]) || "General";
        const emoji = getField(row, ["emoji", "Emoji"]) || "🌸";
        const img = getField(row, ["img", "image", "imageUrl", "Image", "ImageUrl"]);
        const badge = getField(row, ["badge", "Badge"]);
        const price = Number(priceText);
        if (!name || Number.isNaN(price)) { skipped += 1; return; }
        addSticker({ name, price, category, emoji, img, badge });
        imported += 1;
      });
      setImportMessage(`Imported ${imported} product(s). Skipped ${skipped} invalid row(s).`);
    } catch {
      setImportMessage("Failed to import file.");
    } finally {
      e.target.value = "";
    }
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

  const resetPackForm = () => {
    setPackEditId(null); setPName(""); setPDesc(""); setPPrice(""); setPEmoji(""); setPImg(""); setPStickerIds([]); setPVisible(true); setPIsHero(false);
    if (packFileRef.current) packFileRef.current.value = "";
  };

  const handlePackSave = () => {
    const name = pName.trim();
    const price = parseFloat(pPrice);
    if (!name || isNaN(price)) { alert("Please fill in name and price."); return; }
    const data = { name, description: pDesc.trim(), price, emoji: pEmoji || "📦", img: pImg, stickerIds: pStickerIds, visible: pVisible, isHero: pIsHero };
    if (packEditId !== null) {
      updatePack(packEditId, data);
    } else {
      addPack(data);
    }
    resetPackForm();
  };

  const startPackEdit = (id: number) => {
    const p = db.packs.find((x) => x.id === id);
    if (!p) return;
    setPackEditId(id); setPName(p.name); setPDesc(p.description); setPPrice(String(p.price)); setPEmoji(p.emoji); setPImg(p.img); setPStickerIds([...p.stickerIds]); setPVisible(p.visible); setPIsHero(p.isHero);
  };

  const togglePackSticker = (sid: number) => {
    setPStickerIds((prev) => prev.includes(sid) ? prev.filter((id) => id !== sid) : [...prev, sid]);
  };

  const totalOrders = db.orders.length;
  const pendingOrders = db.orders.filter((o) => o.status === "pending").length;
  const revenue = db.orders.filter((o) => o.status === "done").reduce((s, o) => s + o.total, 0);
  const cats = db.categories.filter((c) => c !== "All");

  const inputCls = "w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent transition-colors";

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
            className={`${inputCls} text-center tracking-widest mb-3`}
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
            {(["stickers", "orders", "categories", "packs"] as const).map((t) => (
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
                <div className="mb-3">
                  <input ref={excelRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelImport} />
                  <button onClick={() => excelRef.current?.click()} className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium">
                    Import products from Excel
                  </button>
                  <p className="text-[11px] text-muted-foreground mt-2">Expected columns: name, price, category, emoji, img, badge.</p>
                  <a href="/products-template.csv" download className="inline-block text-[11px] mt-1.5 text-primary underline underline-offset-2">
                    Download template (CSV)
                  </a>
                  {importMessage ? <p className="text-[11px] mt-1.5 text-accent">{importMessage}</p> : null}
                </div>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-[100px] bg-muted rounded-lg flex items-center justify-center text-[40px] mb-2.5 overflow-hidden cursor-pointer border border-dashed border-border"
                >
                  {imgBase64 ? <img src={imgBase64} className="w-full h-full object-cover rounded-lg" /> : <span className="text-xs text-muted-foreground">+ Add image</span>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <input value={sName} onChange={(e) => setSName(e.target.value)} placeholder="Sticker name" className={`${inputCls} mb-2.5`} />
                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                  <input value={sPrice} onChange={(e) => setSPrice(e.target.value)} type="number" placeholder="Price (TND)" step="0.1" min="0" className={inputCls} />
                  <select value={sCat} onChange={(e) => setSCat(e.target.value)} className={inputCls}>
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
                  onKeyDown={(e) => { if (e.key === "Enter" && newCat.trim()) { addCategory(newCat.trim()); setNewCat(""); } }}
                  placeholder="e.g. Vintage, Cute, Campus..."
                  className={`${inputCls} mb-2.5`}
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

          {/* Packs Tab */}
          {tab === "packs" && (
            <div>
              <div className="bg-card rounded-2xl p-4 mb-4">
                <h3 className="text-sm font-medium mb-3.5">{packEditId !== null ? "Edit pack" : "Add new pack"}</h3>

                <div
                  onClick={() => packFileRef.current?.click()}
                  className="w-full h-[100px] bg-muted rounded-lg flex items-center justify-center text-[40px] mb-2.5 overflow-hidden cursor-pointer border border-dashed border-border"
                >
                  {pImg ? <img src={pImg} className="w-full h-full object-cover rounded-lg" /> : <span className="text-xs text-muted-foreground">+ Add image</span>}
                </div>
                <input ref={packFileRef} type="file" accept="image/*" className="hidden" onChange={handlePackFileChange} />

                <input value={pName} onChange={(e) => setPName(e.target.value)} placeholder="Pack name" className={`${inputCls} mb-2.5`} />
                <textarea value={pDesc} onChange={(e) => setPDesc(e.target.value)} placeholder="Description" rows={2} className={`${inputCls} mb-2.5 resize-none`} />
                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                  <input value={pPrice} onChange={(e) => setPPrice(e.target.value)} type="number" placeholder="Price (TND)" step="0.1" min="0" className={inputCls} />
                  <input value={pEmoji} onChange={(e) => setPEmoji(e.target.value)} placeholder="Emoji icon" className={inputCls} />
                </div>

                {/* Sticker selection */}
                <div className="mb-3">
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2 font-medium">Select stickers</div>
                  <div className="max-h-[150px] overflow-y-auto space-y-1.5 border border-border rounded-lg p-2">
                    {db.stickers.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={pStickerIds.includes(s.id)}
                          onChange={() => togglePackSticker(s.id)}
                          className="rounded accent-accent"
                        />
                        <span>{s.emoji} {s.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-4 mb-3">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" checked={pVisible} onChange={(e) => setPVisible(e.target.checked)} className="rounded accent-accent" />
                    Visible on shop
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" checked={pIsHero} onChange={(e) => setPIsHero(e.target.checked)} className="rounded accent-accent" />
                    Show as hero pack
                  </label>
                </div>

                <div className="flex gap-2">
                  <button onClick={handlePackSave} className="flex-1 bg-accent text-accent-foreground py-2.5 rounded-xl text-sm font-medium">Save pack</button>
                  <button onClick={resetPackForm} className="bg-transparent border border-border text-foreground px-4 py-2.5 rounded-xl text-[13px]">Cancel</button>
                </div>
              </div>

              {/* Pack list */}
              {db.packs.map((p) => (
                <div key={p.id} className="flex items-center gap-2.5 py-2.5 border-b border-border">
                  <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center text-[22px] overflow-hidden shrink-0">
                    {p.img ? <img src={p.img} alt={p.name} className="w-full h-full object-cover" /> : p.emoji || "📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium flex items-center gap-1.5">
                      {p.name}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider ${p.isHero ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}>
                        {p.isHero ? "hero" : "mini"}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider ${p.visible ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                        {p.visible ? "live" : "hidden"}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{p.stickerIds.length} sticker{p.stickerIds.length !== 1 ? "s" : ""} · {p.price.toFixed(3)} TND</div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => startPackEdit(p.id)} className="px-2.5 py-1 text-[11px] rounded-lg bg-muted text-foreground border border-border">Edit</button>
                    <button onClick={() => updatePack(p.id, { visible: !p.visible })} className="px-2 py-1 text-[11px] rounded-lg bg-muted text-foreground border border-border">
                      {p.visible ? "Hide" : "Show"}
                    </button>
                    <button onClick={() => { if (confirm("Delete this pack?")) deletePack(p.id); }} className="px-2.5 py-1 text-[11px] rounded-lg bg-destructive/10 text-destructive border border-destructive/20">Del</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
