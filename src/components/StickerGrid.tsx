import { useState } from "react";
import { Search, Heart, MessageCircle } from "lucide-react";
import { useAppStore } from "@/store/StoreContext";
import { Sticker } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import StickerModal from "./StickerModal";

const EMOJI_HEIGHTS = [120, 160, 140, 180, 130, 150, 170, 145];

const StickerGrid = () => {
  const { db, addToCart } = useAppStore();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);

  const cats = ["All", ...db.categories.filter((c) => c !== "All")];
  const byCategory = filter === "All" ? db.stickers : db.stickers.filter((s) => s.category === filter);
  const filtered = search.trim()
    ? byCategory.filter((s) => s.name.toLowerCase().includes(search.trim().toLowerCase()))
    : byCategory;

  const totalReactions = (s: Sticker) => {
    const r = s.reactions || { love: 0, haha: 0, like: 0 };
    return r.love + r.haha + r.like;
  };

  return (
    <div>
      {/* Section separator */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <div className="flex-1 h-px bg-border/60" />
        <span className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground whitespace-nowrap font-medium">
          Browse collection
        </span>
        <div className="flex-1 h-px bg-border/60" />
      </div>

      {/* Search bar */}
      <div className="px-5 pb-3">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stickers..."
            className="w-full bg-card border border-border/60 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-accent focus:shadow-soft transition-all duration-200"
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 px-5 pb-5 overflow-x-auto scrollbar-hide">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs border transition-all duration-200 ${
              c === filter
                ? "bg-primary border-primary text-primary-foreground shadow-soft"
                : "bg-transparent border-border/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <div className="px-5">
        {!filtered.length ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-14 text-muted-foreground"
          >
            <span className="text-3xl block mb-2">🔍</span>
            <p className="text-sm">No stickers found.</p>
          </motion.div>
        ) : (
          <div className="columns-2 gap-3 space-y-3">
            {filtered.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                onClick={() => setSelectedSticker(s)}
                className="group break-inside-avoid bg-card rounded-2xl overflow-hidden cursor-pointer active:scale-[0.97] transition-all duration-200 shadow-card hover:shadow-elevated relative"
              >
                {s.badge && (
                  <div className="absolute top-2.5 left-2.5 bg-accent text-accent-foreground text-[9px] tracking-[0.1em] uppercase px-2.5 py-0.5 rounded-full z-10 font-medium shadow-soft">
                    {s.badge}
                  </div>
                )}
                <div
                  className="flex items-center justify-center bg-muted/50 overflow-hidden relative"
                  style={s.img ? undefined : { height: `${EMOJI_HEIGHTS[i % EMOJI_HEIGHTS.length]}px` }}
                >
                  {s.img ? (
                    <img src={s.img} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="text-[52px] group-hover:scale-110 transition-transform duration-300">{s.emoji || "🌸"}</span>
                  )}
                </div>
                <div className="p-3 pb-3.5">
                  <div className="text-[13px] font-medium leading-tight">{s.name}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.category}</div>

                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                    {totalReactions(s) > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Heart className="w-3 h-3" /> {totalReactions(s)}
                      </span>
                    )}
                    {(s.comments?.length || 0) > 0 && (
                      <span className="flex items-center gap-0.5">
                        <MessageCircle className="w-3 h-3" /> {s.comments!.length}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-1.5">
                    <div className="font-display text-[15px] text-accent">{s.price.toFixed(3)} TND</div>
                    <button
                      onClick={(e) => { e.stopPropagation(); addToCart(s.id); }}
                      className="bg-accent text-accent-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium shadow-soft hover:shadow-elevated active:scale-90 transition-all duration-150"
                    >
                      +
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Sticker detail modal */}
      {selectedSticker && (
        <StickerModal
          sticker={db.stickers.find((s) => s.id === selectedSticker.id) || selectedSticker}
          onClose={() => setSelectedSticker(null)}
        />
      )}
    </div>
  );
};

export default StickerGrid;
