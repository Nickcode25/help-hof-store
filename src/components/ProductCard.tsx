import { Plus, Star, Sparkles, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, lastAddedItem } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAddToCart = () => {
    setIsAnimating(true);
    addItem(product);
    toast.success(`${product.name} adicionado ao carrinho!`, {
      description: `R$ ${product.price.toFixed(2).replace(".", ",")}`,
      position: "bottom-right",
    });
    setTimeout(() => setIsAnimating(false), 600);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getBadgeConfig = (badge: Product["badge"]) => {
    switch (badge) {
      case "bestseller":
        return {
          label: "Mais Vendido",
          icon: Star,
          className: "bg-secondary text-secondary-foreground",
        };
      case "promotion":
        return {
          label: "Promoção",
          icon: Tag,
          className: "bg-destructive text-destructive-foreground",
        };
      case "new":
        return {
          label: "Novidade",
          icon: Sparkles,
          className: "bg-accent text-accent-foreground",
        };
      default:
        return null;
    }
  };

  const badgeConfig = product.badge ? getBadgeConfig(product.badge) : null;

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden bg-card border-border shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1",
        isAnimating && "scale-95"
      )}
    >
      {/* Badge */}
      {badgeConfig && (
        <div
          className={cn(
            "absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
            badgeConfig.className
          )}
        >
          <badgeConfig.icon className="h-3 w-3" />
          {badgeConfig.label}
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <CardContent className="p-4">
        {/* Product Info */}
        <h3 className="font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {product.description}
        </p>

        {/* Price and Button */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1 transition-all hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </CardContent>

      {/* Flying animation overlay */}
      {isAnimating && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-secondary rounded-full animate-fly-to-cart" />
        </div>
      )}
    </Card>
  );
}
