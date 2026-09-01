import { sql, initNeonDatabase } from './db';
import { seedNeonDatabase } from './seedNeon';

// Memory references for controllers
let databases: {
  users: any[];
  orders: any[];
  products: any[];
  inventory: any[];
  attendance: any[];
  reports: any[];
  categories: any[];
  colors: any[];
  sizes: any[];
  patterns: any[];
  settings: any[];
} = {
  users: [],
  orders: [],
  products: [],
  inventory: [],
  attendance: [],
  reports: [],
  categories: [],
  colors: [],
  sizes: [],
  patterns: [],
  settings: []
};

// Register databases
export const registerDatabase = (name: keyof typeof databases, dbArray: any[]) => {
  databases[name] = dbArray;
};

// Load database from Neon PostgreSQL
export const loadDb = async () => {
  try {
    console.log('⚡ Connecting to Neon PostgreSQL...');
    await initNeonDatabase();

    // Check if categories or products table is empty, seed if empty
    const countRes = await sql`SELECT COUNT(*)::int as count FROM products`;
    if (!countRes || countRes[0].count === 0) {
      await seedNeonDatabase();
    }

    // Load Collections from Neon PostgreSQL
    const [
      users,
      orders,
      products,
      inventory,
      attendance,
      categories,
      colors,
      sizes,
      patterns,
      settings
    ] = await Promise.all([
      sql`SELECT * FROM users ORDER BY "createdAt" DESC`,
      sql`SELECT * FROM orders ORDER BY "createdAt" DESC`,
      sql`SELECT * FROM products ORDER BY "createdAt" DESC`,
      sql`SELECT * FROM inventory ORDER BY "createdAt" DESC`,
      sql`SELECT * FROM attendance ORDER BY "createdAt" DESC`,
      sql`SELECT * FROM categories ORDER BY name ASC`,
      sql`SELECT * FROM colors ORDER BY name ASC`,
      sql`SELECT * FROM sizes ORDER BY id ASC`,
      sql`SELECT * FROM patterns ORDER BY name ASC`,
      sql`SELECT * FROM settings ORDER BY key ASC`
    ]);

    const loadedData: Record<string, any[]> = {
      users: users || [],
      orders: orders || [],
      products: products || [],
      inventory: inventory || [],
      attendance: attendance || [],
      reports: [],
      categories: categories || [],
      colors: colors || [],
      sizes: sizes || [],
      patterns: patterns || [],
      settings: settings || []
    };

    // Populate references without changing array memory addresses
    for (const key of Object.keys(databases) as Array<keyof typeof databases>) {
      if (loadedData[key] && Array.isArray(loadedData[key])) {
        databases[key].length = 0;
        databases[key].push(...loadedData[key]);
      }
    }

    console.log('✅ Live Database successfully synchronized with Neon PostgreSQL!');
  } catch (error) {
    console.error('❌ Error loading database from Neon PostgreSQL:', error);
  }
};

// Save database changes to Neon PostgreSQL
export const saveDb = async () => {
  try {
    // 1. Sync Settings
    for (const s of databases.settings) {
      const valStr = typeof s.value === 'string' ? s.value : JSON.stringify(s.value);
      await sql`
        INSERT INTO settings (id, key, value)
        VALUES (${s.id || s.key}, ${s.key}, ${valStr}::jsonb)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
      `;
    }

    // 2. Sync Products
    for (const p of databases.products) {
      await sql`
        INSERT INTO products (
          id, name, category, "shortDesc", "startingPrice", "priceRange",
          colors, sizes, patterns, image, "popularFor", "requiresSizes",
          "requiresColors", "requiresPatterns", "requiresMockup", "applyVolumeDiscount",
          "isSeasonalKurta", tiers, stock, "sizesStock"
        )
        VALUES (
          ${p.id}, ${p.name}, ${p.category}, ${p.shortDesc || ''}, ${p.startingPrice}, ${p.priceRange || ''},
          ${JSON.stringify(p.colors || [])}::jsonb, ${JSON.stringify(p.sizes || [])}::jsonb, ${JSON.stringify(p.patterns || [])}::jsonb,
          ${p.image || ''}, ${p.popularFor || ''}, ${!!p.requiresSizes}, ${!!p.requiresColors},
          ${!!p.requiresPatterns}, ${!!p.requiresMockup}, ${!!p.applyVolumeDiscount}, ${!!p.isSeasonalKurta},
          ${JSON.stringify(p.tiers || [])}::jsonb, ${p.stock !== undefined ? p.stock : null}, ${JSON.stringify(p.sizesStock || {})}::jsonb
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          "shortDesc" = EXCLUDED."shortDesc",
          "startingPrice" = EXCLUDED."startingPrice",
          "priceRange" = EXCLUDED."priceRange",
          colors = EXCLUDED.colors,
          sizes = EXCLUDED.sizes,
          patterns = EXCLUDED.patterns,
          image = EXCLUDED.image,
          "popularFor" = EXCLUDED."popularFor",
          "requiresSizes" = EXCLUDED."requiresSizes",
          "requiresColors" = EXCLUDED."requiresColors",
          "requiresPatterns" = EXCLUDED."requiresPatterns",
          "requiresMockup" = EXCLUDED."requiresMockup",
          "applyVolumeDiscount" = EXCLUDED."applyVolumeDiscount",
          "isSeasonalKurta" = EXCLUDED."isSeasonalKurta",
          tiers = EXCLUDED.tiers,
          stock = EXCLUDED.stock,
          "sizesStock" = EXCLUDED."sizesStock";
      `;
    }

    // 3. Sync Orders
    for (const o of databases.orders) {
      await sql`
        INSERT INTO orders (
          id, "orderId", "customerName", email, phone, "orgName", "orgType",
          "productName", category, "totalPieces", "totalAmount", "orderDate",
          "estimatedDelivery", "currentStage", "isUrgent", "paymentStatus",
          "paymentDetails", "mockupUrl", "mockupStatus", "softCopyUrl", "hasWatermark",
          "whatsappNotificationSent", "dispatchDetails", notes, items
        )
        VALUES (
          ${o.id}, ${o.orderId}, ${o.customerName}, ${o.email || ''}, ${o.phone || ''}, ${o.orgName || ''}, ${o.orgType || 'Offline'},
          ${o.productName}, ${o.category || 'T-Shirts'}, ${o.totalPieces || 1}, ${o.totalAmount}, ${o.orderDate || 'Today'},
          ${o.estimatedDelivery || ''}, ${o.currentStage || 'Received'}, ${!!o.isUrgent}, ${o.paymentStatus || 'Pending'},
          ${JSON.stringify(o.paymentDetails || {})}::jsonb, ${o.mockupUrl || ''}, ${o.mockupStatus || ''}, ${o.softCopyUrl || ''},
          ${!!o.hasWatermark}, ${!!o.whatsappNotificationSent}, ${JSON.stringify(o.dispatchDetails || {})}::jsonb,
          ${o.notes || ''}, ${JSON.stringify(o.items || [])}::jsonb
        )
        ON CONFLICT ("orderId") DO UPDATE SET
          "customerName" = EXCLUDED."customerName",
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          "productName" = EXCLUDED."productName",
          "totalPieces" = EXCLUDED."totalPieces",
          "totalAmount" = EXCLUDED."totalAmount",
          "paymentStatus" = EXCLUDED."paymentStatus",
          "currentStage" = EXCLUDED."currentStage",
          items = EXCLUDED.items;
      `;
    }

    // 4. Sync Categories
    for (const c of databases.categories) {
      await sql`
        INSERT INTO categories (id, name, slug, image, description)
        VALUES (${c.id}, ${c.name}, ${c.slug}, ${c.image || ''}, ${c.description || ''})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          image = EXCLUDED.image,
          description = EXCLUDED.description;
      `;
    }

    // 5. Sync Colors
    for (const col of databases.colors) {
      await sql`
        INSERT INTO colors (id, name, hex)
        VALUES (${col.id}, ${col.name}, ${col.hex})
        ON CONFLICT (hex) DO UPDATE SET name = EXCLUDED.name;
      `;
    }

    // 6. Sync Patterns
    for (const pat of databases.patterns) {
      await sql`
        INSERT INTO patterns (id, name, image)
        VALUES (${pat.id}, ${pat.name}, ${pat.image || ''})
        ON CONFLICT (name) DO UPDATE SET image = EXCLUDED.image;
      `;
    }

  } catch (error) {
    console.error('❌ Error saving changes to Neon PostgreSQL:', error);
  }
};
