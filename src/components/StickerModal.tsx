import { useState } from "react";
import { useAppStore } from "@/store/StoreContext";
import { Sticker, ReactionType } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Heart, ThumbsUp, Laugh } from "lucide-react";

const reactionConfig: { type: ReactionType; icon: typeof Heart; label: string }[] = [
  { type: "like", icon: ThumbsUp, label: "Like" },
  { type: "love", icon: Heart, label: "Love" },
  { type: "haha", icon: Laugh, label: "Haha" },
];

interface Props {
  sticker: Sticker;
  onClose: () => void;
}

const StickerModal = ({ sticker, onClose }: Props) => {
  const { addReaction, addComment, addToCart } = useAppStore();
  const [commentText, setCommentText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [clickedReaction, setClickedReaction] = useState<ReactionType | null>(null);

  const reactions = sticker.reactions || { love: 0, haha: 0, like: 0 };
  const comments = sticker.comments || [];

  const handleReaction = (type: ReactionType) => {
    addReaction(sticker.id, type);
    setClickedReaction(type);
    setTimeout(() => setClickedReaction(null), 400);
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    addComment(sticker.id, authorName.trim() || "Anonymous", commentText.trim());
    setCommentText("");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-elevated"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-xl">
                {sticker.emoji || "🌸"}
              </div>
              <div>
                <div className="font-medium text-sm">{sticker.name}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{sticker.category}</div>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sticker display */}
          <div className="h-[200px] flex items-center justify-center bg-muted/30 relative">
            {sticker.img ? (
              <img src={sticker.img} alt={sticker.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[80px]">{sticker.emoji || "🌸"}</span>
            )}
            {sticker.badge && (
              <div className="absolute top-3 left-3 bg-accent text-accent-foreground text-[9px] tracking-[0.1em] uppercase px-2.5 py-0.5 rounded-full font-medium shadow-soft">
                {sticker.badge}
              </div>
            )}
          </div>

          {/* Price & Add to cart */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <span className="font-display text-lg text-accent">{sticker.price.toFixed(3)} TND</span>
            <button
              onClick={() => addToCart(sticker.id)}
              className="bg-accent text-accent-foreground px-4 py-2 rounded-full text-xs font-medium shadow-soft hover:shadow-elevated active:scale-95 transition-all"
            >
              Add to Cart
            </button>
          </div>

          {/* Reactions */}
          <div className="flex items-center gap-1 px-4 py-3 border-b border-border/60">
            {reactionConfig.map(({ type, icon: Icon, label }) => (
              <motion.button
                key={type}
                onClick={() => handleReaction(type)}
                animate={clickedReaction === type ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/60 hover:border-accent/50 hover:bg-accent/5 transition-all text-xs group"
              >
                <Icon className={`w-3.5 h-3.5 transition-colors ${
                  type === "love" ? "group-hover:text-red-400" :
                  type === "haha" ? "group-hover:text-yellow-500" :
                  "group-hover:text-accent"
                }`} />
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium text-foreground">{reactions[type]}</span>
              </motion.button>
            ))}
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0 max-h-[200px]">
            {comments.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No comments yet. Be the first! 💬</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center text-[10px] font-medium shrink-0 uppercase">
                    {c.author[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium">{c.author}</span>
                      <span className="text-[10px] text-muted-foreground">{c.date}</span>
                    </div>
                    <p className="text-xs text-foreground/80 mt-0.5 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment input */}
          <div className="p-3 border-t border-border/60 space-y-2">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full bg-muted/30 border border-border/60 rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-accent transition-colors"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                placeholder="Write a comment..."
                className="flex-1 bg-muted/30 border border-border/60 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-accent transition-colors"
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                className="bg-accent text-accent-foreground w-8 h-8 rounded-full flex items-center justify-center shadow-soft hover:shadow-elevated active:scale-90 transition-all disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StickerModal;
