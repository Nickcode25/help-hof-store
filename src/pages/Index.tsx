import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ProductCatalog } from "@/components/ProductCatalog";
import { CartDrawer } from "@/components/CartDrawer";
import { FloatingCartButton } from "@/components/FloatingCartButton";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/contexts/CartContext";

const Index = () => {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection />
          <ProductCatalog />
        </main>
        <Footer />
        <CartDrawer />
        <FloatingCartButton />
      </div>
    </CartProvider>
  );
};

export default Index;
