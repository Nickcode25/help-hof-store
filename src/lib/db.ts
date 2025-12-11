import { neon } from '@neondatabase/serverless';

// Database connection
const DATABASE_URL = import.meta.env.VITE_DATABASE_URL || 'postgresql://neondb_owner:npg_hAq2aFfcKmR7@ep-shiny-tree-acwcv46f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

export const sql = neon(DATABASE_URL);

// Initialize database tables
export async function initDatabase() {
  try {
    // Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        image VARCHAR(500) DEFAULT '/placeholder.svg',
        badge VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create order_items table
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
        product_id VARCHAR(50),
        product_name VARCHAR(255) NOT NULL,
        product_price DECIMAL(10, 2) NOT NULL,
        quantity INTEGER NOT NULL
      )
    `;

    // Create settings table
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create categories table
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert default settings if not exist
    await sql`
      INSERT INTO settings (key, value)
      VALUES
        ('whatsapp_number', '5511999999999'),
        ('admin_username', 'helphof.site@gmail.com'),
        ('admin_password', 'HelpHOF2025!'),
        ('message_template', '🛒 *Novo Pedido - Help HOF*

*Cliente:* {{cliente}}
*Telefone:* {{telefone}}

*Itens do Pedido:*
━━━━━━━━━━━━━━━
{{itens}}
━━━━━━━━━━━━━━━

💰 *Total: {{total}}*

Aguardo confirmação do pedido!')
      ON CONFLICT (key) DO NOTHING
    `;

    // Insert default categories if not exist
    await sql`
      INSERT INTO categories (id, name, slug)
      VALUES
        ('cat-1', 'Preenchedores', 'preenchedores'),
        ('cat-2', 'Toxina Botulínica', 'toxinas'),
        ('cat-3', 'Fios de PDO', 'fios'),
        ('cat-4', 'Bioestimuladores', 'bioestimuladores'),
        ('cat-5', 'Insumos', 'insumos')
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

// Products API
export const productsApi = {
  async getAll() {
    try {
      const products = await sql`SELECT * FROM products ORDER BY created_at DESC`;
      return products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: parseFloat(p.price),
        category: p.category,
        image: p.image,
        badge: p.badge || undefined
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  async create(product: {
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    badge?: string;
  }) {
    try {
      const id = `prod-${Date.now()}`;
      await sql`
        INSERT INTO products (id, name, description, price, category, image, badge)
        VALUES (${id}, ${product.name}, ${product.description}, ${product.price}, ${product.category}, ${product.image || '/placeholder.svg'}, ${product.badge || null})
      `;
      return { id, ...product, image: product.image || '/placeholder.svg' };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async update(id: string, updates: {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    image?: string;
    badge?: string | null;
  }) {
    try {
      await sql`
        UPDATE products
        SET name = COALESCE(${updates.name}, name),
            description = COALESCE(${updates.description}, description),
            price = COALESCE(${updates.price}, price),
            category = COALESCE(${updates.category}, category),
            image = COALESCE(${updates.image}, image),
            badge = ${updates.badge},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      await sql`DELETE FROM products WHERE id = ${id}`;
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};

// Orders API
export const ordersApi = {
  async getAll() {
    try {
      // Get all orders
      const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;

      // Get all order items
      const orderItems = await sql`SELECT * FROM order_items`;

      // Map items to orders
      return orders.map(o => ({
        id: o.id,
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        total: parseFloat(o.total),
        status: o.status,
        createdAt: o.created_at,
        items: orderItems
          .filter(item => item.order_id === o.id)
          .map(item => ({
            product: {
              id: item.product_id,
              name: item.product_name,
              price: parseFloat(item.product_price),
              description: '',
              category: '',
              image: '/placeholder.svg'
            },
            quantity: item.quantity
          }))
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  async create(order: {
    customerName: string;
    customerPhone: string;
    total: number;
    items: { product: { id: string; name: string; price: number }; quantity: number }[];
  }) {
    try {
      const id = `order-${Date.now()}`;

      await sql`
        INSERT INTO orders (id, customer_name, customer_phone, total, status)
        VALUES (${id}, ${order.customerName}, ${order.customerPhone}, ${order.total}, 'pending')
      `;

      for (const item of order.items) {
        await sql`
          INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity)
          VALUES (${id}, ${item.product.id}, ${item.product.name}, ${item.product.price}, ${item.quantity})
        `;
      }

      return { id, ...order, status: 'pending' as const, createdAt: new Date().toISOString() };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  async updateStatus(id: string, status: string) {
    try {
      await sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      await sql`DELETE FROM orders WHERE id = ${id}`;
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }
};

// Categories API
export const categoriesApi = {
  async getAll() {
    try {
      const categories = await sql`SELECT * FROM categories ORDER BY created_at ASC`;
      return categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  async create(category: { name: string; slug: string }) {
    try {
      const id = `cat-${Date.now()}`;
      await sql`
        INSERT INTO categories (id, name, slug)
        VALUES (${id}, ${category.name}, ${category.slug})
      `;
      return { id, ...category };
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  async update(id: string, updates: { name?: string; slug?: string }) {
    try {
      await sql`
        UPDATE categories
        SET name = COALESCE(${updates.name}, name),
            slug = COALESCE(${updates.slug}, slug)
        WHERE id = ${id}
      `;
      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      await sql`DELETE FROM categories WHERE id = ${id}`;
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};

// Settings API
export const settingsApi = {
  async getAll() {
    try {
      const settings = await sql`SELECT * FROM settings`;
      const result: Record<string, string> = {};
      for (const row of settings) {
        result[row.key] = row.value;
      }
      return {
        whatsappNumber: result.whatsapp_number || '5511999999999',
        adminUsername: result.admin_username || 'admin',
        adminPassword: result.admin_password || 'admin123',
        messageTemplate: result.message_template || '🛒 *Novo Pedido - Help HOF*\n\n*Cliente:* {{cliente}}\n*Telefone:* {{telefone}}\n\n*Itens do Pedido:*\n━━━━━━━━━━━━━━━\n{{itens}}\n━━━━━━━━━━━━━━━\n\n💰 *Total: {{total}}*\n\nAguardo confirmação do pedido!'
      };
    } catch (error) {
      console.error('Error fetching settings:', error);
      return {
        whatsappNumber: '5511999999999',
        adminUsername: 'admin',
        adminPassword: 'admin123',
        messageTemplate: '🛒 *Novo Pedido - Help HOF*\n\n*Cliente:* {{cliente}}\n*Telefone:* {{telefone}}\n\n*Itens do Pedido:*\n━━━━━━━━━━━━━━━\n{{itens}}\n━━━━━━━━━━━━━━━\n\n💰 *Total: {{total}}*\n\nAguardo confirmação do pedido!'
      };
    }
  },

  async update(updates: { whatsappNumber?: string; adminUsername?: string; adminPassword?: string; messageTemplate?: string }) {
    try {
      if (updates.whatsappNumber !== undefined) {
        await sql`
          INSERT INTO settings (key, value, updated_at)
          VALUES ('whatsapp_number', ${updates.whatsappNumber}, CURRENT_TIMESTAMP)
          ON CONFLICT (key) DO UPDATE SET value = ${updates.whatsappNumber}, updated_at = CURRENT_TIMESTAMP
        `;
      }
      if (updates.adminUsername !== undefined) {
        await sql`
          INSERT INTO settings (key, value, updated_at)
          VALUES ('admin_username', ${updates.adminUsername}, CURRENT_TIMESTAMP)
          ON CONFLICT (key) DO UPDATE SET value = ${updates.adminUsername}, updated_at = CURRENT_TIMESTAMP
        `;
      }
      if (updates.adminPassword !== undefined) {
        await sql`
          INSERT INTO settings (key, value, updated_at)
          VALUES ('admin_password', ${updates.adminPassword}, CURRENT_TIMESTAMP)
          ON CONFLICT (key) DO UPDATE SET value = ${updates.adminPassword}, updated_at = CURRENT_TIMESTAMP
        `;
      }
      if (updates.messageTemplate !== undefined) {
        await sql`
          INSERT INTO settings (key, value, updated_at)
          VALUES ('message_template', ${updates.messageTemplate}, CURRENT_TIMESTAMP)
          ON CONFLICT (key) DO UPDATE SET value = ${updates.messageTemplate}, updated_at = CURRENT_TIMESTAMP
        `;
      }
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }
};
