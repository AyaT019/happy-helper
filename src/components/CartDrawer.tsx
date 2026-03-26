import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/StoreContext";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const { cart, cartTotal, changeQty, removeFromCart } = useAppStore();
  const navigate = useNavigate();

  const goToOrder = () => {
    if (!cart.length) return;
    onClose();
    navigate("/order");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-foreground/30 z-[200] transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-background rounded-t-3xl px-5 pt-5 pb-8 z-[201] max-h-[85vh] overflow-y-auto transition-transform ${
          open ? "translate-y-0 animate-slide-up" : "translate-y-full"
        }`}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-[18px]" />
        <h2 className="font-display text-[22px] mb-4">Your cart</h2>

        {!cart.length ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Your cart is empty.<br />Go pick some stickers! 🌸
          </div>
        ) : (
          <>
            {cart.map((c) => (
              <div key={c.id} className="flex items-center gap-3 py-3 border-b border-border">
                <div className="w-[52px] h-[52px] rounded-lg bg-muted flex items-center justify-center text-[26px] overflow-hidden shrink-0">
                  {c.img ? <img src={c.img} alt={c.name} className="w-full h-full object-cover" /> : c.emoji || "🌸"}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium">{c.name}</div>
                  <div className="text-xs text-accent">{(c.price * c.qty).toFixed(3)} TND</div>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => changeQty(c.id, -1)} className="w-[22px] h-[22px] rounded-full bg-muted text-foreground text-sm flex items-center justify-center">−</button>
                    <span className="text-[13px] font-medium min-w-[16px] text-center">{c.qty}</span>
                    <button onClick={() => changeQty(c.id, 1)} className="w-[22px] h-[22px] rounded-full bg-muted text-foreground text-sm flex items-center justify-center">+</button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(c.id)} className="text-muted-foreground text-lg p-1">×</button>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4">
              <span className="text-[13px] text-muted-foreground">Total</span>
              <span className="font-display text-xl text-accent">{cartTotal.toFixed(3)} TND</span>
            </div>
            <button onClick={goToOrder} className="bg-accent text-accent-foreground w-full py-3.5 rounded-[14px] text-sm font-medium mt-4">
              Order now →
            </button>
            <button onClick={onClose} className="bg-transparent border border-border text-foreground w-full py-3 rounded-[14px] text-[13px] mt-2">
              Keep browsing
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
