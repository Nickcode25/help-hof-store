import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

export function FloatingCartButton() {
  const { totalItems, setIsCartOpen, total } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-in-up">
      <Button
        onClick={() => setIsCartOpen(true)}
        className={cn(
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "font-semibold text-base px-6 py-6 rounded-full",
          "shadow-elevated transition-all hover:scale-105",
          "flex items-center gap-3"
        )}
      >
        <ShoppingBag className="h-5 w-5" />
        <span>Fechar Pedido</span>
        <span className="bg-secondary text-secondary-foreground text-sm font-bold rounded-full h-6 min-w-6 px-2 flex items-center justify-center">
          {totalItems}
        </span>
      </Button>
    </div>
  );
}
