import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppStore } from "@/store/StoreContext";

interface NavbarProps {
  onCartOpen: () => void;
}

const Navbar = ({ onCartOpen }: NavbarProps) => {
  const { cartCount } = useAppStore();

  return (
    <nav className="flex justify-between items-center px-5 py-[18px] sticky top-0 bg-background z-50 border-b border-border">
      <Link to="/" className="font-display text-[22px] tracking-tight text-foreground">
        Stick<em className="text-accent italic">yy.</em>
      </Link>
      <div className="flex items-center gap-2.5">
        <Link
          to="/admin"
          className="text-[11px] text-muted-foreground uppercase tracking-widest border border-border rounded-full px-3 py-1.5 hover:bg-card transition-colors"
        >
          Admin
        </Link>
        <button
          onClick={onCartOpen}
          className="bg-primary text-primary-foreground rounded-full px-4 py-[7px] flex items-center gap-1.5 text-xs font-medium"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Cart
          <span className="bg-accent text-accent-foreground rounded-full w-[18px] h-[18px] text-[10px] flex items-center justify-center font-medium">
            {cartCount}
          </span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
