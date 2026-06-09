import { DatabaseSync } from "node:sqlite";
import pg from "pg";
const { Pool } = pg;
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import fs from "node:fs";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

for (const file of [".env.local", ".env"]) {
  try {
    const raw = fs.readFileSync(resolve(rootDir, file), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [key, ...rest] = trimmed.split("=");
      if (!process.env[key]) process.env[key] = rest.join("=").trim();
    }
  } catch {}
}

const sqliteDb = new DatabaseSync(join(rootDir, "data", "adhunik-mahal.sqlite"));
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Initialize PG schema first
import { getDb } from "../server/db.mjs";

async function run() {
  console.log("Starting SQLite to PostgreSQL migration...");

  try {
    // Ensure PG tables are created
    await getDb();

    // Categories
    const categories = sqliteDb.prepare("SELECT * FROM categories").all();
    for (const c of categories) {
      await pool.query(`
        INSERT INTO categories (slug, name, description, image_url, active, sort_order, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT(slug) DO NOTHING
      `, [c.slug, c.name, c.description, c.image_url, c.active, c.sort_order, c.created_at, c.updated_at]);
    }
    console.log(`Migrated ${categories.length} categories.`);

    // Products
    const products = sqliteDb.prepare("SELECT * FROM products").all();
    for (const p of products) {
      await pool.query(`
        INSERT INTO products (id, slug, name, category_slug, sku, fabric, occasion, color, description, image_url, gallery_json, featured, status, tag, sort_order, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT(id) DO NOTHING
      `, [p.id, p.slug, p.name, p.category_slug, p.sku, p.fabric, p.occasion, p.color, p.description, p.image_url, p.gallery_json, p.featured, p.status, p.tag, p.sort_order, p.created_at, p.updated_at]);
    }
    console.log(`Migrated ${products.length} products.`);

    // Hero Slides
    const heroSlides = sqliteDb.prepare("SELECT * FROM hero_slides").all();
    for (const h of heroSlides) {
      await pool.query(`
        INSERT INTO hero_slides (id, eyebrow, title, subtitle, image_url, cta_label, cta_href, align, active, sort_order, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT(id) DO NOTHING
      `, [h.id, h.eyebrow, h.title, h.subtitle, h.image_url, h.cta_label, h.cta_href, h.align, h.active, h.sort_order, h.created_at, h.updated_at]);
    }
    console.log(`Migrated ${heroSlides.length} hero slides.`);

    // Orders
    const orders = sqliteDb.prepare("SELECT * FROM orders").all();
    for (const o of orders) {
      await pool.query(`
        INSERT INTO orders (id, customer_name, phone, address, city, pincode, notes, items_json, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT(id) DO NOTHING
      `, [o.id, o.customer_name, o.phone, o.address, o.city, o.pincode, o.notes, o.items_json, o.status, o.created_at, o.updated_at]);
    }
    console.log(`Migrated ${orders.length} orders.`);

    // Store Settings
    const settings = sqliteDb.prepare("SELECT * FROM store_settings").all();
    for (const s of settings) {
      await pool.query(`
        INSERT INTO store_settings (key, value) VALUES ($1, $2)
        ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value
      `, [s.key, s.value]);
    }
    console.log(`Migrated ${settings.length} settings.`);

    console.log("Migration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await pool.end();
    // Also close the pool from db.mjs
    const db = await getDb();
    await db.end();
  }
}

run();
