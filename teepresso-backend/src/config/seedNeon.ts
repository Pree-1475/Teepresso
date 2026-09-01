import { sql, initNeonDatabase } from './db';

export const seedNeonDatabase = async () => {
  try {
    await initNeonDatabase();
    console.log('🌱 Seeding Neon PostgreSQL with Production Data...');

    // 1. Seed Categories
    const categoriesData = [
      { id: 'cat_1', name: 'Kurtas', slug: 'kurtas', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600', description: 'Traditional & Festive Cotton Slub Kurtas' },
      { id: 'cat_2', name: 'T-Shirts', slug: 't-shirts', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600', description: 'Heavyweight & Oversized Streetwear T-Shirts' },
      { id: 'cat_3', name: 'Polos', slug: 'polos', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=600', description: 'Classic Pique & Corporate Embroidered Polos' },
      { id: 'cat_4', name: 'Hoodies', slug: 'hoodies', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600', description: 'Heavy Fleece Crewneck & Zip-up Hoodies' },
      { id: 'cat_5', name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=600', description: 'Tote Bags, Caps & Merchandise' }
    ];

    for (const cat of categoriesData) {
      await sql`
        INSERT INTO categories (id, name, slug, image, description)
        VALUES (${cat.id}, ${cat.name}, ${cat.slug}, ${cat.image}, ${cat.description})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          image = EXCLUDED.image,
          description = EXCLUDED.description;
      `;
    }

    // 2. Seed Colors
    const colorsData = [
      { id: 'col_1', name: 'Royal White', hex: '#ffffff' },
      { id: 'col_2', name: 'Obsidian Black', hex: '#141414' },
      { id: 'col_3', name: 'Terracotta Gold', hex: '#8c5b45' },
      { id: 'col_4', name: 'Festive Crimson', hex: '#991b1b' },
      { id: 'col_5', name: 'Emerald Teal', hex: '#057a78' },
      { id: 'col_6', name: 'Midnight Navy', hex: '#1e293b' },
      { id: 'col_7', name: 'Mustard Amber', hex: '#d97706' }
    ];

    for (const col of colorsData) {
      await sql`
        INSERT INTO colors (id, name, hex)
        VALUES (${col.id}, ${col.name}, ${col.hex})
        ON CONFLICT (hex) DO UPDATE SET
          name = EXCLUDED.name;
      `;
    }

    // 3. Seed Sizes
    const sizesData = [
      { id: 'sz_1', name: '2Y', category: 'Kids Sizes', chest: '24"', length: '16"' },
      { id: 'sz_2', name: '4Y', category: 'Kids Sizes', chest: '26"', length: '18"' },
      { id: 'sz_3', name: '6Y', category: 'Kids Sizes', chest: '28"', length: '20"' },
      { id: 'sz_4', name: '8Y', category: 'Kids Sizes', chest: '30"', length: '22"' },
      { id: 'sz_5', name: '10Y', category: 'Kids Sizes', chest: '32"', length: '24"' },
      { id: 'sz_6', name: '12Y', category: 'Kids Sizes', chest: '34"', length: '25"' },
      { id: 'sz_7', name: 'XS', category: 'Adult Standard', chest: '36"', length: '26"' },
      { id: 'sz_8', name: 'S', category: 'Adult Standard', chest: '38"', length: '27"' },
      { id: 'sz_9', name: 'M', category: 'Adult Standard', chest: '40"', length: '28"' },
      { id: 'sz_10', name: 'L', category: 'Adult Standard', chest: '42"', length: '29"' },
      { id: 'sz_11', name: 'XL', category: 'Adult Standard', chest: '44"', length: '30"' },
      { id: 'sz_12', name: 'XXL', category: 'Adult Standard', chest: '46"', length: '31"' },
      { id: 'sz_13', name: '3XL', category: 'Adult Plus (Special)', chest: '48"', length: '32"' },
      { id: 'sz_14', name: '4XL', category: 'Adult Plus (Special)', chest: '50"', length: '33"' },
      { id: 'sz_15', name: '5XL', category: 'Adult Plus (Special)', chest: '52"', length: '34"' }
    ];

    for (const sz of sizesData) {
      await sql`
        INSERT INTO sizes (id, name, category, chest, length)
        VALUES (${sz.id}, ${sz.name}, ${sz.category}, ${sz.chest}, ${sz.length})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          chest = EXCLUDED.chest,
          length = EXCLUDED.length;
      `;
    }

    // 4. Seed Patterns
    const patternsData = [
      { id: 'pat_1', name: 'Festive Bandhani', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=200' },
      { id: 'pat_2', name: 'Jaipuri Block Print', image: 'https://images.unsplash.com/photo-1610996843657-3f82fc464c17?auto=format&fit=crop&q=80&w=200' },
      { id: 'pat_3', name: 'Geometric Grid', image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=200' },
      { id: 'pat_4', name: 'Golden Zari Crest', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=200' }
    ];

    for (const pat of patternsData) {
      await sql`
        INSERT INTO patterns (id, name, image)
        VALUES (${pat.id}, ${pat.name}, ${pat.image})
        ON CONFLICT (name) DO UPDATE SET
          image = EXCLUDED.image;
      `;
    }

    // 5. Seed Settings
    const settingsData = [
      { id: 'set_1', key: 'storefrontMode', value: JSON.stringify('FESTIVE') },
      { id: 'set_2', key: 'upiVpa', value: JSON.stringify('9390771123@axl') },
      { id: 'set_3', key: 'payeeName', value: JSON.stringify('Teepresso Enterprise') }
    ];

    for (const set of settingsData) {
      await sql`
        INSERT INTO settings (id, key, value)
        VALUES (${set.id}, ${set.key}, ${set.value}::jsonb)
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value;
      `;
    }

    // 6. Seed Users
    const usersData = [
      { id: 'c_1', name: 'Rahul Sharma', email: 'rahul.s@iitb.ac.in', phone: '98765 43210', orgName: 'IIT Bombay TechFest', orgType: 'University', totalOrders: 5, totalSpent: 99500, lastOrderDate: 'Aug 28, 2026', role: 'customer' },
      { id: 'c_2', name: 'Ananya Verma', email: 'ananya@techcorp.io', phone: '98112 23344', orgName: 'ZettaScale Tech Inc.', orgType: 'Startup', totalOrders: 3, totalSpent: 112000, lastOrderDate: 'Aug 26, 2026', role: 'customer' },
      { id: 'c_3', name: 'Priya Nair', email: 'pnair@globalconsulting.com', phone: '97445 56677', orgName: 'Global Consulting Group', orgType: 'Corporate', totalOrders: 7, totalSpent: 285000, lastOrderDate: 'Aug 24, 2026', role: 'customer' },
      { id: 'c_4', name: 'Vikramaditya Roy', email: 'roy@suburbansociety.org', phone: '99001 12233', orgName: 'Greenwood Heights RWA', orgType: 'Community', totalOrders: 4, totalSpent: 118400, lastOrderDate: 'Aug 29, 2026', role: 'customer' },
      { id: 'usr_admin', name: 'Production Director', email: 'admin@teepresso.com', phone: '99999 11111', orgName: 'Teepresso Head Office', orgType: 'Internal', totalOrders: 0, totalSpent: 0, lastOrderDate: 'Sep 01, 2026', role: 'admin' },
      { id: 'usr_manager', name: 'Operations Manager', email: 'manager@teepresso.com', phone: '99999 22222', orgName: 'Teepresso Plant', orgType: 'Internal', totalOrders: 0, totalSpent: 0, lastOrderDate: 'Sep 01, 2026', role: 'manager' }
    ];

    for (const usr of usersData) {
      await sql`
        INSERT INTO users (id, name, email, phone, "orgName", "orgType", "totalOrders", "totalSpent", "lastOrderDate", role)
        VALUES (${usr.id}, ${usr.name}, ${usr.email}, ${usr.phone}, ${usr.orgName}, ${usr.orgType}, ${usr.totalOrders}, ${usr.totalSpent}, ${usr.lastOrderDate}, ${usr.role})
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          "orgName" = EXCLUDED."orgName",
          "orgType" = EXCLUDED."orgType",
          "totalOrders" = EXCLUDED."totalOrders",
          "totalSpent" = EXCLUDED."totalSpent",
          "lastOrderDate" = EXCLUDED."lastOrderDate",
          role = EXCLUDED.role;
      `;
    }

    // 7. Seed Products
    const productsData = [
      {
        id: 'custom-kurta-seasonal',
        name: 'Plain Kurta',
        category: 'Kurtas',
        shortDesc: 'Premium Slub Cotton Festive Kurtas with custom embroidery and collar accents.',
        startingPrice: 150,
        priceRange: '₹150 / pc',
        colors: JSON.stringify(['#ffffff', '#8c5b45', '#991b1b', '#057a78', '#1e293b', '#d97706']),
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL']),
        patterns: JSON.stringify(['Festive Bandhani', 'Jaipuri Block Print', 'Geometric Grid', 'Golden Zari Crest']),
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800',
        popularFor: 'Garba, Dandiya, Diwal events & Cultural Squads',
        requiresSizes: true,
        requiresColors: true,
        requiresPatterns: true,
        requiresMockup: true,
        applyVolumeDiscount: true,
        isSeasonalKurta: true,
        tiers: JSON.stringify([
          { minQty: 1, maxQty: 74, price: 150 },
          { minQty: 75, maxQty: 149, price: 135 },
          { minQty: 150, maxQty: 10000, price: 120 }
        ]),
        stock: 500,
        sizesStock: JSON.stringify({
          "#ffffff_Festive Bandhani_L": 85,
          "#8c5b45_Jaipuri Block Print_M": 60,
          "#057a78_Festive Bandhani_XL": 90,
          "#991b1b_Golden Zari Crest_L": 45
        })
      },
      {
        id: 'custom-tee-heavyweight',
        name: 'Heavyweight Oversized Tee',
        category: 'T-Shirts',
        shortDesc: '240 GSM combed cotton streetwear boxy tee with high-density DTF/puff print.',
        startingPrice: 349,
        priceRange: '₹349 / pc',
        colors: JSON.stringify(['#141414', '#ffffff', '#1e293b', '#057a78']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
        patterns: JSON.stringify([]),
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
        popularFor: 'College Fest Merch, Tech Summits & Streetwear Brands',
        requiresSizes: true,
        requiresColors: true,
        requiresPatterns: false,
        requiresMockup: true,
        applyVolumeDiscount: true,
        isSeasonalKurta: false,
        tiers: JSON.stringify([
          { minQty: 1, maxQty: 49, price: 349 },
          { minQty: 50, maxQty: 199, price: 310 },
          { minQty: 200, maxQty: 10000, price: 280 }
        ]),
        stock: 800,
        sizesStock: JSON.stringify({
          "#141414_L": 150,
          "#141414_XL": 180,
          "#ffffff_M": 120
        })
      },
      {
        id: 'classic-pique-polo',
        name: 'Classic Corporate Polo',
        category: 'Polos',
        shortDesc: '220 GSM breathable pique cotton polo shirt with customized chest emblem embroidery.',
        startingPrice: 429,
        priceRange: '₹429 / pc',
        colors: JSON.stringify(['#1e293b', '#141414', '#057a78', '#ffffff']),
        sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL', '3XL']),
        patterns: JSON.stringify([]),
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=800',
        popularFor: 'Corporate Uniforms, Offsites & Leadership Teams',
        requiresSizes: true,
        requiresColors: true,
        requiresPatterns: false,
        requiresMockup: true,
        applyVolumeDiscount: true,
        isSeasonalKurta: false,
        tiers: JSON.stringify([
          { minQty: 1, maxQty: 49, price: 429 },
          { minQty: 50, maxQty: 199, price: 385 },
          { minQty: 200, maxQty: 10000, price: 350 }
        ]),
        stock: 650,
        sizesStock: JSON.stringify({
          "#1e293b_L": 200,
          "#141414_M": 150
        })
      },
      {
        id: 'heavy-fleece-hoodie',
        name: 'Heavy Fleece Premium Hoodie',
        category: 'Hoodies',
        shortDesc: '350 GSM brushed fleece hoodie with double-layered hood and custom embroidery.',
        startingPrice: 799,
        priceRange: '₹799 / pc',
        colors: JSON.stringify(['#141414', '#1e293b', '#8c5b45']),
        sizes: JSON.stringify(['M', 'L', 'XL', 'XXL']),
        patterns: JSON.stringify([]),
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
        popularFor: 'Winter Merchandise & Core Team Jackets',
        requiresSizes: true,
        requiresColors: true,
        requiresPatterns: false,
        requiresMockup: true,
        applyVolumeDiscount: true,
        isSeasonalKurta: false,
        tiers: JSON.stringify([
          { minQty: 1, maxQty: 25, price: 799 },
          { minQty: 26, maxQty: 99, price: 720 },
          { minQty: 100, maxQty: 10000, price: 650 }
        ]),
        stock: 300,
        sizesStock: JSON.stringify({
          "#141414_L": 100,
          "#141414_XL": 80
        })
      }
    ];

    for (const prod of productsData) {
      await sql`
        INSERT INTO products (
          id, name, category, "shortDesc", "startingPrice", "priceRange",
          colors, sizes, patterns, image, "popularFor", "requiresSizes",
          "requiresColors", "requiresPatterns", "requiresMockup", "applyVolumeDiscount",
          "isSeasonalKurta", tiers, stock, "sizesStock"
        )
        VALUES (
          ${prod.id}, ${prod.name}, ${prod.category}, ${prod.shortDesc}, ${prod.startingPrice}, ${prod.priceRange},
          ${prod.colors}::jsonb, ${prod.sizes}::jsonb, ${prod.patterns}::jsonb, ${prod.image}, ${prod.popularFor}, ${prod.requiresSizes},
          ${prod.requiresColors}, ${prod.requiresPatterns}, ${prod.requiresMockup}, ${prod.applyVolumeDiscount},
          ${prod.isSeasonalKurta}, ${prod.tiers}::jsonb, ${prod.stock}, ${prod.sizesStock}::jsonb
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

    // 8. Seed Orders
    const ordersData = [
      {
        id: 'ord_1',
        orderId: 'TP-2026-8842',
        customerName: 'Rahul Sharma',
        email: 'rahul.s@iitb.ac.in',
        phone: '9876543210',
        orgName: 'IIT Bombay TechFest Committee',
        orgType: 'University',
        productName: 'Plain Kurta (Crimson Red / Bandhani / XL) x50',
        category: 'Kurtas',
        totalPieces: 50,
        totalAmount: 19950,
        orderDate: 'Aug 28, 2026',
        estimatedDelivery: 'Sep 05, 2026',
        currentStage: 'Printing',
        isUrgent: true,
        paymentStatus: 'Paid',
        paymentDetails: JSON.stringify({ method: 'UPI', transactionId: 'TXN-982348911', date: 'Aug 28, 2026' }),
        mockupUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=250',
        mockupStatus: 'Approved',
        softCopyUrl: 'https://designs.teepresso.com/iitb_techfest_final.ai',
        hasWatermark: false,
        whatsappNotificationSent: true,
        dispatchDetails: JSON.stringify({ pieceCountVerified: true, qualityPassed: true, shippingPartner: 'Delhivery', trackingNumber: 'DEL-9923891' }),
        notes: 'Gold foil crest on left chest. Cultural event batch.',
        items: JSON.stringify([
          { id: 'item_1', productId: 'custom-kurta-seasonal', productName: 'Plain Kurta', color: '#991b1b', pattern: 'Festive Bandhani', size: 'XL', qty: 50, unitPrice: 399, lineTotal: 19950 }
        ])
      },
      {
        id: 'ord_2',
        orderId: 'TP-2026-9011',
        customerName: 'Ananya Verma',
        email: 'ananya@techcorp.io',
        phone: '9811223344',
        orgName: 'ZettaScale Tech Inc.',
        orgType: 'Startup',
        productName: 'Heavyweight Oversized Tee (Obsidian Black / L) x320',
        category: 'T-Shirts',
        totalPieces: 320,
        totalAmount: 112000,
        orderDate: 'Aug 29, 2026',
        estimatedDelivery: 'Sep 08, 2026',
        currentStage: 'Approved',
        isUrgent: false,
        paymentStatus: 'Paid',
        paymentDetails: JSON.stringify({ method: 'Card', transactionId: 'TXN-882194012', date: 'Aug 29, 2026' }),
        mockupUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=250',
        mockupStatus: 'Approved',
        softCopyUrl: 'https://designs.teepresso.com/zettascale_streetwear.ai',
        hasWatermark: false,
        whatsappNotificationSent: true,
        dispatchDetails: JSON.stringify({ pieceCountVerified: true, qualityPassed: false }),
        notes: '240 GSM boxy tee. 3D puff teal back print.',
        items: JSON.stringify([
          { id: 'item_2', productId: 'custom-tee-heavyweight', productName: 'Heavyweight Oversized Tee', color: '#141414', pattern: '', size: 'L', qty: 320, unitPrice: 350, lineTotal: 112000 }
        ])
      },
      {
        id: 'ord_3',
        orderId: 'TP-POS-9921',
        customerName: 'Vikramaditya Roy',
        email: 'roy@suburbansociety.org',
        phone: '9900112233',
        orgName: 'Walk-in Counter POS',
        orgType: 'Offline',
        productName: 'Plain Kurta (Terracotta Gold / Jaipuri Block Print / L) x2',
        category: 'Kurtas',
        totalPieces: 2,
        totalAmount: 898,
        orderDate: 'Sep 01, 2026',
        estimatedDelivery: 'Sep 01, 2026',
        currentStage: 'Delivered',
        isUrgent: false,
        paymentStatus: 'Pending',
        paymentDetails: JSON.stringify({ method: 'UPI', transactionId: '', date: 'Sep 01, 2026' }),
        mockupUrl: '',
        mockupStatus: 'None',
        softCopyUrl: '',
        hasWatermark: false,
        whatsappNotificationSent: false,
        dispatchDetails: JSON.stringify({ pieceCountVerified: true, qualityPassed: true }),
        notes: 'Walk-in offline store purchase.',
        items: JSON.stringify([
          { id: 'item_3', productId: 'custom-kurta-seasonal', productName: 'Plain Kurta', color: '#8c5b45', pattern: 'Jaipuri Block Print', size: 'L', qty: 2, unitPrice: 449, lineTotal: 898 }
        ])
      }
    ];

    for (const ord of ordersData) {
      await sql`
        INSERT INTO orders (
          id, "orderId", "customerName", email, phone, "orgName", "orgType",
          "productName", category, "totalPieces", "totalAmount", "orderDate",
          "estimatedDelivery", "currentStage", "isUrgent", "paymentStatus",
          "paymentDetails", "mockupUrl", "mockupStatus", "softCopyUrl", "hasWatermark",
          "whatsappNotificationSent", "dispatchDetails", notes, items
        )
        VALUES (
          ${ord.id}, ${ord.orderId}, ${ord.customerName}, ${ord.email}, ${ord.phone}, ${ord.orgName}, ${ord.orgType},
          ${ord.productName}, ${ord.category}, ${ord.totalPieces}, ${ord.totalAmount}, ${ord.orderDate},
          ${ord.estimatedDelivery}, ${ord.currentStage}, ${ord.isUrgent}, ${ord.paymentStatus},
          ${ord.paymentDetails}::jsonb, ${ord.mockupUrl}, ${ord.mockupStatus}, ${ord.softCopyUrl}, ${ord.hasWatermark},
          ${ord.whatsappNotificationSent}, ${ord.dispatchDetails}::jsonb, ${ord.notes}, ${ord.items}::jsonb
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

    // 9. Seed Inventory
    const inventoryData = [
      { id: 'inv_1', itemCode: 'RAW-SLUB-WHT', itemName: 'Raw Slub Cotton Blank Fabric - White', category: 'Fabric Blanks', stockLevel: 2500, reorderPoint: 500, unitPrice: 120, unit: 'Meters', lastRestocked: 'Aug 25, 2026', supplier: 'Vardhman Textiles' },
      { id: 'inv_2', itemCode: 'RAW-SLUB-RED', itemName: 'Raw Slub Cotton Blank Fabric - Crimson', category: 'Fabric Blanks', stockLevel: 1800, reorderPoint: 400, unitPrice: 135, unit: 'Meters', lastRestocked: 'Aug 24, 2026', supplier: 'Vardhman Textiles' },
      { id: 'inv_3', itemCode: 'INK-PUFF-TEAL', itemName: 'High-Density Puff Screen Ink - Teal', category: 'Printing Inks', stockLevel: 45, reorderPoint: 10, unitPrice: 1250, unit: 'Kg', lastRestocked: 'Aug 20, 2026', supplier: 'Rutland Inks India' },
      { id: 'inv_4', itemCode: 'BOX-CORR-LG', itemName: 'Heavy Duty Shipping Cartons (50x40x30 cm)', category: 'Packaging', stockLevel: 450, reorderPoint: 100, unitPrice: 42, unit: 'Boxes', lastRestocked: 'Aug 28, 2026', supplier: 'PackMan India' }
    ];

    for (const inv of inventoryData) {
      await sql`
        INSERT INTO inventory (id, "itemCode", "itemName", category, "stockLevel", "reorderPoint", "unitPrice", unit, "lastRestocked", supplier)
        VALUES (${inv.id}, ${inv.itemCode}, ${inv.itemName}, ${inv.category}, ${inv.stockLevel}, ${inv.reorderPoint}, ${inv.unitPrice}, ${inv.unit}, ${inv.lastRestocked}, ${inv.supplier})
        ON CONFLICT ("itemCode") DO UPDATE SET
          "itemName" = EXCLUDED."itemName",
          "stockLevel" = EXCLUDED."stockLevel",
          "reorderPoint" = EXCLUDED."reorderPoint",
          "unitPrice" = EXCLUDED."unitPrice",
          "lastRestocked" = EXCLUDED."lastRestocked";
      `;
    }

    // 10. Seed Attendance
    const attendanceData = [
      { id: 'att_1', staffName: 'Production Director', role: 'Director', date: '2026-09-01', status: 'Present', checkIn: '09:00 AM', checkOut: '06:30 PM', notes: 'Plant Supervision' },
      { id: 'att_2', staffName: 'Operations Manager', role: 'Manager', date: '2026-09-01', status: 'Present', checkIn: '09:15 AM', checkOut: '06:45 PM', notes: 'Inventory Audit' },
      { id: 'att_3', staffName: 'Rajesh Kumar', role: 'Master Tailor', date: '2026-09-01', status: 'Present', checkIn: '08:45 AM', checkOut: '05:45 PM', notes: 'Kurta Stitching Line 1' },
      { id: 'att_4', staffName: 'Sunil Mehta', role: 'Screen Printer', date: '2026-09-01', status: 'Present', checkIn: '09:30 AM', checkOut: '06:30 PM', notes: 'DTF Printing Line 2' }
    ];

    for (const att of attendanceData) {
      await sql`
        INSERT INTO attendance (id, "staffName", role, date, status, "checkIn", "checkOut", notes)
        VALUES (${att.id}, ${att.staffName}, ${att.role}, ${att.date}, ${att.status}, ${att.checkIn}, ${att.checkOut}, ${att.notes})
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          "checkIn" = EXCLUDED."checkIn",
          "checkOut" = EXCLUDED."checkOut";
      `;
    }

    console.log('🎉 Neon PostgreSQL Production Database Successfully Populated with Fresh Seed Content!');
  } catch (error) {
    console.error('❌ Error seeding Neon PostgreSQL database:', error);
  }
};
