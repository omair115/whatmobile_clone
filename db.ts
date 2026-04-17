import "dotenv/config";
import pg from 'pg';
const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is NOT detected. Please check your .env file in the root directory.");
} else {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && dbUrl.includes('://')) {
      const host = new URL(dbUrl).hostname;
      console.log(`✅ Database host detected: ${host}`);
    } else {
      console.log("✅ Database URL detected (non-standard format).");
    }
  } catch (e) {
    console.log("✅ Database URL detected.");
  }
}

// Use environment variable for connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // If no URL is provided, it will try to connect to localhost by default
  // We should handle this gracefully
});

// Initialize tables
const initDb = async () => {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not found. Database features will be unavailable.");
    return;
  }

  try {
    const client = await pool.connect();
    try {
      await client.query(`
        -- ... existing CREATE TABLE statements ...
        CREATE TABLE IF NOT EXISTS mobiles (
          id UUID PRIMARY KEY,
          name TEXT NOT NULL,
          brand TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          price TEXT,
          currency TEXT,
          launch_date TEXT,
          images JSONB,
          specs JSONB,
          description TEXT,
          seo_title TEXT,
          seo_description TEXT,
          category TEXT,
          features JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS posts (
          id UUID PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          content TEXT,
          author TEXT,
          image TEXT,
          tags JSONB,
          seo_title TEXT,
          seo_description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS brands (
          id UUID PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          logo TEXT,
          description TEXT
        );

        CREATE TABLE IF NOT EXISTS price_ranges (
          id UUID PRIMARY KEY,
          label TEXT NOT NULL,
          min_price INTEGER NOT NULL,
          max_price INTEGER NOT NULL,
          currency TEXT DEFAULT 'Rs.'
        );

        CREATE TABLE IF NOT EXISTS networks (
          id UUID PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          slug TEXT UNIQUE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ram_options (
          id UUID PRIMARY KEY,
          label TEXT UNIQUE NOT NULL,
          slug TEXT UNIQUE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS screen_sizes (
          id UUID PRIMARY KEY,
          label TEXT UNIQUE NOT NULL,
          slug TEXT UNIQUE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS mobile_features (
          id UUID PRIMARY KEY,
          label TEXT UNIQUE NOT NULL,
          slug TEXT UNIQUE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS os_options (
          id UUID PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          slug TEXT UNIQUE NOT NULL
        );

        -- Migration: Add slug column to brands if missing
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='brands' AND column_name='slug') THEN
                ALTER TABLE brands ADD COLUMN slug TEXT;
                UPDATE brands SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;
                ALTER TABLE brands ALTER COLUMN slug SET NOT NULL;
                ALTER TABLE brands ADD CONSTRAINT brands_slug_key UNIQUE (slug);
            END IF;
        END $$;

        -- Migration: Add new filter columns to mobiles
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mobiles' AND column_name='network') THEN
                ALTER TABLE mobiles ADD COLUMN network TEXT;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mobiles' AND column_name='ram') THEN
                ALTER TABLE mobiles ADD COLUMN ram TEXT;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mobiles' AND column_name='screen_size') THEN
                ALTER TABLE mobiles ADD COLUMN screen_size TEXT;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mobiles' AND column_name='os') THEN
                ALTER TABLE mobiles ADD COLUMN os TEXT;
            END IF;
        END $$;
      `);
      console.log("PostgreSQL tables initialized");
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Failed to connect to PostgreSQL. Please check your DATABASE_URL.");
    // We don't rethrow here to allow the server to start even without DB
  }
};

// Run initialization in background
initDb().catch(err => console.error("Background DB init failed:", err));

export default pool;
