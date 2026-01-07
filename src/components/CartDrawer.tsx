import { X, Plus, Minus, ShoppingBag, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useState } from "react";
import { toast } from "sonner";

export function CartDrawer() {
  const { items, removeItem, updateQuantity, totalPrice, isCartOpen, setIsCartOpen, clearCart } = useCart();
  const { settings, addOrder, products } = useAdmin();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setCustomerPhone(formatted);
  };

  const generateWhatsAppMessage = () => {
    const itemsList = items
      .map(
        (item) =>
          `- ${item.quantity}x ${item.name} - ${formatPrice(item.price * item.quantity)}`
      )
      .join("\n");

    // Use custom template from settings or fallback to default
    let message = settings.messageTemplate || `🛒 *Novo Pedido - Help HOF*

*Cliente:* {{cliente}}
*Telefone:* {{telefone}}

*Itens do Pedido:*
━━━━━━━━━━━━━━━
{{itens}}
━━━━━━━━━━━━━━━

💰 *Total: {{total}}*

Aguardo confirmação do pedido!`;

    // Replace placeholders with actual values
    message = message
      .replace(/\{\{cliente\}\}/g, customerName)
      .replace(/\{\{telefone\}\}/g, customerPhone || "Não informado")
      .replace(/\{\{itens\}\}/g, itemsList)
      .replace(/\{\{total\}\}/g, formatPrice(totalPrice));

    return encodeURIComponent(message);
  };

  const handleSendOrder = async () => {
    if (!customerName.trim()) {
      toast.error("Por favor, informe seu nome");
      return;
    }

    if (items.length === 0) {
      toast.error("Seu carrinho está vazio");
      return;
    }

    // Prepare order data first
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.id) || item;
      return {
        product: product,
        quantity: item.quantity,
      };
    });

    const sanitizePhone = (phone: string) => phone.replace(/\D/g, "");
    const whatsappNumber = sanitizePhone(settings.whatsappNumber);
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    // 1. Optimistic UI Update: Clear immediately so user sees action taken
    clearCart();
    setCustomerName("");
    setCustomerPhone("");
    setIsCartOpen(false);
    toast.success("Redirecionando para o WhatsApp...");

    // 2. Fire and forget save (don't block redirect)
    addOrder({
      customerName: customerName,
      customerPhone: customerPhone || "Não informado",
      items: orderItems,
      total: totalPrice,
      status: "pending",
    })
      .then(() => console.log("Order saved successfully"))
      .catch((err) => console.error("Failed to save order in background", err));

    // 3. Redirect immediately
    const newWindow = window.open(whatsappUrl, "_blank");
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = whatsappUrl;
    }

    // 4. Force reload to ensure fresh state when user returns
    // The timeout allows the redirect to happen first
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl z-50 animate-slide-in-right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Seu Carrinho</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCartOpen(false)}
              className="hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Seu carrinho está vazio
                </h3>
                <p className="text-muted-foreground mb-6">
                  Adicione produtos para continuar
                </p>
                <Button onClick={() => setIsCartOpen(false)}>
                  Ver Produtos
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-card rounded-lg border border-border"
                  >
                    {/* Image */}
                    <div className="w-16 h-16 rounded-md bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm line-clamp-2">
                        {item.name}
                      </h4>
                      <p className="text-primary font-semibold text-sm mt-1">
                        {formatPrice(item.price)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-border p-4 space-y-4 bg-card">
              {/* Customer Info */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nome <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    value={customerPhone}
                    onChange={handlePhoneChange}
                    className="mt-1"
                    maxLength={15}
                  />
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-foreground">
                  Subtotal
                </span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              {/* WhatsApp Button */}
              <Button
                size="lg"
                onClick={handleSendOrder}
                className="w-full bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground font-semibold text-lg gap-2 py-6 rounded-lg transition-all hover:scale-[1.02]"
              >
                <MessageCircle className="h-5 w-5" />
                Enviar Pedido pelo WhatsApp
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
