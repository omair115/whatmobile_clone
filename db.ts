import "dotenv/config";
import pg from 'pg';
const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is NOT detected. Please check your .env file in the root directory.");
} else {
  console.log("✅ Database URL detected.");
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
          logo TEXT,
          description TEXT
        );
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
