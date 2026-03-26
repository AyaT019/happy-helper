import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppStore } from "@/store/StoreContext";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  onCartOpen: () => void;
}

const Navbar = ({ onCartOpen }: NavbarProps) => {
  const { cartCount } = useAppStore();

  return (
    <nav className="flex justify-between items-center px-5 py-4 sticky top-0 glass z-50 border-b border-border/50">
      <Link to="/" className="font-display text-[22px] tracking-tight text-foreground">
        Stick<em className="text-gradient italic">yy.</em>
      </Link>
      <div className="flex items-center gap-2">
        <Link
          to="/admin"
          className="text-[10px] text-muted-foreground uppercase tracking-[0.12em] border border-border/60 rounded-full px-3 py-1.5 hover:bg-card hover:border-border transition-all duration-200"
        >
          Login
        </Link>
        <button
          onClick={onCartOpen}
          className="relative bg-primary text-primary-foreground rounded-full px-4 py-2 flex items-center gap-2 text-xs font-medium shadow-soft hover:shadow-elevated transition-all duration-200 active:scale-[0.97]"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Cart
          <AnimatePresence mode="popLayout">
            <motion.span
              key={cartCount}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-accent text-accent-foreground rounded-full min-w-[18px] h-[18px] text-[10px] flex items-center justify-center font-medium px-1"
            >
              {cartCount}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
