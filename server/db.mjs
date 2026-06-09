import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function loadLocalEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      const raw = readFileSync(resolve(root, file), "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
        const [key, ...rest] = trimmed.split("=");
        if (!process.env[key]) process.env[key] = rest.join("=").trim();
      }
    } catch {
      // Optional local env files.
    }
  }
}

loadLocalEnv();

const now = () => new Date().toISOString();

const seedCategories = [
  { slug: "silk-sarees", name: "Silk Sarees", imageUrl: "/catalog/saree-raw-silk.jpg", description: "Raw silk, Murshidabad silk, Gadwal, pashmina and soft silk pieces.", sortOrder: 1 },
  { slug: "cotton-sarees", name: "Cotton Sarees", imageUrl: "/catalog/saree-cotton.jpg", description: "Breathable cotton and jamdani drapes for everyday grace.", sortOrder: 2 },
  { slug: "tussar-ghicha", name: "Tussar & Ghicha", imageUrl: "/catalog/saree-tussar.jpg", description: "Earthy tussar, Ghicha Motka and Bhagalpuri textures.", sortOrder: 3 },
  { slug: "ikkat-dupatta", name: "Ikkat & Dupatta Sets", imageUrl: "/catalog/saree-ikkat.jpg", description: "Teliya Rumal Ikkat dupatta sets and coordinated fabric stories.", sortOrder: 4 },
  { slug: "wedding-edit", name: "Wedding Edit", imageUrl: "/catalog/saree-kanchipuram.jpg", description: "Kanchipuram, zari, tissue silk and occasion-ready heirlooms.", sortOrder: 5 },
];

const seedProducts = [
  { id: "p1", slug: "pure-cotton-handloom-saree", name: "Pure Cotton Handloom Saree", categorySlug: "cotton-sarees", sku: "AM-COT-001", fabric: "100% Cotton", occasion: "Daily Wear", color: "Ivory", description: "Crisp pure cotton handloom with thin contrast border. Daily-wear elegance, breathable for Kolkata humidity.", imageUrl: "/catalog/saree-cotton.jpg", featured: true, tag: "Bestseller", sortOrder: 1 },
  { id: "p2", slug: "raw-silk-temple-border-saree", name: "Raw Silk Temple Border Saree", categorySlug: "silk-sarees", sku: "AM-SILK-002", fabric: "Raw Silk", occasion: "Festive", color: "Deep Maroon", description: "Deep maroon raw silk with woven gold temple border. A timeless drape for evening occasions.", imageUrl: "/catalog/saree-raw-silk.jpg", featured: true, tag: "New", sortOrder: 2 },
  { id: "p3", slug: "murshidabad-silk-saree", name: "Murshidabad Silk Saree", categorySlug: "silk-sarees", sku: "AM-SILK-003", fabric: "Murshidabad Silk", occasion: "Festive", color: "Floral", description: "Soft Bengal Murshidabad silk with delicate floral motifs and traditional finish.", imageUrl: "/catalog/saree-murshidabad.jpg", featured: false, sortOrder: 3 },
  { id: "p4", slug: "gachhi-handloom-tussar-saree", name: "Gachhi Handloom Tussar Saree", categorySlug: "tussar-ghicha", sku: "AM-TUS-004", fabric: "Gachhi Tussar Silk", occasion: "Office", color: "Natural Beige", description: "Pure Gachhi handloom tussar with natural sheen, organic texture and a hand-finished Bengal artisan feel.", imageUrl: "/catalog/saree-tussar.jpg", featured: true, sortOrder: 4 },
  { id: "p5", slug: "ghicha-motka-tassar-saree", name: "Ghicha Motka Tassar Saree", categorySlug: "tussar-ghicha", sku: "AM-TUS-005", fabric: "Ghicha Motka Tassar", occasion: "Daily Wear", color: "Earth", description: "Earthy Ghicha Motka tassar with subtle woven booties, modern minimalism and heritage roots.", imageUrl: "/catalog/saree-ghicha.jpg", featured: false, sortOrder: 5 },
  { id: "p6", slug: "manipuri-cotton-jamdani-saree", name: "Manipuri Cotton Jamdani Saree", categorySlug: "cotton-sarees", sku: "AM-COT-006", fabric: "Manipuri Cotton Jamdani", occasion: "Daily Wear", color: "Multicolour", description: "Hand-woven Manipuri cotton jamdani with multi-colour motifs across the body.", imageUrl: "/catalog/saree-jamdani.jpg", featured: false, sortOrder: 6 },
  { id: "p7", slug: "double-warp-soft-silk-saree", name: "Double Warp Soft Silk Saree", categorySlug: "silk-sarees", sku: "AM-SILK-007", fabric: "Double Warp Soft Silk", occasion: "Wedding", color: "Gold", description: "Royal double-warp soft silk with full-length zari border. Drapes like water and holds shape beautifully.", imageUrl: "/catalog/saree-softsilk.jpg", featured: true, tag: "Limited", sortOrder: 7 },
  { id: "p8", slug: "gadwal-silk-saree", name: "Gadwal Silk Saree", categorySlug: "silk-sarees", sku: "AM-SILK-008", fabric: "Gadwal Pure Silk", occasion: "Wedding", color: "Bottle Green", description: "Bottle green Gadwal pure silk with rich gold zari pallu and heirloom craftsmanship.", imageUrl: "/catalog/saree-gadwal.jpg", featured: false, sortOrder: 8 },
  { id: "p9", slug: "pashmina-silk-saree", name: "Pashmina Silk Saree", categorySlug: "silk-sarees", sku: "AM-SILK-009", fabric: "Pashmina Silk", occasion: "Festive", color: "Paisley", description: "Featherweight pashmina silk with intricate paisley work, perfect for winter weddings.", imageUrl: "/catalog/saree-pashmina.jpg", featured: false, sortOrder: 9 },
  { id: "p10", slug: "bhagalpuri-ghicha-digital-print-saree", name: "Bhagalpuri Ghicha Digital Print Saree", categorySlug: "tussar-ghicha", sku: "AM-TUS-010", fabric: "Bhagalpuri Ghicha", occasion: "Daily Wear", color: "Printed", description: "Bhagalpuri Ghicha with crisp digital prints, vibrant, lightweight and easy-care.", imageUrl: "/catalog/saree-bhagalpuri.jpg", featured: false, sortOrder: 10 },
  { id: "p11", slug: "kanchipuram-wedding-tissue-silk-saree", name: "Kanchipuram Wedding Tissue Silk Saree", categorySlug: "wedding-edit", sku: "AM-WED-011", fabric: "Kanchipuram Tissue Silk", occasion: "Wedding", color: "Antique Gold", description: "Pure zari Kanchipuram tissue silk, the bridal heirloom handwoven in Tamil Nadu.", imageUrl: "/catalog/saree-kanchipuram.jpg", featured: false, tag: "Wedding", sortOrder: 11 },
  { id: "p12", slug: "teliya-rumal-ikkat-dupatta-set", name: "Teliya Rumal Ikkat Dupatta Set", categorySlug: "ikkat-dupatta", sku: "AM-IKK-012", fabric: "Teliya Rumal Ikkat Cotton", occasion: "Festive", color: "Ikkat Red", description: "Authentic Teliya Rumal Ikkat dupatta with matching unstitched fabric set.", imageUrl: "/catalog/saree-ikkat.jpg", featured: false, sortOrder: 12 },
];

const seedHero = [
  { id: "hero-1", eyebrow: "Wedding Edit 2026", title: "Heirloom Silks,\nWoven by Hand", subtitle: "Kanchipuram, Gadwal & Banarasi masters with pure zari.", imageUrl: "/catalog/hero-1.jpg", ctaLabel: "Shop Wedding", ctaHref: "/shop?cat=wedding-edit", align: "left", active: true, sortOrder: 1 },
  { id: "hero-2", eyebrow: "Bengal Handloom", title: "Bottle Green\n& Antique Gold", subtitle: "Tussar, Ghicha and Murshidabad silks for the festive season.", imageUrl: "/catalog/hero-2.jpg", ctaLabel: "Explore Handlooms", ctaHref: "/shop?cat=tussar-ghicha", align: "right", active: true, sortOrder: 2 },
  { id: "hero-3", eyebrow: "Temple Border Edit", title: "Crimson, Gold,\nForever.", subtitle: "Hand-woven temple borders crafted for once-in-a-lifetime drapes.", imageUrl: "/catalog/hero-3.jpg", ctaLabel: "Shop Silks", ctaHref: "/shop?cat=silk-sarees", align: "left", active: true, sortOrder: 3 },
];

const seedSettings = {
  name: "Adhunik Mahal",
  tagline: "Handpicked Sarees & Apparel · Kolkata",
  whatsapp: "919830000000",
  whatsappDisplay: "+91 98300 00000",
  email: "hello@adhunikmahal.in",
  address: "Gariahat, Kolkata, West Bengal 700019",
  facebook: "https://www.facebook.com/adhunikmahal",
  instagram: "",
  notice: "Free shipping across India · Cash on Delivery available",
};

function dbPath() {
  const url = process.env.DATABASE_URL || "data/adhunik-mahal.sqlite";
  if (url.startsWith("file:")) return fileURLToPath(url);
  return resolve(root, url);
}

let db;

export function getDb() {
  if (!db) {
    const path = dbPath();
    mkdirSync(dirname(path), { recursive: true });
    db = new DatabaseSync(path);
    db.exec("PRAGMA foreign_keys = ON");
    initialize(db);
  }
  return db;
}

function tableColumns(database, table) {
  try {
    return new Set(database.prepare(`PRAGMA table_info(${table})`).all().map((row) => row.name));
  } catch {
    return new Set();
  }
}

function hasCompatibleSchema(database) {
  const products = tableColumns(database, "products");
  const orders = tableColumns(database, "orders");
  if (products.size === 0 && orders.size === 0) return true;
  return products.has("category_slug") && products.has("image_url") && orders.has("items_json") && !products.has("price");
}

function initialize(database) {
  if (!hasCompatibleSchema(database)) {
    database.exec(`
      DROP TABLE IF EXISTS order_lines;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS categories;
      DROP TABLE IF EXISTS hero_slides;
      DROP TABLE IF EXISTS orders;
      DROP TABLE IF EXISTS store_settings;
    `);
  }

  database.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category_slug TEXT NOT NULL,
      sku TEXT NOT NULL,
      fabric TEXT NOT NULL,
      occasion TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      gallery_json TEXT NOT NULL DEFAULT '[]',
      featured INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      tag TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(category_slug) REFERENCES categories(slug) ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS hero_slides (
      id TEXT PRIMARY KEY,
      eyebrow TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      image_url TEXT NOT NULL,
      cta_label TEXT NOT NULL,
      cta_href TEXT NOT NULL,
      align TEXT NOT NULL DEFAULT 'left',
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      pincode TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      items_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  seedIfEmpty(database);
}

function seedIfEmpty(database) {
  const categoryCount = database.prepare("SELECT COUNT(*) AS count FROM categories").get().count;
  const stamp = now();
  if (categoryCount === 0) {
    const insert = database.prepare(`
      INSERT INTO categories (slug, name, description, image_url, active, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, ?, ?, ?)
    `);
    for (const category of seedCategories) {
      insert.run(category.slug, category.name, category.description, category.imageUrl, category.sortOrder, stamp, stamp);
    }
  }

  const productCount = database.prepare("SELECT COUNT(*) AS count FROM products").get().count;
  if (productCount === 0) {
    const insert = database.prepare(`
      INSERT INTO products (
        id, slug, name, category_slug, sku, fabric, occasion, color, description,
        image_url, gallery_json, featured, status, tag, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
    `);
    for (const product of seedProducts) {
      insert.run(
        product.id,
        product.slug,
        product.name,
        product.categorySlug,
        product.sku,
        product.fabric,
        product.occasion,
        product.color,
        product.description,
        product.imageUrl,
        JSON.stringify([product.imageUrl]),
        product.featured ? 1 : 0,
        product.tag ?? null,
        product.sortOrder,
        stamp,
        stamp
      );
    }
  }

  const heroCount = database.prepare("SELECT COUNT(*) AS count FROM hero_slides").get().count;
  if (heroCount === 0) {
    const insert = database.prepare(`
      INSERT INTO hero_slides (id, eyebrow, title, subtitle, image_url, cta_label, cta_href, align, active, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const slide of seedHero) {
      insert.run(slide.id, slide.eyebrow, slide.title, slide.subtitle, slide.imageUrl, slide.ctaLabel, slide.ctaHref, slide.align, slide.active ? 1 : 0, slide.sortOrder, stamp, stamp);
    }
  }

  const settingsCount = database.prepare("SELECT COUNT(*) AS count FROM store_settings").get().count;
  if (settingsCount === 0) {
    const insert = database.prepare("INSERT INTO store_settings (key, value) VALUES (?, ?)");
    for (const [key, value] of Object.entries(seedSettings)) insert.run(key, String(value));
  }
}

const parseJson = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

function productFromRow(row) {
  const gallery = parseJson(row.gallery_json, []);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categorySlug: row.category_slug,
    category: row.category_slug,
    sku: row.sku,
    fabric: row.fabric,
    occasion: row.occasion,
    color: row.color,
    description: row.description,
    imageUrl: row.image_url,
    image: row.image_url,
    gallery: gallery.length ? gallery : [row.image_url],
    featured: Boolean(row.featured),
    inStock: row.status === "active",
    status: row.status,
    tag: row.tag ?? undefined,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function categoryFromRow(row) {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    image: row.image_url,
    active: Boolean(row.active),
    count: row.product_count ?? 0,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function heroFromRow(row) {
  return {
    id: row.id,
    eyebrow: row.eyebrow,
    title: row.title,
    subtitle: row.subtitle,
    imageUrl: row.image_url,
    img: row.image_url,
    ctaLabel: row.cta_label,
    cta: row.cta_label,
    ctaHref: row.cta_href,
    to: row.cta_href,
    align: row.align,
    active: Boolean(row.active),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || randomUUID().slice(0, 8);
}

function uniqueSlug(database, table, base, currentId, idColumn = "id") {
  let slug = slugify(base);
  let attempt = slug;
  let i = 2;
  while (true) {
    const row = database.prepare(`SELECT ${idColumn} AS id FROM ${table} WHERE slug = ?`).get(attempt);
    if (!row || row.id === currentId) return attempt;
    attempt = `${slug}-${i++}`;
  }
}

export function getSettings() {
  const rows = getDb().prepare("SELECT key, value FROM store_settings").all();
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export function updateSettings(values) {
  const database = getDb();
  const stmt = database.prepare("INSERT INTO store_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  for (const [key, value] of Object.entries(values)) stmt.run(key, String(value ?? ""));
  return getSettings();
}

export function listCategories({ includeInactive = false } = {}) {
  const where = includeInactive ? "" : "WHERE c.active = 1";
  return getDb().prepare(`
    SELECT c.*, COUNT(p.id) AS product_count
    FROM categories c
    LEFT JOIN products p ON p.category_slug = c.slug AND p.status = 'active'
    ${where}
    GROUP BY c.slug
    ORDER BY c.sort_order ASC, c.name ASC
  `).all().map(categoryFromRow);
}

export function saveCategory(input, existingSlug) {
  const database = getDb();
  const stamp = now();
  const slug = existingSlug || uniqueSlug(database, "categories", input.slug || input.name, null, "slug");
  const current = existingSlug ? database.prepare("SELECT * FROM categories WHERE slug = ?").get(existingSlug) : null;
  if (!input.name || !input.imageUrl) throw httpError(400, "Category name and image are required.");
  if (current) {
    database.prepare(`
      UPDATE categories SET name = ?, description = ?, image_url = ?, active = ?, sort_order = ?, updated_at = ? WHERE slug = ?
    `).run(input.name, input.description ?? "", input.imageUrl, input.active === false ? 0 : 1, Number(input.sortOrder ?? current.sort_order ?? 0), stamp, existingSlug);
    return listCategories({ includeInactive: true }).find((category) => category.slug === existingSlug);
  }
  database.prepare(`
    INSERT INTO categories (slug, name, description, image_url, active, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(slug, input.name, input.description ?? "", input.imageUrl, input.active === false ? 0 : 1, Number(input.sortOrder ?? 0), stamp, stamp);
  return listCategories({ includeInactive: true }).find((category) => category.slug === slug);
}

export function deleteCategory(slug) {
  const database = getDb();
  const used = database.prepare("SELECT COUNT(*) AS count FROM products WHERE category_slug = ?").get(slug).count;
  if (used > 0) throw httpError(409, "Move or delete products before deleting this category.");
  database.prepare("DELETE FROM categories WHERE slug = ?").run(slug);
}

export function listProducts(filters = {}, { admin = false } = {}) {
  const clauses = [];
  const params = [];
  if (!admin) clauses.push("status = 'active'");
  if (filters.status && admin && filters.status !== "all") {
    clauses.push("status = ?");
    params.push(filters.status);
  }
  if (filters.cat) {
    clauses.push("category_slug = ?");
    params.push(filters.cat);
  }
  if (filters.q) {
    clauses.push("(name LIKE ? OR sku LIKE ? OR fabric LIKE ? OR occasion LIKE ? OR color LIKE ?)");
    const q = `%${filters.q}%`;
    params.push(q, q, q, q, q);
  }
  if (filters.fabric) {
    clauses.push("fabric = ?");
    params.push(filters.fabric);
  }
  if (filters.occasion) {
    clauses.push("occasion = ?");
    params.push(filters.occasion);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const sortMap = {
    newest: "created_at DESC",
    name: "name ASC",
    featured: "featured DESC, sort_order ASC",
  };
  const orderBy = sortMap[filters.sort] || "sort_order ASC, created_at DESC";
  return getDb().prepare(`SELECT * FROM products ${where} ORDER BY ${orderBy}`).all(...params).map(productFromRow);
}

export function getProduct(slugOrId, { admin = false } = {}) {
  const row = getDb().prepare(`
    SELECT * FROM products WHERE (slug = ? OR id = ?) ${admin ? "" : "AND status = 'active'"}
  `).get(slugOrId, slugOrId);
  return row ? productFromRow(row) : null;
}

export function saveProduct(input, id) {
  const database = getDb();
  const stamp = now();
  const current = id ? database.prepare("SELECT * FROM products WHERE id = ?").get(id) : null;
  const category = database.prepare("SELECT slug FROM categories WHERE slug = ?").get(input.categorySlug || input.category);
  if (!category) throw httpError(400, "Choose a valid category.");
  if (!input.name || !input.sku || !input.imageUrl) throw httpError(400, "Product name, SKU and image are required.");
  const productId = current?.id || input.id || randomUUID();
  if (input.featured) {
    const featuredCount = database.prepare("SELECT COUNT(*) AS count FROM products WHERE featured = 1 AND id != ?").get(productId).count;
    if (featuredCount >= 4) throw httpError(400, "Only 4 products can be featured. Use the Featured screen to replace one.");
  }
  const slug = current ? uniqueSlug(database, "products", input.slug || input.name, current.id) : uniqueSlug(database, "products", input.slug || input.name);
  const gallery = Array.isArray(input.gallery) && input.gallery.length ? input.gallery : [input.imageUrl];
  const values = [
    slug,
    input.name,
    input.categorySlug || input.category,
    input.sku,
    input.fabric || "",
    input.occasion || "",
    input.color || "",
    input.description || "",
    input.imageUrl,
    JSON.stringify(gallery),
    input.featured ? 1 : 0,
    input.status || "active",
    input.tag || null,
    Number(input.sortOrder ?? current?.sort_order ?? 0),
    stamp,
  ];
  if (current) {
    database.prepare(`
      UPDATE products SET slug = ?, name = ?, category_slug = ?, sku = ?, fabric = ?,
        occasion = ?, color = ?, description = ?, image_url = ?, gallery_json = ?, featured = ?,
        status = ?, tag = ?, sort_order = ?, updated_at = ? WHERE id = ?
    `).run(...values, id);
  } else {
    database.prepare(`
      INSERT INTO products (
        slug, name, category_slug, sku, fabric, occasion, color, description, image_url,
        gallery_json, featured, status, tag, sort_order, updated_at, id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(...values, productId, stamp);
  }
  return getProduct(productId, { admin: true });
}

export function deleteProduct(id) {
  getDb().prepare("DELETE FROM products WHERE id = ?").run(id);
}

export function setFeatured(productIds) {
  if (!Array.isArray(productIds) || productIds.length !== 4) throw httpError(400, "Choose exactly 4 featured products.");
  const database = getDb();
  database.exec("BEGIN");
  try {
    database.prepare("UPDATE products SET featured = 0, updated_at = ?").run(now());
    const stmt = database.prepare("UPDATE products SET featured = 1, updated_at = ? WHERE id = ?");
    for (const id of productIds) stmt.run(now(), id);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  return listProducts({}, { admin: true });
}

export function listHero({ admin = false } = {}) {
  const where = admin ? "" : "WHERE active = 1";
  return getDb().prepare(`SELECT * FROM hero_slides ${where} ORDER BY sort_order ASC`).all().map(heroFromRow);
}

export function saveHero(input, id) {
  const database = getDb();
  const stamp = now();
  const current = id ? database.prepare("SELECT * FROM hero_slides WHERE id = ?").get(id) : null;
  if (!input.title || !input.imageUrl) throw httpError(400, "Hero title and image are required.");
  const heroId = current?.id || input.id || randomUUID();
  const values = [
    input.eyebrow || "",
    input.title,
    input.subtitle || "",
    input.imageUrl,
    input.ctaLabel || "Shop Now",
    input.ctaHref || "/shop",
    input.align === "right" ? "right" : "left",
    input.active === false ? 0 : 1,
    Number(input.sortOrder ?? current?.sort_order ?? 0),
    stamp,
  ];
  if (current) {
    database.prepare(`
      UPDATE hero_slides SET eyebrow = ?, title = ?, subtitle = ?, image_url = ?, cta_label = ?, cta_href = ?,
        align = ?, active = ?, sort_order = ?, updated_at = ? WHERE id = ?
    `).run(...values, id);
  } else {
    database.prepare(`
      INSERT INTO hero_slides (eyebrow, title, subtitle, image_url, cta_label, cta_href, align, active, sort_order, updated_at, id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(...values, heroId, stamp);
  }
  return listHero({ admin: true }).find((slide) => slide.id === heroId);
}

export function deleteHero(id) {
  getDb().prepare("DELETE FROM hero_slides WHERE id = ?").run(id);
}

export function createOrder(input) {
  const database = getDb();
  const items = Array.isArray(input.items) ? input.items : [];
  if (!input.name || !input.phone || !input.address || !input.city || !input.pincode) throw httpError(400, "Delivery details are incomplete.");
  if (items.length === 0) throw httpError(400, "Cart is empty.");
  const productStmt = database.prepare("SELECT * FROM products WHERE id = ? AND status = 'active'");
  const orderItems = items.map((item) => {
    const product = productStmt.get(item.productId || item.id);
    if (!product) throw httpError(400, "A product in the cart is no longer available.");
    const qty = Math.max(1, Number(item.qty || item.quantity || 1));
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      imageUrl: product.image_url,
      qty,
    };
  });
  const id = `AM${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const stamp = now();
  database.prepare(`
    INSERT INTO orders (id, customer_name, phone, address, city, pincode, notes, items_json, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `).run(id, input.name, input.phone, input.address, input.city, input.pincode, input.notes || "", JSON.stringify(orderItems), stamp, stamp);
  return getOrder(id);
}

function orderFromRow(row) {
  const items = parseJson(row.items_json, []);
  return {
    id: row.id,
    customerName: row.customer_name,
    name: row.customer_name,
    phone: row.phone,
    address: row.address,
    city: row.city,
    pincode: row.pincode,
    notes: row.notes,
    items,
    itemCount: items.reduce((sum, item) => sum + Number(item.qty || 0), 0),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getOrder(id) {
  const row = getDb().prepare("SELECT * FROM orders WHERE id = ?").get(id);
  return row ? orderFromRow(row) : null;
}

export function trackOrder(id, phone) {
  const order = getOrder(id);
  if (!order) return null;
  const expected = String(order.phone).replace(/\D/g, "");
  const actual = String(phone || "").replace(/\D/g, "");
  return expected.endsWith(actual.slice(-10)) || actual.endsWith(expected.slice(-10)) ? order : null;
}

export function listOrders({ q = "", status = "" } = {}) {
  const clauses = [];
  const params = [];
  if (status && status !== "all") {
    clauses.push("status = ?");
    params.push(status);
  }
  if (q) {
    clauses.push("(id LIKE ? OR customer_name LIKE ? OR phone LIKE ? OR city LIKE ?)");
    const query = `%${q}%`;
    params.push(query, query, query, query);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return getDb().prepare(`SELECT * FROM orders ${where} ORDER BY created_at DESC`).all(...params).map(orderFromRow);
}

export function updateOrderStatus(id, status) {
  const allowed = new Set(["pending", "confirmed", "shipped", "delivered", "cancelled"]);
  if (!allowed.has(status)) throw httpError(400, "Invalid status.");
  getDb().prepare("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?").run(status, now(), id);
  return getOrder(id);
}

export function dashboard() {
  const database = getDb();
  const orders = listOrders();
  const productCount = database.prepare("SELECT COUNT(*) AS count FROM products").get().count;
  const activeProductCount = database.prepare("SELECT COUNT(*) AS count FROM products WHERE status = 'active'").get().count;
  const categoryCount = database.prepare("SELECT COUNT(*) AS count FROM categories").get().count;
  const topProducts = listProducts({}, { admin: true }).slice(0, 5).map((product) => {
    const sold = orders.reduce((sum, order) => sum + order.items.filter((item) => item.productId === product.id).reduce((s, item) => s + item.qty, 0), 0);
    return { ...product, sold };
  }).sort((a, b) => b.sold - a.sold || a.sortOrder - b.sortOrder);
  return {
    stats: {
      orders: orders.length,
      productCount,
      activeProductCount,
      categoryCount,
      customers: new Set(orders.map((order) => order.phone)).size,
    },
    recentOrders: orders.slice(0, 8),
    topProducts,
  };
}

export function catalog() {
  const products = listProducts();
  return {
    categories: listCategories(),
    products,
    featuredProducts: products.filter((product) => product.featured).slice(0, 4),
    heroSlides: listHero(),
    settings: getSettings(),
  };
}

export function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}
