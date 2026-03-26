import { useState } from "react";
import { Search } from "lucide-react";
import { useAppStore } from "@/store/StoreContext";

const StickerGrid = () => {
  const { db, addToCart } = useAppStore();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const cats = ["All", ...db.categories.filter((c) => c !== "All")];
  const byCategory = filter === "All" ? db.stickers : db.stickers.filter((s) => s.category === filter);
  const filtered = search.trim()
    ? byCategory.filter((s) => s.name.toLowerCase().includes(search.trim().toLowerCase()))
    : byCategory;

  return (
    <div>
      {/* Section separator */}
      <div className="flex items-center gap-2.5 px-5 pt-[22px] pb-3.5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground whitespace-nowrap">
          Browse collection
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Search bar */}
      <div className="px-5 pb-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stickers..."
            className="w-full bg-card border border-border rounded-full pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 px-5 pb-[18px] overflow-x-auto scrollbar-hide">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs border transition-colors ${
              c === filter
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-transparent border-border text-muted-foreground hover:border-foreground/30"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 px-5">
        {!filtered.length ? (
          <div className="col-span-2 text-center py-10 text-muted-foreground text-sm">
            No stickers in this category yet.
          </div>
        ) : (
          filtered.map((s) => (
            <div
              key={s.id}
              onClick={() => addToCart(s.id)}
              className="bg-card rounded-2xl overflow-hidden cursor-pointer active:scale-[0.97] transition-transform relative"
            >
              {s.badge && (
                <div className="absolute top-2 left-2 bg-accent text-accent-foreground text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-lg z-10">
                  {s.badge}
                </div>
              )}
              <div className="h-[130px] flex items-center justify-center bg-muted overflow-hidden">
                {s.img ? (
                  <img src={s.img} alt={s.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[52px]">{s.emoji || "🌸"}</span>
                )}
              </div>
              <div className="p-2.5 pb-3">
                <div className="text-[13px] font-medium">{s.name}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.category}</div>
                <div className="font-display text-[15px] text-accent mt-1">{s.price.toFixed(3)} TND</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); addToCart(s.id); }}
                className="absolute bottom-2.5 right-2.5 bg-accent text-accent-foreground w-7 h-7 rounded-full flex items-center justify-center text-base"
              >
                +
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StickerGrid;
