import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("local SQLite store", () => {
  let cleanupPath = "";
  let store: typeof import("../../server/db.mjs");

  beforeAll(async () => {
    cleanupPath = mkdtempSync(join(tmpdir(), "adhunik-store-"));
    process.env.DATABASE_URL = join(cleanupPath, "test.sqlite");
    store = await import("../../server/db.mjs");
  });

  afterAll(() => {
    if (cleanupPath) rmSync(cleanupPath, { recursive: true, force: true });
  });

  it("seeds catalog data with exactly four homepage featured products", () => {
    const catalog = store.catalog();

    expect(catalog.products).toHaveLength(12);
    expect(catalog.categories).toHaveLength(5);
    expect(catalog.heroSlides).toHaveLength(3);
    expect(catalog.featuredProducts).toHaveLength(4);
  });

  it("saves checkout orders and tracks them by order id and phone", () => {
    const order = store.createOrder({
      name: "Riya Sengupta",
      phone: "+91 98300 12345",
      address: "12 Lake Road",
      city: "Kolkata",
      pincode: "700019",
      notes: "Gift wrap",
      items: [{ productId: "p1", qty: 2 }],
    });

    expect(order.id).toMatch(/^AM/);
    expect(order.total).toBe(3700);
    expect(store.trackOrder(order.id, "9830012345")?.id).toBe(order.id);
    expect(store.listOrders({ q: "Riya" })[0].id).toBe(order.id);
  });

  it("enforces exactly four featured products", () => {
    expect(() => store.setFeatured(["p1", "p2"])).toThrow("Choose exactly 4 featured products.");

    const products = store.setFeatured(["p3", "p4", "p5", "p6"]);
    expect(products.filter((product) => product.featured).map((product) => product.id)).toEqual(["p3", "p4", "p5", "p6"]);
  });
});
