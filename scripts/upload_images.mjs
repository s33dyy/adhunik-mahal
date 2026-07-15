import { v2 as cloudinary } from "cloudinary";
import pg from "pg";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const uploadAndInsert = async (filePath, name, category_slug, fabric) => {
  console.log(`Uploading ${name}...`);
  const result = await cloudinary.uploader.upload(filePath, { folder: "adhunik-mahal" });
  console.log(`Uploaded: ${result.secure_url}`);
  
  const id = "prod_" + Date.now() + Math.floor(Math.random()*1000);
  const slug = name.toLowerCase().replace(/ /g, "-") + "-" + Date.now().toString().slice(-4);
  const sku = "SKU-" + Date.now().toString().slice(-6);
  const created_at = new Date().toISOString();
  
  await pool.query(
    "INSERT INTO products (id, slug, name, category_slug, sku, fabric, description, image_url, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
    [id, slug, name, category_slug, sku, fabric, `Beautiful authentic ${fabric} Dupatta piece.`, result.secure_url, created_at, created_at]
  );
};

async function main() {
  const dir = "/Users/pratikchoudhuri/.gemini/antigravity/brain/d46144ee-d1d4-4578-a7e4-2a8418154196/";
  await uploadAndInsert(dir + "media__1781028486063.png", "Kantha Stitch Dupatta", "ikkat-dupatta", "Silk");
  await uploadAndInsert(dir + "media__1781028499200.jpg", "Kalamkari Handpaint Dupatta", "ikkat-dupatta", "Cotton");
  await uploadAndInsert(dir + "media__1781028506384.jpg", "Classic Kalamkari Dupatta", "ikkat-dupatta", "Cotton");
  await pool.end();
}

main().catch(console.error);
