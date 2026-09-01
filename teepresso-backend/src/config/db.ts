import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_e1uQ0RlqHxKS@ep-weathered-flower-aziqw39r-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

export const sql = neon(CONNECTION_STRING);

// Initialize Neon PostgreSQL Database Schema Tables
export const initNeonDatabase = async () => {
  try {
    console.log('🚀 Initializing Neon PostgreSQL Database Schema...');

    // 1. Users Table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        password VARCHAR(255),
        "orgName" VARCHAR(255),
        "orgType" VARCHAR(100),
        "totalOrders" INT DEFAULT 0,
        "totalSpent" INT DEFAULT 0,
        "lastOrderDate" VARCHAR(100),
        role VARCHAR(50) DEFAULT 'customer',
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
    `;

    // 2. Products Table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        "shortDesc" TEXT,
        "startingPrice" INT NOT NULL,
        "priceRange" VARCHAR(100),
        colors JSONB,
        sizes JSONB,
        patterns JSONB,
        image TEXT,
        "popularFor" TEXT,
        "requiresSizes" BOOLEAN DEFAULT true,
        "requiresColors" BOOLEAN DEFAULT true,
        "requiresPatterns" BOOLEAN DEFAULT false,
        "requiresMockup" BOOLEAN DEFAULT true,
        "applyVolumeDiscount" BOOLEAN DEFAULT false,
        "isSeasonalKurta" BOOLEAN DEFAULT false,
        tiers JSONB,
        stock INT,
        "sizesStock" JSONB,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `;

    // 3. Orders Table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        "orderId" VARCHAR(100) UNIQUE NOT NULL,
        "customerName" VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        "orgName" VARCHAR(255),
        "orgType" VARCHAR(100),
        "productName" TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        "totalPieces" INT NOT NULL,
        "totalAmount" INT NOT NULL,
        "orderDate" VARCHAR(100) NOT NULL,
        "estimatedDelivery" VARCHAR(100),
        "currentStage" VARCHAR(100) DEFAULT 'Received',
        "isUrgent" BOOLEAN DEFAULT false,
        "paymentStatus" VARCHAR(50) DEFAULT 'Pending',
        "paymentDetails" JSONB,
        "mockupUrl" TEXT,
        "mockupStatus" VARCHAR(100),
        "softCopyUrl" TEXT,
        "hasWatermark" BOOLEAN DEFAULT true,
        "whatsappNotificationSent" BOOLEAN DEFAULT false,
        "dispatchDetails" JSONB,
        notes TEXT,
        items JSONB,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `;

    // 4. Inventory Table
    await sql`
      CREATE TABLE IF NOT EXISTS inventory (
        id VARCHAR(100) PRIMARY KEY,
        "itemCode" VARCHAR(100) UNIQUE NOT NULL,
        "itemName" VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        "stockLevel" INT NOT NULL,
        "reorderPoint" INT NOT NULL,
        "unitPrice" INT NOT NULL,
        unit VARCHAR(50) NOT NULL,
        "lastRestocked" VARCHAR(100) NOT NULL,
        supplier VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `;

    // 5. Attendance Table
    await sql`
      CREATE TABLE IF NOT EXISTS attendance (
        id VARCHAR(100) PRIMARY KEY,
        "staffName" VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL,
        date VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        "checkIn" VARCHAR(50),
        "checkOut" VARCHAR(50),
        notes TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `;

    // 6. Categories Table
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        image TEXT,
        description TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `;

    // 7. Colors Table
    await sql`
      CREATE TABLE IF NOT EXISTS colors (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        hex VARCHAR(50) UNIQUE NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `;

    // 8. Sizes Table
    await sql`
      CREATE TABLE IF NOT EXISTS sizes (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
        chest VARCHAR(50),
        length VARCHAR(50),
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `;

    // 9. Patterns Table
    await sql`
      CREATE TABLE IF NOT EXISTS patterns (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        image TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `;

    // 10. Settings Table
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(100) PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value JSONB NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log('✅ Neon PostgreSQL Database Schema Verified Cleanly!');
  } catch (error) {
    console.error('❌ Error initializing Neon PostgreSQL tables:', error);
  }
};
