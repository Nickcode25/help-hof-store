import { useState, useEffect } from "react";
import { useAdmin, Order, Category } from "@/contexts/AdminContext";
import { Product, ProductCategory } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Settings,
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Phone,
  User,
  Calendar,
  Check,
  X,
  Clock,
  Lock,
  LogOut,
  KeyRound,
  Loader2,
  ImageIcon,
  Tags,
  Star,
  Sparkles,
  Tag,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";


const badgeOptions = [
  { value: "none", label: "Nenhum" },
  { value: "bestseller", label: "Mais Vendido" },
  { value: "new", label: "Novidade" },
  { value: "promotion", label: "Promoção" },
];

export default function Admin() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    updateOrderStatus,
    deleteOrder,
    settings,
    updateSettings,
    categories,
    categoryLabels,
    addCategory,
    updateCategory,
    deleteCategory,
    isAuthenticated,
    login,
    logout,
    isLoading,
  } = useAdmin();

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "preenchedores" as ProductCategory,
    image: "/placeholder.svg",
    badge: "none",
  });
  const [priceDisplay, setPriceDisplay] = useState("");

  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [whatsappDisplay, setWhatsappDisplay] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [newUsername, setNewUsername] = useState(settings.adminUsername);
  const [newPassword, setNewPassword] = useState("");

  // Category management states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "" });

  // Message template state
  const [messageTemplate, setMessageTemplate] = useState(settings.messageTemplate);

  // Format phone number for display: 5511999999999 -> +55 (11) 99999-9999
  const formatWhatsAppDisplay = (number: string) => {
    const digits = number.replace(/\D/g, "");
    if (digits.length < 2) return digits;
    if (digits.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)}`;
    if (digits.length <= 9) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`;
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9, 13)}`;
  };

  // Parse display format back to raw number: +55 (11) 99999-9999 -> 5511999999999
  const parseWhatsAppNumber = (display: string) => {
    return display.replace(/\D/g, "");
  };

  // Handle WhatsApp input change
  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, "");
    // Limit to 13 digits (55 + 11 + 999999999)
    const limited = digits.slice(0, 13);
    setWhatsappNumber(limited);
    setWhatsappDisplay(formatWhatsAppDisplay(limited));
  };

  // Format price for display: 1000 -> R$ 1.000,00
  const formatPriceDisplay = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    const number = parseInt(digits, 10) / 100;
    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Handle price input change
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, "");
    const number = parseInt(digits, 10) / 100;
    setProductForm({ ...productForm, price: number.toString() });
    setPriceDisplay(formatPriceDisplay(digits));
  };

  // Update local state when settings change
  useEffect(() => {
    setWhatsappNumber(settings.whatsappNumber);
    setWhatsappDisplay(formatWhatsAppDisplay(settings.whatsappNumber));
    setNewUsername(settings.adminUsername);
    setMessageTemplate(settings.messageTemplate);
  }, [settings]);

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      category: (categories[0]?.slug || "preenchedores") as ProductCategory,
      image: "/placeholder.svg",
      badge: "none",
    });
    setPriceDisplay("");
    setEditingProduct(null);
  };

  const handleOpenProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        image: product.image,
        badge: product.badge || "none",
      });
      // Format price for display when editing
      const priceInCents = Math.round(product.price * 100).toString();
      setPriceDisplay(formatPriceDisplay(priceInCents));
    } else {
      resetProductForm();
    }
    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    setIsSaving(true);
    try {
      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category: productForm.category,
        image: productForm.image,
        badge: productForm.badge === "none" ? undefined : (productForm.badge as Product["badge"]),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.success("Produto atualizado com sucesso!");
      } else {
        await addProduct(productData);
        toast.success("Produto adicionado com sucesso!");
      }

      setIsProductDialogOpen(false);
      resetProductForm();
    } catch (error) {
      toast.error("Erro ao salvar produto");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await deleteProduct(id);
        toast.success("Produto excluído com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir produto");
        console.error(error);
      }
    }
  };

  const handleSaveWhatsApp = async () => {
    setIsSaving(true);
    try {
      await updateSettings({ whatsappNumber: whatsappNumber });
      toast.success("Número do WhatsApp atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar número do WhatsApp");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMessageTemplate = async () => {
    setIsSaving(true);
    try {
      await updateSettings({ messageTemplate });
      toast.success("Modelo de mensagem atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar modelo de mensagem");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetMessageTemplate = () => {
    const defaultTemplate = `🛒 *Novo Pedido - Help HOF*

*Cliente:* {{cliente}}
*Telefone:* {{telefone}}

*Itens do Pedido:*
━━━━━━━━━━━━━━━
{{itens}}
━━━━━━━━━━━━━━━

💰 *Total: {{total}}*

Aguardo confirmação do pedido!`;
    setMessageTemplate(defaultTemplate);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const success = await login(loginUsername, loginPassword);
      if (success) {
        toast.success("Login realizado com sucesso!");
        setLoginUsername("");
        setLoginPassword("");
      } else {
        toast.error("Usuário ou senha incorretos");
      }
    } catch (error) {
      toast.error("Erro ao fazer login");
      console.error(error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logout realizado com sucesso!");
  };

  const handleSaveCredentials = async () => {
    if (newUsername.trim().length < 3) {
      toast.error("O usuário deve ter pelo menos 3 caracteres");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    setIsSaving(true);
    try {
      const updates: { adminUsername?: string; adminPassword?: string } = {
        adminUsername: newUsername,
      };
      if (newPassword) {
        updates.adminPassword = newPassword;
      }
      await updateSettings(updates);
      setNewPassword("");
      toast.success("Credenciais atualizadas com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar credenciais");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: Order["status"]) => {
    try {
      await updateOrderStatus(id, status);
      toast.success("Status do pedido atualizado!");
    } catch (error) {
      toast.error("Erro ao atualizar status do pedido");
      console.error(error);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este pedido?")) {
      try {
        await deleteOrder(id);
        toast.success("Pedido excluído com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir pedido");
        console.error(error);
      }
    }
  };

  // Category handlers
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", slug: "" });
    setEditingCategory(null);
  };

  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, slug: category.slug });
    } else {
      resetCategoryForm();
    }
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error("Digite o nome da categoria");
      return;
    }
    const slug = categoryForm.slug.trim() || generateSlug(categoryForm.name);
    if (!slug) {
      toast.error("Slug inválido");
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: categoryForm.name, slug });
        toast.success("Categoria atualizada com sucesso!");
      } else {
        await addCategory({ name: categoryForm.name, slug });
        toast.success("Categoria adicionada com sucesso!");
      }
      setIsCategoryDialogOpen(false);
      resetCategoryForm();
    } catch (error) {
      toast.error("Erro ao salvar categoria");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const categoryInUse = products.some(p => {
      const cat = categories.find(c => c.id === id);
      return cat && p.category === cat.slug;
    });
    if (categoryInUse) {
      toast.error("Esta categoria está em uso por produtos. Remova os produtos primeiro.");
      return;
    }
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      try {
        await deleteCategory(id);
        toast.success("Categoria excluída com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir categoria");
        console.error(error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      pending: { label: "Pendente", className: "bg-yellow-500" },
      completed: { label: "Concluído", className: "bg-green-500" },
      cancelled: { label: "Cancelado", className: "bg-red-500" },
    };
    const config = statusConfig[status];
    return (
      <Badge className={cn("text-white", config.className)}>
        {config.label}
      </Badge>
    );
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              Help<span className="text-secondary">HOF</span> Admin
            </CardTitle>
            <p className="text-muted-foreground">
              Faça login para acessar o painel
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">Usuário</Label>
                <Input
                  id="login-username"
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  required
                  disabled={isLoggingIn}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  disabled={isLoggingIn}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
                Voltar para a loja
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">
              Help<span className="text-secondary">HOF</span> Admin
            </h1>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-primary-foreground hover:bg-primary-foreground/10 flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-xl">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tags className="h-4 w-4" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Config
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gerenciar Produtos</CardTitle>
                <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => handleOpenProductDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Produto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? "Editar Produto" : "Novo Produto"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 overflow-y-auto flex-1 pr-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={productForm.name}
                          onChange={(e) =>
                            setProductForm({ ...productForm, name: e.target.value })
                          }
                          placeholder="Nome do produto"
                          disabled={isSaving}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input
                          id="description"
                          value={productForm.description}
                          onChange={(e) =>
                            setProductForm({ ...productForm, description: e.target.value })
                          }
                          placeholder="Descrição do produto"
                          disabled={isSaving}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Preço</Label>
                        <Input
                          id="price"
                          type="text"
                          value={priceDisplay}
                          onChange={handlePriceChange}
                          placeholder="R$ 0,00"
                          disabled={isSaving}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select
                          value={productForm.category}
                          onValueChange={(value) =>
                            setProductForm({ ...productForm, category: value as ProductCategory })
                          }
                          disabled={isSaving}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.slug}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="badge">Badge</Label>
                        <Select
                          value={productForm.badge}
                          onValueChange={(value) =>
                            setProductForm({ ...productForm, badge: value })
                          }
                          disabled={isSaving}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {badgeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image">URL da Imagem</Label>
                        <Input
                          id="image"
                          value={productForm.image}
                          onChange={(e) =>
                            setProductForm({ ...productForm, image: e.target.value })
                          }
                          placeholder="https://seu-cdn.b-cdn.net/imagem.jpg"
                          disabled={isSaving}
                        />
                        {/* Product Card Preview - identical to homepage */}
                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground mb-2">Pré-visualização do card:</p>
                          <div className="max-w-[200px] mx-auto">
                            <div className="relative overflow-hidden bg-card border border-border rounded-lg shadow-sm">
                              {/* Badge */}
                              {productForm.badge && productForm.badge !== "none" && (
                                <div
                                  className={cn(
                                    "absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                                    productForm.badge === "bestseller" && "bg-secondary text-secondary-foreground",
                                    productForm.badge === "promotion" && "bg-destructive text-destructive-foreground",
                                    productForm.badge === "new" && "bg-accent text-accent-foreground"
                                  )}
                                >
                                  {productForm.badge === "bestseller" && <Star className="h-2.5 w-2.5" />}
                                  {productForm.badge === "promotion" && <Tag className="h-2.5 w-2.5" />}
                                  {productForm.badge === "new" && <Sparkles className="h-2.5 w-2.5" />}
                                  {badgeOptions.find(b => b.value === productForm.badge)?.label}
                                </div>
                              )}
                              {/* Image */}
                              <div className="relative aspect-square bg-muted overflow-hidden">
                                {productForm.image && productForm.image !== "/placeholder.svg" ? (
                                  <img
                                    src={productForm.image}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                                    <ImageIcon className="h-8 w-8 opacity-50" />
                                  </div>
                                )}
                              </div>
                              {/* Content */}
                              <div className="p-3">
                                <h3 className="font-semibold text-sm text-foreground line-clamp-1 mb-0.5">
                                  {productForm.name || "Nome do produto"}
                                </h3>
                                <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                                  {productForm.description || "Descrição do produto"}
                                </p>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-base font-bold text-primary">
                                    {productForm.price ? parseFloat(productForm.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ 0,00"}
                                  </span>
                                  <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
                                    <Plus className="h-3.5 w-3.5" />
                                    Adicionar
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button onClick={handleSaveProduct} className="w-full" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          editingProduct ? "Salvar Alterações" : "Adicionar Produto"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum produto cadastrado ainda.</p>
                    <p className="text-sm">Clique em "Novo Produto" para começar.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead>Badge</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{categoryLabels[product.category]}</TableCell>
                            <TableCell>{formatCurrency(product.price)}</TableCell>
                            <TableCell>
                              {product.badge && (
                                <Badge variant="secondary">
                                  {badgeOptions.find((b) => b.value === product.badge)?.label}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenProductDialog(product)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gerenciar Categorias</CardTitle>
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => handleOpenCategoryDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="category-name">Nome</Label>
                        <Input
                          id="category-name"
                          value={categoryForm.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            setCategoryForm({
                              name,
                              slug: editingCategory ? categoryForm.slug : generateSlug(name),
                            });
                          }}
                          placeholder="Nome da categoria"
                          disabled={isSaving}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category-slug">Slug (URL)</Label>
                        <Input
                          id="category-slug"
                          value={categoryForm.slug}
                          onChange={(e) =>
                            setCategoryForm({ ...categoryForm, slug: e.target.value })
                          }
                          placeholder="nome-da-categoria"
                          disabled={isSaving}
                        />
                        <p className="text-sm text-muted-foreground">
                          Identificador único usado na URL e no sistema
                        </p>
                      </div>
                      <Button onClick={handleSaveCategory} className="w-full" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          editingCategory ? "Salvar Alterações" : "Adicionar Categoria"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Tags className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma categoria cadastrada ainda.</p>
                    <p className="text-sm">Clique em "Nova Categoria" para começar.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead>Produtos</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((category) => {
                          const productCount = products.filter(p => p.category === category.slug).length;
                          return (
                            <TableRow key={category.id}>
                              <TableCell className="font-medium">{category.name}</TableCell>
                              <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{productCount}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenCategoryDialog(category)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="text-destructive hover:text-destructive"
                                    disabled={productCount > 0}
                                    title={productCount > 0 ? "Remova os produtos desta categoria primeiro" : "Excluir categoria"}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum pedido registrado ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-semibold">{order.customerName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone className="h-4 w-4" />
                                  <span>{order.customerPhone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(order.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {getStatusBadge(order.status)}
                              <span className="font-bold text-lg">
                                {formatCurrency(order.total)}
                              </span>
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <p className="text-sm font-medium mb-2">Itens do pedido:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {order.items.map((item, index) => (
                                <li key={index}>
                                  {item.quantity}x {item.product.name} - {formatCurrency(item.product.price * item.quantity)}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex gap-2 mt-4 pt-4 border-t">
                            <Button
                              size="sm"
                              variant={order.status === "completed" ? "default" : "outline"}
                              onClick={() => handleUpdateOrderStatus(order.id, "completed")}
                              className="flex items-center gap-1"
                            >
                              <Check className="h-4 w-4" />
                              Concluído
                            </Button>
                            <Button
                              size="sm"
                              variant={order.status === "pending" ? "default" : "outline"}
                              onClick={() => handleUpdateOrderStatus(order.id, "pending")}
                              className="flex items-center gap-1"
                            >
                              <Clock className="h-4 w-4" />
                              Pendente
                            </Button>
                            <Button
                              size="sm"
                              variant={order.status === "cancelled" ? "destructive" : "outline"}
                              onClick={() => handleUpdateOrderStatus(order.id, "cancelled")}
                              className="flex items-center gap-1"
                            >
                              <X className="h-4 w-4" />
                              Cancelado
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-destructive hover:text-destructive ml-auto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    WhatsApp
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">Número do WhatsApp</Label>
                    <div className="flex gap-2">
                      <Input
                        id="whatsapp"
                        value={whatsappDisplay}
                        onChange={handleWhatsAppChange}
                        placeholder="+55 (11) 99999-9999"
                        className="max-w-xs"
                        disabled={isSaving}
                      />
                      <Button onClick={handleSaveWhatsApp} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Digite o número com DDD (ex: +55 (11) 99999-9999)
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <KeyRound className="h-5 w-5" />
                    Credenciais de Acesso
                  </h3>
                  <div className="space-y-4 max-w-xs">
                    <div className="space-y-2">
                      <Label htmlFor="new-username">Usuário</Label>
                      <Input
                        id="new-username"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="admin"
                        disabled={isSaving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nova Senha</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Deixe em branco para manter a atual"
                        disabled={isSaving}
                      />
                    </div>
                    <Button onClick={handleSaveCredentials} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Atualizando...
                        </>
                      ) : (
                        "Atualizar Credenciais"
                      )}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Usuário atual: <strong>{settings.adminUsername}</strong>
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Modelo de Mensagem do WhatsApp
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="message-template">Personalize a mensagem enviada</Label>
                      <Textarea
                        id="message-template"
                        value={messageTemplate}
                        onChange={(e) => setMessageTemplate(e.target.value)}
                        placeholder="Digite o modelo de mensagem..."
                        className="min-h-[200px] font-mono text-sm"
                        disabled={isSaving}
                      />
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <p className="text-sm font-medium">Variáveis disponíveis:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li><code className="bg-muted px-1.5 py-0.5 rounded">{"{{cliente}}"}</code> - Nome do cliente</li>
                        <li><code className="bg-muted px-1.5 py-0.5 rounded">{"{{telefone}}"}</code> - Telefone do cliente</li>
                        <li><code className="bg-muted px-1.5 py-0.5 rounded">{"{{itens}}"}</code> - Lista de itens do pedido</li>
                        <li><code className="bg-muted px-1.5 py-0.5 rounded">{"{{total}}"}</code> - Valor total do pedido</li>
                      </ul>
                      <p className="text-xs text-muted-foreground mt-2">
                        Use <code className="bg-muted px-1 py-0.5 rounded">*texto*</code> para negrito no WhatsApp
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveMessageTemplate} disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          "Salvar Modelo"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleResetMessageTemplate}
                        disabled={isSaving}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restaurar Padrão
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
