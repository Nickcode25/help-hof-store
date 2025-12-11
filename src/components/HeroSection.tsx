import { ArrowDown, Shield, Truck, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const scrollToProducts = () => {
    const element = document.getElementById("produtos");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-2 mb-8 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <Shield className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium text-primary-foreground">
              Produtos exclusivos para profissionais
            </span>
          </div>

          {/* Title */}
          <h1 
            className="text-5xl md:text-7xl font-extrabold text-primary-foreground mb-6 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Help<span className="text-secondary">HOF</span>
          </h1>

          {/* Subtitle */}
          <p 
            className="text-xl md:text-2xl text-primary-foreground/90 font-medium mb-4 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            Produtos Premium para Harmonização Orofacial
          </p>

          {/* Description */}
          <p 
            className="text-lg text-primary-foreground/70 max-w-2xl mx-auto mb-10 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            Qualidade garantida, procedência certificada e entrega rápida para todo o Brasil. 
            Tudo que você precisa para seus procedimentos estéticos em um só lugar.
          </p>

          {/* CTA Button */}
          <div 
            className="animate-fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            <Button
              size="lg"
              onClick={scrollToProducts}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-lg px-8 py-6 rounded-full shadow-elevated transition-all hover:scale-105"
            >
              Ver Produtos
              <ArrowDown className="ml-2 h-5 w-5 animate-bounce" />
            </Button>
          </div>

          {/* Features */}
          <div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-fade-in"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="flex items-center justify-center gap-3 text-primary-foreground/80">
              <div className="p-3 rounded-full bg-primary-foreground/10">
                <Award className="h-6 w-6 text-secondary" />
              </div>
              <span className="font-medium">Procedência Certificada</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-primary-foreground/80">
              <div className="p-3 rounded-full bg-primary-foreground/10">
                <Truck className="h-6 w-6 text-secondary" />
              </div>
              <span className="font-medium">Entrega Rápida</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-primary-foreground/80">
              <div className="p-3 rounded-full bg-primary-foreground/10">
                <Shield className="h-6 w-6 text-secondary" />
              </div>
              <span className="font-medium">Produtos Originais</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown className="h-6 w-6 text-primary-foreground/50" />
      </div>
    </section>
  );
}
