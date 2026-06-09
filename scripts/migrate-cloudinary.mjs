import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { existsSync } from "node:fs";
import { v2 as cloudinary } from "cloudinary";
import { getDb } from "../server/db.mjs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const publicDir = join(rootDir, "public");

const db = getDb();

async function uploadLocalFile(localUrl) {
  const filePath = join(publicDir, localUrl);
  if (!existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return null;
  }
  console.log(`Uploading ${localUrl}...`);
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder: "adhunik-mahal" });
    return result.secure_url;
  } catch (err) {
    console.error(`Upload failed for ${localUrl}:`, err);
    return null;
  }
}

async function run() {
  console.log("Starting migration to Cloudinary...");
  
  const products = db.prepare("SELECT id, image_url, gallery_json FROM products").all();
  for (const product of products) {
    let updated = false;
    let imageUrl = product.image_url;
    if (imageUrl && imageUrl.startsWith("/")) {
      const newUrl = await uploadLocalFile(imageUrl);
      if (newUrl) {
        imageUrl = newUrl;
        updated = true;
      }
    }
    
    let gallery = JSON.parse(product.gallery_json || "[]");
    let newGallery = [];
    for (const g of gallery) {
      if (g.startsWith("/")) {
        const newG = await uploadLocalFile(g);
        if (newG) {
          newGallery.push(newG);
          updated = true;
        } else {
          newGallery.push(g);
        }
      } else {
        newGallery.push(g);
      }
    }
    
    if (updated) {
      db.prepare("UPDATE products SET image_url = ?, gallery_json = ? WHERE id = ?").run(
        imageUrl, JSON.stringify(newGallery), product.id
      );
      console.log(`Updated product ${product.id}`);
    }
  }

  const heroes = db.prepare("SELECT id, image_url FROM hero_slides").all();
  for (const hero of heroes) {
    let imageUrl = hero.image_url;
    if (imageUrl && imageUrl.startsWith("/")) {
      const newUrl = await uploadLocalFile(imageUrl);
      if (newUrl) {
        db.prepare("UPDATE hero_slides SET image_url = ? WHERE id = ?").run(newUrl, hero.id);
        console.log(`Updated hero ${hero.id}`);
      }
    }
  }
  
  console.log("Migration complete!");
}

run();
