import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

import {
  catalog,
  createOrder,
  dashboard,
  deleteCategory,
  deleteHero,
  deleteProduct,
  getOrder,
  getProduct,
  getSettings,
  httpError,
  listCategories,
  listHero,
  listOrders,
  listProducts,
  saveCategory,
  saveHero,
  saveProduct,
  setFeatured,
  trackOrder,
  updateOrderStatus,
  updateSettings,
} from "./db.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const distRoot = resolve(root, "dist");
const publicRoot = resolve(root, "public");
const uploadsRoot = resolve(publicRoot, "uploads");
const SESSION_COOKIE = "adhunik_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

function secret() {
  return process.env.SESSION_SECRET || "adhunik-mahal-local-dev-secret";
}

function sign(payload) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function makeSession(email) {
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + SESSION_TTL_SECONDS * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function verifySession(token) {
  if (!token || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  const expected = sign(payload);
  const ok = timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!ok) return null;
  const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (!data.exp || data.exp < Date.now()) return null;
  return data;
}

function cookie(req, name) {
  const raw = req.headers.cookie || "";
  for (const part of raw.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return "";
}

function sessionUser(req) {
  try {
    return verifySession(cookie(req, SESSION_COOKIE));
  } catch {
    return null;
  }
}

function setSession(res, token) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`);
}

function clearSession(res) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

function json(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function text(res, status, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": contentType });
  res.end(body);
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 12 * 1024 * 1024) throw httpError(413, "Request is too large.");
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function requireAdmin(req) {
  const user = sessionUser(req);
  if (!user) throw httpError(401, "Admin login required.");
  return user;
}

function productFilters(searchParams) {
  return {
    q: searchParams.get("q") || "",
    cat: searchParams.get("cat") || "",
    fabric: searchParams.get("fabric") || "",
    occasion: searchParams.get("occasion") || "",
    stock: searchParams.get("stock") || "",
    status: searchParams.get("status") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "",
  };
}

function csvEscape(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function ordersCsv(orders) {
  const rows = [["Order", "Customer", "Phone", "City", "Pincode", "Items", "Status", "Created"]];
  for (const order of orders) {
    rows.push([order.id, order.customerName, order.phone, order.city, order.pincode, order.itemCount, order.status, order.createdAt]);
  }
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

async function uploadImage(body) {
  const { fileName = "upload.jpg", dataUrl = "" } = body;
  const match = String(dataUrl).match(/^data:(image\/(?:png|jpe?g|webp));base64,(.+)$/);
  if (!match) throw httpError(400, "Upload a PNG, JPG, JPEG, or WEBP image.");
  
  try {
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: "adhunik-mahal",
    });
    return { url: result.secure_url };
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw httpError(500, "Image upload failed");
  }
}

async function api(req, res, url) {
  const method = req.method || "GET";
  const path = url.pathname;

  if (method === "GET" && path === "/api/catalog") return json(res, 200, catalog());
  if (method === "GET" && path === "/api/categories") return json(res, 200, { categories: listCategories() });
  if (method === "GET" && path === "/api/hero") return json(res, 200, { heroSlides: listHero() });
  if (method === "GET" && path === "/api/products") return json(res, 200, { products: listProducts(productFilters(url.searchParams)) });
  if (method === "GET" && path.startsWith("/api/products/")) {
    const product = getProduct(decodeURIComponent(path.replace("/api/products/", "")));
    if (!product) throw httpError(404, "Product not found.");
    const related = listProducts({ cat: product.categorySlug }).filter((item) => item.id !== product.id).slice(0, 4);
    return json(res, 200, { product, related });
  }
  if (method === "POST" && path === "/api/orders") {
    const order = createOrder(await readJson(req));
    return json(res, 201, { order, settings: getSettings() });
  }
  if (method === "GET" && path === "/api/orders/track") {
    const order = trackOrder(url.searchParams.get("id"), url.searchParams.get("phone"));
    if (!order) throw httpError(404, "Order not found for those details.");
    return json(res, 200, { order });
  }

  if (method === "POST" && path === "/api/admin/login") {
    const body = await readJson(req);
    if (body.email !== process.env.ADMIN_EMAIL || body.password !== process.env.ADMIN_PASSWORD) {
      throw httpError(401, "Invalid email or password.");
    }
    setSession(res, makeSession(body.email));
    return json(res, 200, { user: { email: body.email } });
  }
  if (method === "POST" && path === "/api/admin/logout") {
    clearSession(res);
    return json(res, 200, { ok: true });
  }
  if (method === "GET" && path === "/api/admin/session") {
    const user = sessionUser(req);
    return json(res, 200, { authenticated: Boolean(user), user });
  }

  if (path.startsWith("/api/admin")) requireAdmin(req);

  if (method === "GET" && path === "/api/admin/dashboard") return json(res, 200, dashboard());
  if (method === "GET" && path === "/api/admin/settings") return json(res, 200, { settings: getSettings() });
  if (method === "PUT" && path === "/api/admin/settings") return json(res, 200, { settings: updateSettings(await readJson(req)) });

  if (method === "GET" && path === "/api/admin/products") return json(res, 200, { products: listProducts(productFilters(url.searchParams), { admin: true }) });
  if (method === "POST" && path === "/api/admin/products") return json(res, 201, { product: saveProduct(await readJson(req)) });
  if (path.startsWith("/api/admin/products/")) {
    const id = decodeURIComponent(path.replace("/api/admin/products/", ""));
    if (method === "PUT") return json(res, 200, { product: saveProduct(await readJson(req), id) });
    if (method === "DELETE") {
      deleteProduct(id);
      return json(res, 200, { ok: true });
    }
  }

  if (method === "GET" && path === "/api/admin/categories") return json(res, 200, { categories: listCategories({ includeInactive: true }) });
  if (method === "POST" && path === "/api/admin/categories") return json(res, 201, { category: saveCategory(await readJson(req)) });
  if (path.startsWith("/api/admin/categories/")) {
    const slug = decodeURIComponent(path.replace("/api/admin/categories/", ""));
    if (method === "PUT") return json(res, 200, { category: saveCategory(await readJson(req), slug) });
    if (method === "DELETE") {
      deleteCategory(slug);
      return json(res, 200, { ok: true });
    }
  }

  if (method === "PUT" && path === "/api/admin/featured") return json(res, 200, { products: setFeatured((await readJson(req)).productIds) });

  if (method === "GET" && path === "/api/admin/hero") return json(res, 200, { heroSlides: listHero({ admin: true }) });
  if (method === "POST" && path === "/api/admin/hero") return json(res, 201, { heroSlide: saveHero(await readJson(req)) });
  if (path.startsWith("/api/admin/hero/")) {
    const id = decodeURIComponent(path.replace("/api/admin/hero/", ""));
    if (method === "PUT") return json(res, 200, { heroSlide: saveHero(await readJson(req), id) });
    if (method === "DELETE") {
      deleteHero(id);
      return json(res, 200, { ok: true });
    }
  }

  if (method === "GET" && path === "/api/admin/orders") return json(res, 200, { orders: listOrders({ q: url.searchParams.get("q") || "", status: url.searchParams.get("status") || "" }) });
  if (method === "GET" && path === "/api/admin/orders/export") {
    res.writeHead(200, { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=adhunik-orders.csv" });
    return res.end(ordersCsv(listOrders()));
  }
  if (path.startsWith("/api/admin/orders/") && method === "PUT") {
    const id = decodeURIComponent(path.replace("/api/admin/orders/", ""));
    return json(res, 200, { order: updateOrderStatus(id, (await readJson(req)).status) });
  }

  if (method === "POST" && path === "/api/admin/uploads") return json(res, 201, await uploadImage(await readJson(req)));

  throw httpError(404, "API route not found.");
}

function serveFile(res, filePath) {
  const extension = extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": mime[extension] || "application/octet-stream" });
  createReadStream(filePath).pipe(res);
}

function serveStatic(req, res, url) {
  const pathname = decodeURIComponent(url.pathname);
  const publicPath = resolve(publicRoot, `.${pathname}`);
  if (publicPath.startsWith(publicRoot) && existsSync(publicPath) && statSync(publicPath).isFile()) {
    return serveFile(res, publicPath);
  }
  const distPath = resolve(distRoot, `.${pathname}`);
  if (distPath.startsWith(distRoot) && existsSync(distPath) && statSync(distPath).isFile()) {
    return serveFile(res, distPath);
  }
  const indexPath = join(distRoot, "index.html");
  if (existsSync(indexPath)) return serveFile(res, indexPath);
  text(res, 503, "Build the app first with npm run build.");
}

export function startServer({ port = Number(process.env.PORT || 8000), apiOnly = false } = {}) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    try {
      if (url.pathname.startsWith("/api/")) return await api(req, res, url);
      if (apiOnly) return text(res, 404, "API server only.");
      return serveStatic(req, res, url);
    } catch (error) {
      const status = error.status || 500;
      json(res, status, { error: error.message || "Server error." });
    }
  });
  server.listen(port, () => {
    console.log(`${apiOnly ? "API" : "Adhunik Mahal"} server listening on http://localhost:${port}`);
  });
  return server;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const apiPort = process.argv.find((arg) => arg.startsWith("--api-port="))?.split("=")[1];
  startServer({ port: Number(apiPort || process.env.PORT || 8000), apiOnly: Boolean(apiPort) });
}

