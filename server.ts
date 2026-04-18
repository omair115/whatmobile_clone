import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import pool from './db';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini AI (Server-side only)
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

async function fixExistingSlugs() {
  try {
    const mobilesResult = await pool.query("SELECT id, slug FROM mobiles WHERE slug LIKE '% %'");
    for (const row of mobilesResult.rows) {
      const cleanSlug = slugify(row.slug);
      await pool.query("UPDATE mobiles SET slug = $1 WHERE id = $2", [cleanSlug, row.id]);
      console.log(`Fixed mobile slug: ${row.slug} -> ${cleanSlug}`);
    }
    const postsResult = await pool.query("SELECT id, slug FROM posts WHERE slug LIKE '% %'");
    for (const row of postsResult.rows) {
      const cleanSlug = slugify(row.slug);
      await pool.query("UPDATE posts SET slug = $1 WHERE id = $2", [cleanSlug, row.id]);
      console.log(`Fixed post slug: ${row.slug} -> ${cleanSlug}`);
    }
  } catch (err) {
    console.error("Migration error:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Run migrations
  await fixExistingSlugs();

  app.use(express.json());

  // Global API Logger
  app.use("/api", (req, res, next) => {
    console.log(`[API Request] ${req.method} ${req.originalUrl}`);
    next();
  });

  // Diagnostic Route
  app.get("/api/test-brands", (req, res) => {
    res.json({ message: "Brands API section is loaded" });
  });

  // BRAND MANAGEMENT
  app.get("/api/brands", async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM brands ORDER BY name ASC');
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/brands", async (req, res) => {
    console.log("POST /api/brands reached", req.body);
    const { name, slug, logo, description } = req.body;
    const id = uuidv4();
    try {
      const result = await pool.query(
        'INSERT INTO brands (id, name, slug, logo, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [id, name, slug, logo, description]
      );
      console.log("Brand created successfully:", result.rows[0].id);
      res.status(201).json(result.rows[0]);
    } catch (err: any) {
      console.error("Error creating brand:", err.message);
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/brands/:id", async (req, res) => {
    const { name, slug, logo, description } = req.body;
    try {
      const result = await pool.query(
        'UPDATE brands SET name = $1, slug = $2, logo = $3, description = $4 WHERE id = $5 RETURNING *',
        [name, slug, logo, description, req.params.id]
      );
      res.json(result.rows[0]);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete("/api/brands/:id", async (req, res) => {
    try {
      await pool.query('DELETE FROM brands WHERE id = $1', [req.params.id]);
      res.json({ message: "Brand deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // PRICE RANGE MANAGEMENT
  app.get("/api/price-ranges", async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM price_ranges ORDER BY min_price ASC');
      res.json(result.rows.map((r: any) => ({
        id: r.id,
        label: r.label,
        minPrice: r.min_price,
        maxPrice: r.max_price,
        currency: r.currency
      })));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/price-ranges", async (req, res) => {
    console.log("POST /api/price-ranges reached", req.body);
    const { label, minPrice, maxPrice, currency } = req.body;
    const id = uuidv4();
    try {
      const result = await pool.query(
        'INSERT INTO price_ranges (id, label, min_price, max_price, currency) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [id, label, minPrice, maxPrice, currency || 'Rs.']
      );
      console.log("Price range created successfully:", result.rows[0].id);
      res.status(201).json(result.rows[0]);
    } catch (err: any) {
      console.error("Error creating price range:", err.message);
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/price-ranges/:id", async (req, res) => {
    const { label, minPrice, maxPrice, currency } = req.body;
    try {
      const result = await pool.query(
        'UPDATE price_ranges SET label = $1, min_price = $2, max_price = $3, currency = $4 WHERE id = $5 RETURNING *',
        [label, minPrice, maxPrice, currency, req.params.id]
      );
      res.json(result.rows[0]);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete("/api/price-ranges/:id", async (req, res) => {
    try {
      await pool.query('DELETE FROM price_ranges WHERE id = $1', [req.params.id]);
      res.json({ message: "Price range deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // NETWORK MANAGEMENT
  app.get("/api/networks", async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM networks ORDER BY name ASC');
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/networks", async (req, res) => {
    const { name, slug } = req.body;
    const id = uuidv4();
    try {
      const result = await pool.query('INSERT INTO networks (id, name, slug) VALUES ($1, $2, $3) RETURNING *', [id, name, slug]);
      res.status(201).json(result.rows[0]);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/networks/:id", async (req, res) => {
    const { name, slug } = req.body;
    try {
      const result = await pool.query(
        'UPDATE networks SET name = $1, slug = $2 WHERE id = $3 RETURNING *',
        [name, slug, req.params.id]
      );
      res.json(result.rows[0]);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete("/api/networks/:id", async (req, res) => {
    try {
      await pool.query('DELETE FROM networks WHERE id = $1', [req.params.id]);
      res.json({ message: "Network deleted" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // RAM MANAGEMENT
  app.get("/api/ram-options", async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM ram_options ORDER BY label ASC');
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ram-options", async (req, res) => {
    const { label, slug } = req.body;
    const id = uuidv4();
    try {
      const result = await pool.query('INSERT INTO ram_options (id, label, slug) VALUES ($1, $2, $3) RETURNING *', [id, label, slug]);
      res.status(201).json(result.rows[0]);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/ram-options/:id", async (req, res) => {
    const { label, slug } = req.body;
    try {
      const result = await pool.query(
        'UPDATE ram_options SET label = $1, slug = $2 WHERE id = $3 RETURNING *',
        [label, slug, req.params.id]
      );
      res.json(result.rows[0]);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete("/api/ram-options/:id", async (req, res) => {
    try {
      await pool.query('DELETE FROM ram_options WHERE id = $1', [req.params.id]);
      res.json({ message: "RAM option deleted" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // SCREEN SIZE MANAGEMENT
  app.get("/api/screen-sizes", async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM screen_sizes ORDER BY label ASC');
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/screen-sizes", async (req, res) => {
    const { label, slug } = req.body;
    const id = uuidv4();
    try {
      const result = await pool.query('INSERT INTO screen_sizes (id, label, slug) VALUES ($1, $2, $3) RETURNING *', [id, label, slug]);
      res.status(201).json(result.rows[0]);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/screen-sizes/:id", async (req, res) => {
    const { label, slug } = req.body;
    try {
      const result = await pool.query(
        'UPDATE screen_sizes SET label = $1, slug = $2 WHERE id = $3 RETURNING *',
        [label, slug, req.params.id]
      );
      res.json(result.rows[0]);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete("/api/screen-sizes/:id", async (req, res) => {
    try {
      await pool.query('DELETE FROM screen_sizes WHERE id = $1', [req.params.id]);
      res.json({ message: "Screen size deleted" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // MOBILE FEATURES MANAGEMENT
  app.get("/api/mobile-features", async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM mobile_features ORDER BY label ASC');
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/mobile-features", async (req, res) => {
    const { label, slug } = req.body;
    const id = uuidv4();
    try {
      const result = await pool.query('INSERT INTO mobile_features (id, label, slug) VALUES ($1, $2, $3) RETURNING *', [id, label, slug]);
      res.status(201).json(result.rows[0]);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/mobile-features/:id", async (req, res) => {
    const { label, slug } = req.body;
    try {
      const result = await pool.query(
        'UPDATE mobile_features SET label = $1, slug = $2 WHERE id = $3 RETURNING *',
        [label, slug, req.params.id]
      );
      res.json(result.rows[0]);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete("/api/mobile-features/:id", async (req, res) => {
    try {
      await pool.query('DELETE FROM mobile_features WHERE id = $1', [req.params.id]);
      res.json({ message: "Feature deleted" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // OS MANAGEMENT
  app.get("/api/os-options", async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM os_options ORDER BY name ASC');
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/os-options", async (req, res) => {
    const { name, slug } = req.body;
    const id = uuidv4();
    try {
      const result = await pool.query('INSERT INTO os_options (id, name, slug) VALUES ($1, $2, $3) RETURNING *', [id, name, slug]);
      res.status(201).json(result.rows[0]);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/os-options/:id", async (req, res) => {
    const { name, slug } = req.body;
    try {
      const result = await pool.query(
        'UPDATE os_options SET name = $1, slug = $2 WHERE id = $3 RETURNING *',
        [name, slug, req.params.id]
      );
      res.json(result.rows[0]);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete("/api/os-options/:id", async (req, res) => {
    try {
      await pool.query('DELETE FROM os_options WHERE id = $1', [req.params.id]);
      res.json({ message: "OS option deleted" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", db: !!process.env.DATABASE_URL });
  });

  // AI Generation Endpoints
  app.get("/api/ai/latest-launches", async (req, res) => {
    try {
      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: "List 5 newly launched or upcoming mobile phones in 2025. Return only their names as a JSON array of strings.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      res.json(JSON.parse(result.text));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ai/generate-post", async (req, res) => {
    const { mobileName } = req.body;
    try {
      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Generate a detailed blog post and specifications for the mobile phone: ${mobileName}. 
        Include:
        1. A catchy SEO title.
        2. A meta description.
        3. A detailed blog post content in Markdown.
        4. Full specifications (Display, Camera, Battery, Processor, RAM, Storage, OS).
        5. Estimated price in USD (number only).
        6. A slug for the URL.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              seoTitle: { type: Type.STRING },
              seoDescription: { type: Type.STRING },
              content: { type: Type.STRING },
              slug: { type: Type.STRING },
              price: { type: Type.NUMBER },
              specs: {
                type: Type.OBJECT,
                properties: {
                  display: { type: Type.STRING },
                  camera: { type: Type.STRING },
                  battery: { type: Type.STRING },
                  processor: { type: Type.STRING },
                  ram: { type: Type.STRING },
                  storage: { type: Type.STRING },
                  os: { type: Type.STRING }
                }
              }
            },
            required: ["title", "seoTitle", "seoDescription", "content", "slug", "price", "specs"]
          }
        }
      });
      res.json(JSON.parse(result.text));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/mobiles", async (req, res) => {
    const { brand, minPrice, maxPrice, network, ram, screen_size, os, feature, category } = req.query;
    try {
      let query = 'SELECT * FROM mobiles';
      const params: any[] = [];
      const conditions: string[] = [];

      if (brand) {
        conditions.push(`brand ILIKE $${params.length + 1}`);
        params.push(brand);
      }

      if (category) {
        conditions.push(`category = $${params.length + 1}`);
        params.push(category);
      }

      if (minPrice) {
        conditions.push(`CAST(price AS INTEGER) >= $${params.length + 1}`);
        params.push(minPrice);
      }

      if (maxPrice) {
        conditions.push(`CAST(price AS INTEGER) <= $${params.length + 1}`);
        params.push(maxPrice);
      }

      if (network) {
        conditions.push(`network = $${params.length + 1}`);
        params.push(network);
      }

      if (ram) {
        conditions.push(`ram = $${params.length + 1}`);
        params.push(ram);
      }

      if (screen_size) {
        conditions.push(`screen_size = $${params.length + 1}`);
        params.push(screen_size);
      }

      if (os) {
        conditions.push(`os = $${params.length + 1}`);
        params.push(os);
      }

      if (feature) {
        conditions.push(`features @> $${params.length + 1}::jsonb`);
        params.push(JSON.stringify([feature]));
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY created_at DESC';
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // BRAND MANAGEMENT REMOVED FROM HERE
  // PRICE RANGE MANAGEMENT REMOVED FROM HERE
  app.get("/api/mobiles/:slug", async (req, res) => {
    try {
      const rawSlug = req.params.slug;
      const cleanSlug = slugify(rawSlug);
      // Try exact match then slugified match
      const result = await pool.query(
        'SELECT * FROM mobiles WHERE LOWER(slug) = LOWER($1) OR LOWER(slug) = LOWER($2) LIMIT 1', 
        [rawSlug, cleanSlug]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: "Mobile not found" });
      res.json(result.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Similarity and brand-related endpoints
  app.get("/api/mobiles/:slug/similar", async (req, res) => {
    try {
      const { slug } = req.params;
      const phoneRes = await pool.query('SELECT * FROM mobiles WHERE LOWER(slug) = LOWER($1)', [slug]);
      if (phoneRes.rows.length === 0) return res.status(404).json({ error: "Mobile not found" });
      
      const phone = phoneRes.rows[0];
      const price = parseInt(phone.price.toString().replace(/,/g, ''));
      const minPrice = price * 0.8;
      const maxPrice = price * 1.2;
      
      // Select similar phones based on price, camera, os, display
      // We use ILIKE for spec matching since they are JSON strings
      const result = await pool.query(`
        SELECT * FROM mobiles 
        WHERE id != $1 
        AND (
          (CAST(price AS INTEGER) BETWEEN $2 AND $3)
          OR (specs->'camera'->>'main' ILIKE $4 AND $4 != '')
          OR (specs->'build'->>'os' ILIKE $5 AND $5 != '')
          OR (specs->'display'->>'size' ILIKE $6 AND $6 != '')
        )
        ORDER BY 
          (CASE WHEN brand = $7 THEN 1 ELSE 2 END),
          created_at DESC 
        LIMIT 6
      `, [
        phone.id, 
        minPrice, 
        maxPrice, 
        `%${phone.specs?.camera?.main || ''}%`, 
        `%${phone.specs?.build?.os || ''}%`, 
        `%${phone.specs?.display?.size || ''}%`,
        phone.brand
      ]);
      
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/mobiles/:slug/brand-related", async (req, res) => {
    try {
      const { slug } = req.params;
      const phoneRes = await pool.query('SELECT brand FROM mobiles WHERE LOWER(slug) = LOWER($1)', [slug]);
      if (phoneRes.rows.length === 0) return res.status(404).json({ error: "Mobile not found" });
      
      const brand = phoneRes.rows[0].brand;
      const result = await pool.query('SELECT * FROM mobiles WHERE brand = $1 AND LOWER(slug) != LOWER($2) LIMIT 6', [brand, slug]);
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/posts/brand/:brand", async (req, res) => {
    try {
      const { brand } = req.params;
      const result = await pool.query(`
        SELECT * FROM posts 
        WHERE title ILIKE $1 
        OR content ILIKE $1 
        OR tags::text ILIKE $1
        ORDER BY created_at DESC 
        LIMIT 4
      `, [`%${brand}%`]);
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/posts/:slug", async (req, res) => {
    try {
      const rawSlug = req.params.slug;
      const cleanSlug = slugify(rawSlug);
      // Try exact match then slugified match
      const result = await pool.query(
        'SELECT * FROM posts WHERE LOWER(slug) = LOWER($1) OR LOWER(slug) = LOWER($2) LIMIT 1', 
        [rawSlug, cleanSlug]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: "Post not found" });
      res.json(result.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/mobiles", async (req, res) => {
    const { name, brand, slug, price, currency, launchDate, images, specs, description, seoTitle, seoDescription, category, features, network, ram, screen_size, os } = req.body;
    const id = uuidv4();
    const cleanSlug = slugify(slug || name);
    
    try {
      const query = `
        INSERT INTO mobiles (id, name, brand, slug, price, currency, launch_date, images, specs, description, seo_title, seo_description, category, features, network, ram, screen_size, os)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING id, slug
      `;
      const values = [id, name, brand, cleanSlug, price, currency, launchDate, JSON.stringify(images), JSON.stringify(specs), description, seoTitle, seoDescription, category, JSON.stringify(features), network, ram, screen_size, os];
      const result = await pool.query(query, values);
      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Seed Data Endpoint
  app.post("/api/admin/seed", async (req, res) => {
    try {
      const dummyMobiles = [
        {
          id: uuidv4(),
          name: 'Xiaomi Redmi Note 15 Pro',
          brand: 'Xiaomi',
          slug: 'xiaomi-redmi-note-15-pro',
          price: '94999',
          currency: 'Rs.',
          launch_date: 'Mar 2026',
          images: JSON.stringify(['https://picsum.photos/seed/redmi15/400/600']),
          specs: JSON.stringify({
            build: { os: 'Android 15 OS', ui: 'HyperOS 2.0', dimensions: '163.2 x 76.2 x 7.69 mm', weight: '195 g', sim: 'Dual SIM', colors: 'Titanium Color, Glacier Blue, Black' },
            frequency: { '2g': 'GSM 850 / 900 / 1800 / 1900', '3g': 'HSDPA 850 / 900 / 2100', '4g': 'LTE' },
            processor: { cpu: '2.6 Ghz Octa Core', chipset: 'MediaTek Helio G200-Ultra', gpu: 'Mali-G615 MC2' },
            display: { technology: 'AMOLED', size: '6.77 Inches', resolution: '1080 x 2392 Pixels', protection: 'Gorilla Glass Victus 2', extra: '120Hz, 3200 nits' },
            memory: { builtin: '256GB Built-in, 8GB RAM', card: 'No' },
            camera: { main: '200 MP + 8 MP', features: 'HDR, Panorama', front: '20 MP' },
            connectivity: { wlan: 'Wi-Fi 6', bluetooth: 'v5.4', gps: 'Yes', radio: 'FM', usb: 'Type-C 2.0', nfc: 'Yes', infrared: 'Yes', data: '4G LTE' },
            features: { sensors: 'Fingerprint, Gyro', audio: 'Dual Speaker', browser: 'HTML5', messaging: 'SMS, MMS', games: 'Built-in', torch: 'Yes', extra: 'IP68/IP69K' },
            battery: { capacity: '6500 mAh', extra: '45W Wired' },
            price: { pkr: '94,999', usd: '291' }
          }),
          description: 'Xiaomi Redmi Note 15 Pro detailed specifications...',
          seo_title: 'Xiaomi Redmi Note 15 Pro Price in Pakistan & Specs',
          seo_description: 'Check out Xiaomi Redmi Note 15 Pro price in Pakistan and full specifications.',
          category: 'mid-range',
          features: JSON.stringify(['200MP Camera', '6500mAh Battery', 'HyperOS 2.0'])
        },
        {
          id: uuidv4(),
          name: 'Samsung Galaxy S26 Ultra',
          brand: 'Samsung',
          slug: 'samsung-galaxy-s26-ultra',
          price: '424999',
          currency: 'Rs.',
          launch_date: 'Jan 2026',
          images: JSON.stringify(['https://picsum.photos/seed/s26u/400/600']),
          specs: JSON.stringify({
            build: { os: 'Android 16', ui: 'One UI 8', dimensions: '162.3 x 79.0 x 8.6 mm', weight: '232g', sim: 'Dual SIM', colors: 'Titanium Black' },
            frequency: { '2g': 'Yes', '3g': 'Yes', '4g': 'Yes', '5g': 'Yes' },
            processor: { cpu: 'Octa-core', chipset: 'Snapdragon 8 Gen 5', gpu: 'Adreno 840' },
            display: { technology: 'Dynamic AMOLED 2X', size: '6.8 Inches', resolution: '1440 x 3120', protection: 'Gorilla Armor', extra: '120Hz' },
            memory: { builtin: '512GB, 16GB RAM', card: 'No' },
            camera: { main: '200MP Quad', features: '100x Zoom', front: '12MP' },
            connectivity: { wlan: 'Wi-Fi 7', bluetooth: 'v5.4', gps: 'Yes', radio: 'No', usb: 'Type-C 3.2', nfc: 'Yes', infrared: 'No', data: '5G' },
            features: { sensors: 'Fingerprint', audio: 'Stereo', browser: 'HTML5', messaging: 'SMS', games: 'Yes', torch: 'Yes', extra: 'S-Pen' },
            battery: { capacity: '5000mAh', extra: '45W' },
            price: { pkr: '424,999', usd: '1,499' }
          }),
          description: 'The ultimate Samsung flagship for 2026.',
          seo_title: 'Samsung Galaxy S26 Ultra Price in Pakistan',
          seo_description: 'Full specifications of Samsung S26 Ultra.',
          category: 'flagship',
          features: JSON.stringify(['S-Pen', 'AI Features', 'Titanium'])
        },
        {
          id: uuidv4(),
          name: 'Infinix Note 60',
          brand: 'Infinix',
          slug: 'infinix-note-60',
          price: '84999',
          currency: 'Rs.',
          launch_date: 'Feb 2026',
          images: JSON.stringify(['https://picsum.photos/seed/note60/400/600']),
          specs: JSON.stringify({
            build: { os: 'Android 15', ui: 'XOS 14', dimensions: '164.4 x 76.8 x 7.8 mm', weight: '190g', sim: 'Dual SIM', colors: 'Magic Gold' },
            frequency: { '2g': 'Yes', '3g': 'Yes', '4g': 'Yes' },
            processor: { cpu: 'Octa-core', chipset: 'Helio G99 Ultimate', gpu: 'Mali-G57 MC2' },
            display: { technology: 'AMOLED', size: '6.78 Inches', resolution: '1080 x 2460', protection: 'Gorilla Glass 5', extra: '120Hz' },
            memory: { builtin: '256GB, 8GB RAM', card: 'microSDXC' },
            camera: { main: '108MP Triple', features: 'Quad-LED flash', front: '32MP' },
            connectivity: { wlan: 'Wi-Fi 5', bluetooth: 'v5.2', gps: 'Yes', radio: 'FM', usb: 'Type-C 2.0', nfc: 'Yes', infrared: 'No', data: '4G' },
            features: { sensors: 'Fingerprint', audio: 'Stereo', browser: 'HTML5', messaging: 'SMS', games: 'Yes', torch: 'Yes', extra: 'JBL Audio' },
            battery: { capacity: '5000mAh', extra: '45W' },
            price: { pkr: '84,999', usd: '260' }
          }),
          description: 'Great value for money from Infinix.',
          seo_title: 'Infinix Note 60 Specs & Price',
          seo_description: 'Infinix Note 60 full details.',
          category: 'budget',
          features: JSON.stringify(['108MP Camera', 'AMOLED Display', '45W Charging'])
        }
      ];

      const dummyPosts = [
        {
          id: uuidv4(),
          title: 'Tecno Spark 50 4G Breaks Cover with Upgraded 7000mAh Battery',
          slug: 'tecno-spark-50-4g-launch',
          content: 'Tecno has launched the new Spark 50 with a massive battery...',
          author: 'Admin',
          image: 'https://picsum.photos/seed/spark50/800/450',
          tags: JSON.stringify(['Tecno', 'New Launch']),
          seo_title: 'Tecno Spark 50 4G Launch Details',
          seo_description: 'Read about the new Tecno Spark 50 4G.'
        },
        {
          id: uuidv4(),
          title: 'iPhone 18 Pro Leaks in Deep Red Color; Android Copycats Likely to Follow',
          slug: 'iphone-18-pro-leaks',
          content: 'The latest leaks suggest a stunning new color for the next iPhone...',
          author: 'Tech News',
          image: 'https://picsum.photos/seed/iphone18/800/450',
          tags: JSON.stringify(['Apple', 'iPhone 18', 'Leaks']),
          seo_title: 'iPhone 18 Pro Deep Red Leak',
          seo_description: 'Everything we know about iPhone 18 Pro colors.'
        }
      ];

      const dummyPriceRanges = [
        { id: uuidv4(), label: 'Under 30k', min_price: 0, max_price: 30000, currency: 'Rs.' },
        { id: uuidv4(), label: '30k - 50k', min_price: 30000, max_price: 50000, currency: 'Rs.' },
        { id: uuidv4(), label: '50k - 80k', min_price: 50000, max_price: 80000, currency: 'Rs.' },
        { id: uuidv4(), label: '80k - 150k', min_price: 80000, max_price: 150000, currency: 'Rs.' },
        { id: uuidv4(), label: 'Above 150k', min_price: 150000, max_price: 1000000, currency: 'Rs.' }
      ];

      const dummyBrands = [
        { id: uuidv4(), name: 'Samsung', slug: 'samsung', logo: '', description: 'Samsung Mobiles' },
        { id: uuidv4(), name: 'Apple', slug: 'apple', logo: '', description: 'Apple iPhones' },
        { id: uuidv4(), name: 'Xiaomi', slug: 'xiaomi', logo: '', description: 'Xiaomi Mobiles' },
        { id: uuidv4(), name: 'Vivo', slug: 'vivo', logo: '', description: 'Vivo Mobiles' },
        { id: uuidv4(), name: 'Oppo', slug: 'oppo', logo: '', description: 'Oppo Mobiles' },
        { id: uuidv4(), name: 'Infinix', slug: 'infinix', logo: '', description: 'Infinix Mobiles' },
        { id: uuidv4(), name: 'Tecno', slug: 'tecno', logo: '', description: 'Tecno Mobiles' }
      ];

      const dummyNetworks = [
        { id: uuidv4(), name: '5G Phones', slug: '5g-phones' },
        { id: uuidv4(), name: '4G Mobiles', slug: '4g-mobiles' },
        { id: uuidv4(), name: '3G Mobiles', slug: '3g-mobiles' }
      ];

      const dummyRam = [
        { id: uuidv4(), label: '2GB RAM', slug: '2gb-ram' },
        { id: uuidv4(), label: '3GB RAM', slug: '3gb-ram' },
        { id: uuidv4(), label: '4GB RAM', slug: '4gb-ram' },
        { id: uuidv4(), label: '6GB RAM', slug: '6gb-ram' },
        { id: uuidv4(), label: '8GB RAM', slug: '8gb-ram' },
        { id: uuidv4(), label: '12GB & above RAM', slug: '12gb-plus-ram' }
      ];

      const dummyScreens = [
        { id: uuidv4(), label: 'Less Than 3 Inches', slug: 'less-than-3-inches' },
        { id: uuidv4(), label: '3.0 inch - 4.0 inch', slug: '3-4-inch' },
        { id: uuidv4(), label: '4.1 inch - 4.9 inch', slug: '4-5-inch' },
        { id: uuidv4(), label: '5.0 inch - 6.9 inch', slug: '5-7-inch' },
        { id: uuidv4(), label: '7.0 inch - 8.9 inch', slug: '7-9-inch' }
      ];

      const dummyFeatures = [
        { id: uuidv4(), label: 'Camera Mobiles', slug: 'camera-mobiles' },
        { id: uuidv4(), label: 'Video Recording', slug: 'video-recording' },
        { id: uuidv4(), label: 'Bluetooth Mobiles', slug: 'bluetooth-mobiles' },
        { id: uuidv4(), label: 'Dual Sim Phones', slug: 'dual-sim' },
        { id: uuidv4(), label: 'Wireless LAN', slug: 'wireless-lan' },
        { id: uuidv4(), label: 'MP3 Playback', slug: 'mp3-playback' },
        { id: uuidv4(), label: 'FM Radio Mobiles', slug: 'fm-radio' },
        { id: uuidv4(), label: 'Memory Card', slug: 'memory-card' }
      ];

      const dummyOs = [
        { id: uuidv4(), name: 'Android Phones', slug: 'android-phones' },
        { id: uuidv4(), name: 'Feature Phones', slug: 'feature-phones' },
        { id: uuidv4(), name: 'Windows Phones', slug: 'windows-phones' },
        { id: uuidv4(), name: 'All Smartphones', slug: 'smartphones' }
      ];

      for (const br of dummyBrands) {
        await pool.query(
          'INSERT INTO brands (id, name, slug, logo, description) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (name) DO NOTHING',
          [br.id, br.name, br.slug, br.logo, br.description]
        );
      }

      for (const net of dummyNetworks) {
        await pool.query('INSERT INTO networks (id, name, slug) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING', [net.id, net.name, net.slug]);
      }
      for (const r of dummyRam) {
        await pool.query('INSERT INTO ram_options (id, label, slug) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING', [r.id, r.label, r.slug]);
      }
      for (const s of dummyScreens) {
        await pool.query('INSERT INTO screen_sizes (id, label, slug) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING', [s.id, s.label, s.slug]);
      }
      for (const f of dummyFeatures) {
        await pool.query('INSERT INTO mobile_features (id, label, slug) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING', [f.id, f.label, f.slug]);
      }
      for (const o of dummyOs) {
        await pool.query('INSERT INTO os_options (id, name, slug) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING', [o.id, o.name, o.slug]);
      }

      for (const pr of dummyPriceRanges) {
        await pool.query(
          'INSERT INTO price_ranges (id, label, min_price, max_price, currency) VALUES ($1, $2, $3, $4, $5)',
          [pr.id, pr.label, pr.min_price, pr.max_price, pr.currency]
        );
      }

      for (const m of dummyMobiles) {
        await pool.query(
          `INSERT INTO mobiles (id, name, brand, slug, price, currency, launch_date, images, specs, description, seo_title, seo_description, category, features, network, ram, screen_size, os) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) ON CONFLICT (slug) DO NOTHING`,
          [m.id, m.name, m.brand, m.slug, m.price, m.currency, m.launch_date, m.images, m.specs, m.description, m.seo_title, m.seo_description, m.category, m.features, '5G Phones', '8GB RAM', '5.0 inch - 6.9 inch', 'Android Phones']
        );
      }

      for (const p of dummyPosts) {
        await pool.query(
          `INSERT INTO posts (id, title, slug, content, author, image, tags, seo_title, seo_description) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (slug) DO NOTHING`,
          [p.id, p.title, p.slug, p.content, p.author, p.image, p.tags, p.seo_title, p.seo_description]
        );
      }

      res.json({ message: "Database seeded successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Auth
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    // Hardcoded for demo, in real app use DB and hashed passwords
    if (username === "admin" && password === "admin123") {
      res.json({ success: true, token: "mock-jwt-token" });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Mobile Management
  app.put("/api/mobiles/:id", async (req, res) => {
    const { name, brand, slug, price, currency, launchDate, images, specs, description, seoTitle, seoDescription, category, features, network, ram, screen_size, os } = req.body;
    const cleanSlug = slugify(slug || name);
    try {
      const query = `
        UPDATE mobiles 
        SET name = $1, brand = $2, slug = $3, price = $4, currency = $5, launch_date = $6, 
            images = $7, specs = $8, description = $9, seo_title = $10, seo_description = $11, 
            category = $12, features = $13, network = $14, ram = $15, screen_size = $16, os = $17
        WHERE id = $18
        RETURNING id, slug
      `;
      const values = [name, brand, cleanSlug, price, currency, launchDate, JSON.stringify(images), JSON.stringify(specs), description, seoTitle, seoDescription, category, JSON.stringify(features), network, ram, screen_size, os, req.params.id];
      const result = await pool.query(query, values);
      if (result.rows.length === 0) return res.status(404).json({ error: "Mobile not found" });
      res.json(result.rows[0]);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/mobiles/:id", async (req, res) => {
    try {
      const result = await pool.query('DELETE FROM mobiles WHERE id = $1 RETURNING id', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: "Mobile not found" });
      res.json({ message: "Mobile deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Post Management
  app.put("/api/posts/:id", async (req, res) => {
    const { title, slug, content, author, image, tags, seoTitle, seoDescription } = req.body;
    const cleanSlug = slugify(slug || title);
    try {
      const query = `
        UPDATE posts 
        SET title = $1, slug = $2, content = $3, author = $4, image = $5, tags = $6, 
            seo_title = $7, seo_description = $8
        WHERE id = $9
        RETURNING id, slug
      `;
      const values = [title, cleanSlug, content, author, image, JSON.stringify(tags), seoTitle, seoDescription, req.params.id];
      const result = await pool.query(query, values);
      if (result.rows.length === 0) return res.status(404).json({ error: "Post not found" });
      res.json(result.rows[0]);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING id', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: "Post not found" });
      res.json({ message: "Post deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/posts", async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/posts", async (req, res) => {
    const { title, slug, content, author, image, tags, seoTitle, seoDescription } = req.body;
    const id = uuidv4();
    const cleanSlug = slugify(slug || title);
    
    try {
      const query = `
        INSERT INTO posts (id, title, slug, content, author, image, tags, seo_title, seo_description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, slug
      `;
      const values = [id, title, cleanSlug, content, author, image, JSON.stringify(tags), seoTitle, seoDescription];
      const result = await pool.query(query, values);
      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send("User-agent: *\nAllow: /\nSitemap: /sitemap.xml");
  });

  app.get("/sitemap.xml", (req, res) => {
    res.type("application/xml");
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>/</loc><priority>1.0</priority></url>
  <url><loc>/brands</loc><priority>0.8</priority></url>
  <url><loc>/news</loc><priority>0.8</priority></url>
  <!-- In a real app, dynamically generate phone and blog URLs -->
</urlset>`;
    res.send(sitemap);
  });

  // Mock automation route
  app.post("/api/sync-mobiles", async (req, res) => {
    // This would normally trigger a scraper or API fetch
    // For now, we'll return a success message
    res.json({ message: "Sync triggered successfully" });
  });

  // API 404 Handler
  app.use("/api/*", (req, res) => {
    console.warn(`[API 404] No match for: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: `API route ${req.method} ${req.originalUrl} not found` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
