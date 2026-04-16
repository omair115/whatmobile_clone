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
    try {
      const result = await pool.query('SELECT * FROM mobiles ORDER BY created_at DESC');
      res.json(result.rows);
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
      // Clear existing data (optional, but good for clean seed)
      // await pool.query('DELETE FROM mobiles');
      // await pool.query('DELETE FROM posts');

      const dummyMobiles = [
        {
          id: uuidv4(),
          name: 'Tecno Camon 50 Pro',
          brand: 'Tecno',
          slug: 'tecno-camon-50-pro',
          price: '85999',
          currency: 'Rs.',
          launch_date: 'Mar 2026',
          images: JSON.stringify(['https://picsum.photos/seed/camon50/400/600']),
          specs: JSON.stringify({
            os: 'Android 16 OS',
            dimensions: '162.4 x 77 x 7.4 mm',
            weight: '190g',
            processor: 'Mediatek Helio G200 Ultimate (6 nm)',
            display: '6.78 Inches, Curved AMOLED, 144Hz',
            ram: '8GB RAM',
            storage: '256GB Built-in',
            camera: '50 MP Main + 50 MP Telephoto + 8 MP Ultrawide',
            battery: '6150 mAh, 45W wired'
          }),
          description: 'Tecno Camon 50 Pro is the latest flagship from Tecno with a focus on photography and high-speed display.',
          seo_title: 'Tecno Camon 50 Pro Price in Pakistan & Specs',
          seo_description: 'Check out Tecno Camon 50 Pro price in Pakistan and full specifications.',
          category: 'flagship',
          features: JSON.stringify(['144Hz Display', '50MP Telephoto', '6150mAh Battery'])
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
            os: 'Android 16',
            dimensions: '162.3 x 79.0 x 8.6 mm',
            weight: '232g',
            processor: 'Snapdragon 8 Gen 5',
            display: '6.8 Inches Dynamic AMOLED 2X',
            ram: '16GB',
            storage: '512GB',
            camera: '200MP Quad Camera',
            battery: '5000mAh'
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
            os: 'Android 15',
            processor: 'Helio G99 Ultimate',
            display: '6.78 Inches AMOLED',
            ram: '8GB',
            storage: '256GB',
            camera: '108MP Triple',
            battery: '5000mAh'
          }),
          description: 'Great value for money from Infinix.',
          seo_title: 'Infinix Note 60 Specs & Price',
          seo_description: 'Infinix Note 60 full details.',
          category: 'mid-range',
          features: JSON.stringify(['120Hz', 'Fast Charging'])
        },
        {
          id: uuidv4(),
          name: 'Vivo Y31d',
          brand: 'Vivo',
          slug: 'vivo-y31d',
          price: '57999',
          currency: 'Rs.',
          launch_date: 'Dec 2025',
          images: JSON.stringify(['https://picsum.photos/seed/y31d/400/600']),
          specs: JSON.stringify({
            os: 'Android 14',
            processor: 'Snapdragon 480',
            display: '6.58 Inches LCD',
            ram: '6GB',
            storage: '128GB',
            camera: '13MP Dual',
            battery: '5000mAh'
          }),
          description: 'Budget friendly 5G phone from Vivo.',
          seo_title: 'Vivo Y31d Price in Pakistan',
          seo_description: 'Vivo Y31d specs.',
          category: 'budget',
          features: JSON.stringify(['5G', 'Large Battery'])
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
    const { name, brand, slug, price, currency, launch_date, images, specs, description, seo_title, seo_description, category, features } = req.body;
    try {
      const query = `
        UPDATE mobiles 
        SET name = $1, brand = $2, slug = $3, price = $4, currency = $5, launch_date = $6, 
            images = $7, specs = $8, description = $9, seo_title = $10, seo_description = $11, 
            category = $12, features = $13
        WHERE id = $14
        RETURNING id, slug
      `;
      const values = [name, brand, slug, price, currency, launch_date, JSON.stringify(images), JSON.stringify(specs), description, seo_title, seo_description, category, JSON.stringify(features), req.params.id];
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
    const { title, slug, content, author, image, tags, seo_title, seo_description } = req.body;
    try {
      const query = `
        UPDATE posts 
        SET title = $1, slug = $2, content = $3, author = $4, image = $5, tags = $6, 
            seo_title = $7, seo_description = $8
        WHERE id = $9
        RETURNING id, slug
      `;
      const values = [title, slug, content, author, image, JSON.stringify(tags), seo_title, seo_description, req.params.id];
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
