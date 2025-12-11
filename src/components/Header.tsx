import { ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const { totalItems, setIsCartOpen, lastAddedItem } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [badgeKey, setBadgeKey] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (lastAddedItem) {
      setBadgeKey((prev) => prev + 1);
    }
  }, [lastAddedItem]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-lg shadow-sm border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className={cn(
              "text-2xl md:text-3xl font-extrabold tracking-tight transition-colors",
              isScrolled ? "text-primary" : "text-primary-foreground"
            )}>
              Help<span className="text-secondary">HOF</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("produtos")}
              className={cn(
                "font-medium transition-colors hover:text-secondary",
                isScrolled ? "text-foreground" : "text-primary-foreground"
              )}
            >
              Produtos
            </button>
            <button
              onClick={() => scrollToSection("sobre")}
              className={cn(
                "font-medium transition-colors hover:text-secondary",
                isScrolled ? "text-foreground" : "text-primary-foreground"
              )}
            >
              Sobre
            </button>
            <button
              onClick={() => scrollToSection("contato")}
              className={cn(
                "font-medium transition-colors hover:text-secondary",
                isScrolled ? "text-foreground" : "text-primary-foreground"
              )}
            >
              Contato
            </button>
          </nav>

          {/* Cart Button */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCartOpen(true)}
              className={cn(
                "relative transition-colors",
                isScrolled 
                  ? "text-foreground hover:bg-muted" 
                  : "text-primary-foreground hover:bg-primary-foreground/10"
              )}
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span
                  key={badgeKey}
                  className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-badge-bounce"
                >
                  {totalItems}
                </span>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "md:hidden",
                isScrolled 
                  ? "text-foreground hover:bg-muted" 
                  : "text-primary-foreground hover:bg-primary-foreground/10"
              )}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection("produtos")}
                className="text-left font-medium text-foreground hover:text-secondary transition-colors"
              >
                Produtos
              </button>
              <button
                onClick={() => scrollToSection("sobre")}
                className="text-left font-medium text-foreground hover:text-secondary transition-colors"
              >
                Sobre
              </button>
              <button
                onClick={() => scrollToSection("contato")}
                className="text-left font-medium text-foreground hover:text-secondary transition-colors"
              >
                Contato
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
