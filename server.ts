import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import pool from './db.js';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini AI (Server-side only)
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
    const { brand, minPrice, maxPrice } = req.query;
    try {
      let query = 'SELECT * FROM mobiles';
      const params: any[] = [];
      const conditions: string[] = [];

      if (brand) {
        conditions.push(`brand ILIKE $${params.length + 1}`);
        params.push(brand);
      }

      if (minPrice) {
        conditions.push(`CAST(price AS INTEGER) >= $${params.length + 1}`);
        params.push(minPrice);
      }

      if (maxPrice) {
        conditions.push(`CAST(price AS INTEGER) <= $${params.length + 1}`);
        params.push(maxPrice);
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

  // Brand Management
  app.get("/api/brands", async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM brands ORDER BY name ASC');
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/brands", async (req, res) => {
    const { name, slug, logo, description } = req.body;
    const id = uuidv4();
    try {
      const result = await pool.query(
        'INSERT INTO brands (id, name, slug, logo, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [id, name, slug, logo, description]
      );
      res.status(201).json(result.rows[0]);
    } catch (err: any) {
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

  // Price Range Management
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
    const { label, minPrice, maxPrice, currency } = req.body;
    const id = uuidv4();
    try {
      const result = await pool.query(
        'INSERT INTO price_ranges (id, label, min_price, max_price, currency) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [id, label, minPrice, maxPrice, currency || 'Rs.']
      );
      res.status(201).json(result.rows[0]);
    } catch (err: any) {
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

  app.get("/api/mobiles/:slug", async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM mobiles WHERE slug = $1', [req.params.slug]);
      if (result.rows.length === 0) return res.status(404).json({ error: "Mobile not found" });
      res.json(result.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/mobiles", async (req, res) => {
    const { name, brand, slug, price, currency, launchDate, images, specs, description, seoTitle, seoDescription, category, features } = req.body;
    const id = uuidv4();
    
    try {
      const query = `
        INSERT INTO mobiles (id, name, brand, slug, price, currency, launch_date, images, specs, description, seo_title, seo_description, category, features)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id, slug
      `;
      const values = [id, name, brand, slug, price, currency, launchDate, JSON.stringify(images), JSON.stringify(specs), description, seoTitle, seoDescription, category, JSON.stringify(features)];
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

      for (const br of dummyBrands) {
        await pool.query(
          'INSERT INTO brands (id, name, slug, logo, description) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (name) DO NOTHING',
          [br.id, br.name, br.slug, br.logo, br.description]
        );
      }

      for (const pr of dummyPriceRanges) {
        await pool.query(
          'INSERT INTO price_ranges (id, label, min_price, max_price, currency) VALUES ($1, $2, $3, $4, $5)',
          [pr.id, pr.label, pr.min_price, pr.max_price, pr.currency]
        );
      }

      for (const m of dummyMobiles) {
        await pool.query(
          `INSERT INTO mobiles (id, name, brand, slug, price, currency, launch_date, images, specs, description, seo_title, seo_description, category, features) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) ON CONFLICT (slug) DO NOTHING`,
          [m.id, m.name, m.brand, m.slug, m.price, m.currency, m.launch_date, m.images, m.specs, m.description, m.seo_title, m.seo_description, m.category, m.features]
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
    const { name, brand, slug, price, currency, launchDate, images, specs, description, seoTitle, seoDescription, category, features } = req.body;
    try {
      const query = `
        UPDATE mobiles 
        SET name = $1, brand = $2, slug = $3, price = $4, currency = $5, launch_date = $6, 
            images = $7, specs = $8, description = $9, seo_title = $10, seo_description = $11, 
            category = $12, features = $13
        WHERE id = $14
        RETURNING id, slug
      `;
      const values = [name, brand, slug, price, currency, launchDate, JSON.stringify(images), JSON.stringify(specs), description, seoTitle, seoDescription, category, JSON.stringify(features), req.params.id];
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
    try {
      const query = `
        UPDATE posts 
        SET title = $1, slug = $2, content = $3, author = $4, image = $5, tags = $6, 
            seo_title = $7, seo_description = $8
        WHERE id = $9
        RETURNING id, slug
      `;
      const values = [title, slug, content, author, image, JSON.stringify(tags), seoTitle, seoDescription, req.params.id];
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
    
    try {
      const query = `
        INSERT INTO posts (id, title, slug, content, author, image, tags, seo_title, seo_description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, slug
      `;
      const values = [id, title, slug, content, author, image, JSON.stringify(tags), seoTitle, seoDescription];
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
