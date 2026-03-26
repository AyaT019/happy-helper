import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppStore } from "@/store/StoreContext";
import { Phone } from "lucide-react";

const OrderPage = () => {
  const { cart, cartTotal, submitOrder } = useAppStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) {
      setError(true);
      return;
    }
    setError(false);
    submitOrder(name.trim(), phone.trim(), notes.trim());
    navigate("/success");
  };

  if (!cart.length) {
    navigate("/");
    return null;
  }

  return (
    <div>
      <nav className="flex justify-between items-center px-5 py-[18px] sticky top-0 bg-background z-50 border-b border-border">
        <Link to="/" className="text-xl text-foreground">←</Link>
        <span className="font-display text-[22px] tracking-tight">Stick<em className="text-accent italic">yy.</em></span>
        <div className="w-[60px]" />
      </nav>

      <div className="px-5 pt-6 pb-12">
        <h1 className="font-display text-[28px] mb-1">Your order</h1>
        <p className="text-[13px] text-muted-foreground mb-6">Fill in your details and we'll get it to you on campus.</p>

        {/* Order summary */}
        <div className="bg-card rounded-[14px] p-4 mb-6">
          {cart.map((c) => (
            <div key={c.id} className="flex justify-between text-[13px] py-1">
              <span>{c.name} × {c.qty}</span>
              <span>{(c.price * c.qty).toFixed(3)} TND</span>
            </div>
          ))}
          <div className="flex justify-between text-[13px] font-medium border-t border-border mt-1.5 pt-2">
            <span>Total</span>
            <span>{cartTotal.toFixed(3)} TND</span>
          </div>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-[11px] text-muted-foreground uppercase tracking-wider mb-[7px]">Your name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Yasmine"
            className="w-full bg-accent-foreground border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          />
        </div>

        {/* Phone */}
        <div className="mb-4 bg-card rounded-[14px] p-4 border-[1.5px] border-accent">
          <div className="flex items-center gap-[7px] mb-2.5">
            <Phone className="w-[15px] h-[15px] text-accent" />
            <span className="text-[11px] text-accent font-medium uppercase tracking-wider">Phone number</span>
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+216 XX XXX XXX"
            className="w-full bg-accent-foreground border border-border rounded-lg px-3.5 py-2.5 text-base font-medium text-foreground outline-none focus:border-accent"
          />
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
            We'll send you a confirmation message to arrange campus delivery.
          </p>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="block text-[11px] text-muted-foreground uppercase tracking-wider mb-[7px]">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Delivery spot, special requests..."
            className="w-full bg-accent-foreground border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none resize-none focus:border-accent"
          />
        </div>

        {error && <p className="text-destructive text-xs mb-2.5">Please fill in your name and phone number.</p>}

        <button onClick={handleSubmit} className="bg-accent text-accent-foreground w-full py-[15px] rounded-[14px] text-sm font-medium mb-2.5">
          Place order →
        </button>
        <Link to="/" className="block text-center bg-transparent border border-border text-foreground w-full py-[13px] rounded-[14px] text-[13px]">
          Back to catalog
        </Link>
      </div>
    </div>
  );
};

export default OrderPage;
