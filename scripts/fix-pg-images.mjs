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

async function run() {
  console.log("Fixing image URLs...");
  try {
    const categories = sqliteDb.prepare("SELECT slug, image_url FROM categories").all();
    for (const c of categories) await pool.query("UPDATE categories SET image_url = $1 WHERE slug = $2", [c.image_url, c.slug]);
    
    const products = sqliteDb.prepare("SELECT id, image_url, gallery_json FROM products").all();
    for (const p of products) await pool.query("UPDATE products SET image_url = $1, gallery_json = $2 WHERE id = $3", [p.image_url, p.gallery_json, p.id]);
    
    const heroSlides = sqliteDb.prepare("SELECT id, image_url FROM hero_slides").all();
    for (const h of heroSlides) await pool.query("UPDATE hero_slides SET image_url = $1 WHERE id = $2", [h.image_url, h.id]);
    
    console.log("Fixed images!");
  } finally {
    await pool.end();
  }
}
run();
