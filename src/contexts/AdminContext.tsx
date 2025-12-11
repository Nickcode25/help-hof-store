import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/types/product";
import { initDatabase, productsApi, ordersApi, settingsApi, categoriesApi } from "@/lib/db";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: { product: Product; quantity: number }[];
  total: number;
  createdAt: string;
  status: "pending" | "completed" | "cancelled";
}

interface AdminSettings {
  whatsappNumber: string;
  adminUsername: string;
  adminPassword: string;
  messageTemplate: string;
}

interface AdminContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "createdAt">) => Promise<void>;
  updateOrderStatus: (id: string, status: Order["status"]) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  settings: AdminSettings;
  updateSettings: (settings: Partial<AdminSettings>) => Promise<void>;
  categories: Category[];
  categoryLabels: Record<string, string>;
  addCategory: (category: Omit<Category, "id">) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "helphof-auth";

const DEFAULT_MESSAGE_TEMPLATE = `🛒 *Novo Pedido - Help HOF*

*Cliente:* {{cliente}}
*Telefone:* {{telefone}}

*Itens do Pedido:*
━━━━━━━━━━━━━━━
{{itens}}
━━━━━━━━━━━━━━━

💰 *Total: {{total}}*

Aguardo confirmação do pedido!`;

const defaultSettings: AdminSettings = {
  whatsappNumber: "5511999999999",
  adminUsername: "admin",
  adminPassword: "admin123",
  messageTemplate: DEFAULT_MESSAGE_TEMPLATE,
};

const defaultCategories: Category[] = [
  { id: "cat-1", name: "Preenchedores", slug: "preenchedores" },
  { id: "cat-2", name: "Toxina Botulínica", slug: "toxinas" },
  { id: "cat-3", name: "Fios de PDO", slug: "fios" },
  { id: "cat-4", name: "Bioestimuladores", slug: "bioestimuladores" },
  { id: "cat-5", name: "Insumos", slug: "insumos" },
];

export function AdminProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved === "true";
    }
    return false;
  });

  // Generate categoryLabels from categories
  const categoryLabels: Record<string, string> = categories.reduce((acc, cat) => {
    acc[cat.slug] = cat.name;
    return acc;
  }, {} as Record<string, string>);

  // Initialize database and load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Initialize database tables
        await initDatabase();

        // Load all data from database
        const [productsData, ordersData, settingsData, categoriesData] = await Promise.all([
          productsApi.getAll(),
          ordersApi.getAll(),
          settingsApi.getAll(),
          categoriesApi.getAll(),
        ]);

        setProducts(productsData);
        setOrders(ordersData);
        setSettings(settingsData);
        if (categoriesData.length > 0) {
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error("Error loading data from database:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const refreshData = async () => {
    try {
      const [productsData, ordersData, settingsData, categoriesData] = await Promise.all([
        productsApi.getAll(),
        ordersApi.getAll(),
        settingsApi.getAll(),
        categoriesApi.getAll(),
      ]);

      setProducts(productsData);
      setOrders(ordersData);
      setSettings(settingsData);
      if (categoriesData.length > 0) {
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const addProduct = async (product: Omit<Product, "id">) => {
    try {
      const newProduct = await productsApi.create(product);
      setProducts((current) => [...current, newProduct]);
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await productsApi.update(id, updates);
      setProducts((current) =>
        current.map((product) =>
          product.id === id ? { ...product, ...updates } : product
        )
      );
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productsApi.delete(id);
      setProducts((current) => current.filter((product) => product.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  };

  const addOrder = async (order: Omit<Order, "id" | "createdAt">) => {
    try {
      const newOrder = await ordersApi.create({
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        total: order.total,
        items: order.items.map((item) => ({
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
          },
          quantity: item.quantity,
        })),
      });
      setOrders((current) => [newOrder as Order, ...current]);
    } catch (error) {
      console.error("Error adding order:", error);
      throw error;
    }
  };

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    try {
      await ordersApi.updateStatus(id, status);
      setOrders((current) =>
        current.map((order) =>
          order.id === id ? { ...order, status } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await ordersApi.delete(id);
      setOrders((current) => current.filter((order) => order.id !== id));
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  };

  const updateSettings = async (newSettings: Partial<AdminSettings>) => {
    try {
      await settingsApi.update(newSettings);
      setSettings((current) => ({ ...current, ...newSettings }));
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  };

  const addCategory = async (category: Omit<Category, "id">) => {
    try {
      const newCategory = await categoriesApi.create(category);
      setCategories((current) => [...current, newCategory]);
    } catch (error) {
      console.error("Error adding category:", error);
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      await categoriesApi.update(id, updates);
      setCategories((current) =>
        current.map((category) =>
          category.id === id ? { ...category, ...updates } : category
        )
      );
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoriesApi.delete(id);
      setCategories((current) => current.filter((category) => category.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    // Refresh settings from database to get latest credentials
    try {
      const latestSettings = await settingsApi.getAll();
      setSettings(latestSettings);

      if (username === latestSettings.adminUsername && password === latestSettings.adminPassword) {
        setIsAuthenticated(true);
        localStorage.setItem(AUTH_STORAGE_KEY, "true");
        return true;
      }
    } catch (error) {
      console.error("Error during login:", error);
      // Fallback to local settings
      if (username === settings.adminUsername && password === settings.adminPassword) {
        setIsAuthenticated(true);
        localStorage.setItem(AUTH_STORAGE_KEY, "true");
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AdminContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        orders,
        addOrder,
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
        refreshData,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
