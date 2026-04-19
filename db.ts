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
      console.log("Starting database initialization...");
      
      // Migrations for type standardization
      console.log("Standardizing ID types to TEXT...");
      const idConversionTables = ['mobiles', 'posts', 'brands', 'price_ranges', 'networks', 'ram_options', 'screen_sizes', 'mobile_features', 'os_options', 'gallery_images'];
      for (const table of idConversionTables) {
        try {
          await client.query(`
            DO $$ 
            BEGIN 
              IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='${table}' AND column_name='id' AND data_type='uuid') THEN
                ALTER TABLE ${table} ALTER COLUMN id TYPE TEXT USING id::text;
              END IF;
            END $$;
          `);
        } catch (e) {
          console.error(`Error converting ${table}.id to TEXT:`, e);
        }
      }

      const tableQueries = [
        {
          name: 'mobiles',
          query: `CREATE TABLE IF NOT EXISTS mobiles (
            id TEXT PRIMARY KEY,
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
          )`
        },
        {
          name: 'posts',
          query: `CREATE TABLE IF NOT EXISTS posts (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            content TEXT,
            author TEXT,
            image TEXT,
            tags JSONB,
            seo_title TEXT,
            seo_description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`
        },
        {
          name: 'brands',
          query: `CREATE TABLE IF NOT EXISTS brands (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            logo TEXT,
            description TEXT
          )`
        },
        {
          name: 'price_ranges',
          query: `CREATE TABLE IF NOT EXISTS price_ranges (
            id TEXT PRIMARY KEY,
            label TEXT NOT NULL,
            min_price INTEGER NOT NULL,
            max_price INTEGER NOT NULL,
            currency TEXT DEFAULT 'Rs.'
          )`
        },
        {
          name: 'networks',
          query: `CREATE TABLE IF NOT EXISTS networks (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            slug TEXT UNIQUE NOT NULL
          )`
        },
        {
          name: 'ram_options',
          query: `CREATE TABLE IF NOT EXISTS ram_options (
            id TEXT PRIMARY KEY,
            label TEXT UNIQUE NOT NULL,
            slug TEXT UNIQUE NOT NULL
          )`
        },
        {
          name: 'screen_sizes',
          query: `CREATE TABLE IF NOT EXISTS screen_sizes (
            id TEXT PRIMARY KEY,
            label TEXT UNIQUE NOT NULL,
            slug TEXT UNIQUE NOT NULL
          )`
        },
        {
          name: 'mobile_features',
          query: `CREATE TABLE IF NOT EXISTS mobile_features (
            id TEXT PRIMARY KEY,
            label TEXT UNIQUE NOT NULL,
            slug TEXT UNIQUE NOT NULL
          )`
        },
        {
          name: 'os_options',
          query: `CREATE TABLE IF NOT EXISTS os_options (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            slug TEXT UNIQUE NOT NULL
          )`
        },
        {
          name: 'gallery_images',
          query: `CREATE TABLE IF NOT EXISTS gallery_images (
            id TEXT PRIMARY KEY,
            file_name TEXT NOT NULL,
            mime_type TEXT NOT NULL,
            size INTEGER NOT NULL,
            data BYTEA NOT NULL,
            description TEXT,
            alt_text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`
        },
        {
          name: 'users',
          query: `CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            google_id TEXT UNIQUE,
            email TEXT UNIQUE,
            name TEXT,
            avatar TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )`
        },
        {
          name: 'comments',
          query: `CREATE TABLE IF NOT EXISTS comments (
            id TEXT PRIMARY KEY,
            mobile_id TEXT REFERENCES mobiles(id) ON DELETE CASCADE,
            user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )`
        },
        {
          name: 'ratings',
          query: `CREATE TABLE IF NOT EXISTS ratings (
            id TEXT PRIMARY KEY,
            mobile_id TEXT REFERENCES mobiles(id) ON DELETE CASCADE,
            user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(mobile_id, user_id)
          )`
        }
      ];

      for (const t of tableQueries) {
        try {
          await client.query(t.query);
          console.log(`✅ Table checked/created: ${t.name}`);
        } catch (e) {
          console.error(`❌ Error creating table ${t.name}:`, e);
        }
      }

      // Migrations
      console.log("Running migrations...");
      
      const migrationQueries = [
        {
          name: 'brands slug migration',
          query: `DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='brands' AND column_name='slug') THEN
                    ALTER TABLE brands ADD COLUMN slug TEXT;
                    UPDATE brands SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;
                    ALTER TABLE brands ALTER COLUMN slug SET NOT NULL;
                    ALTER TABLE brands ADD CONSTRAINT brands_slug_key UNIQUE (slug);
                END IF;
            END $$;`
        },
        {
          name: 'mobiles filter columns migration',
          query: `DO $$ 
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
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mobiles' AND column_name='coming_soon') THEN
                    ALTER TABLE mobiles ADD COLUMN coming_soon BOOLEAN DEFAULT FALSE;
                END IF;
            END $$;`
        },
        {
          name: 'posts brand columns migration',
          query: `DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='brand') THEN
                    ALTER TABLE posts ADD COLUMN brand TEXT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='brand_id') THEN
                    ALTER TABLE posts ADD COLUMN brand_id TEXT;
                END IF;
            END $$;`
        }
      ];

      for (const m of migrationQueries) {
        try {
          await client.query(m.query);
          console.log(`✅ Migration completed: ${m.name}`);
        } catch (e) {
          console.error(`❌ Error in migration ${m.name}:`, e);
        }
      }

      console.log("Database successfully initialized.");
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
