import { useState } from "react";
import { useAppStore } from "@/store/StoreContext";
import { Pack } from "@/store/useStore";
import { motion } from "framer-motion";
import PackModal from "./PackModal";

const SpecialDrops = () => {
  const { db, addPackToCart } = useAppStore();
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const visiblePacks = db.packs.filter((p) => p.visible);
  const heroPack = visiblePacks.find((p) => p.isHero);
  const miniPacks = visiblePacks.filter((p) => p !== heroPack);

  // Keep modal pack in sync with db
  const livePack = selectedPack ? db.packs.find((p) => p.id === selectedPack.id) || null : null;

  if (!visiblePacks.length) return null;

  return (
    <div className="mt-2">
      {/* Section header */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <div className="flex-1 h-px bg-border/60" />
        <span className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground whitespace-nowrap font-medium">
          Special drops
        </span>
        <div className="flex-1 h-px bg-border/60" />
      </div>

      {/* Hero Pack */}
      {heroPack && (
        <div className="px-5 md:px-8 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden cursor-pointer"
            style={{
              borderRadius: 20,
              background: heroPack.img ? '#f5f0e8' : 'hsl(var(--primary))',
              border: heroPack.img ? '0.5px solid #c4b89a' : 'none',
            }}
            onClick={() => setSelectedPack(heroPack)}
          >
            {heroPack.img ? (
              <>
                <img
                  src={heroPack.img}
                  alt={heroPack.name}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
                <div style={{ padding: '14px 16px' }}>
                  <p style={{ fontSize: '8px', letterSpacing: '.18em', textTransform: 'uppercase', color: '#c17f3a', marginBottom: '6px' }}>
                    ✦ Limited drop
                  </p>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontStyle: 'italic', color: '#2a2318', marginBottom: '4px', lineHeight: 1.2 }}>
                    {heroPack.name}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#8a7a65', marginBottom: '12px', lineHeight: 1.5 }}>
                    {heroPack.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#c17f3a' }}>
                      {heroPack.price.toFixed(3)} TND
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); addPackToCart(heroPack.id); }}
                      style={{
                        background: '#c17f3a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 20,
                        padding: '8px 18px',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      Add to cart →
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="relative z-10 p-6 text-primary-foreground">
                <div className="text-[10px] tracking-[0.15em] uppercase opacity-60 mb-2">Featured pack</div>
                <h3 className="font-display text-[28px] leading-tight mb-1.5">{heroPack.name}</h3>
                <p className="text-sm opacity-70 leading-relaxed mb-4 max-w-[280px]">{heroPack.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-display text-xl">{heroPack.price.toFixed(3)} TND</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); addPackToCart(heroPack.id); }}
                    className="bg-accent text-accent-foreground px-5 py-2.5 rounded-full text-xs font-medium shadow-soft hover:shadow-elevated active:scale-[0.97] transition-all"
                  >
                    Add to cart
                  </button>
                </div>
                <div className="text-[10px] opacity-50 mt-2">{heroPack.stickerIds.length} sticker{heroPack.stickerIds.length !== 1 ? "s" : ""} included</div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Mini Packs Grid */}
      {miniPacks.length > 0 && (
        <div className="px-5 md:px-8 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {miniPacks.map((pack, i) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              onClick={() => setSelectedPack(pack)}
              className="bg-card rounded-2xl overflow-hidden cursor-pointer active:scale-[0.97] transition-all duration-200 shadow-card hover:shadow-elevated"
            >
              <div className="h-[80px] bg-muted/50 flex items-center justify-center overflow-hidden relative">
                {pack.img ? (
                  <img src={pack.img} alt={pack.name} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="p-3">
                <div className="text-[13px] font-medium leading-tight">{pack.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{pack.stickerIds.length} sticker{pack.stickerIds.length !== 1 ? "s" : ""}</div>
                <div className="font-display text-[15px] text-accent mt-1">{pack.price.toFixed(3)} TND</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pack Modal */}
      {livePack && (
        <PackModal pack={livePack} onClose={() => setSelectedPack(null)} />
      )}
    </div>
  );
};

export default SpecialDrops;
