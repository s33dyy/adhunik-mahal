import fs from "fs";

let content = fs.readFileSync("server/db.mjs", "utf8");

// 1. Replace DatabaseSync with pg
content = content.replace(/import \{ DatabaseSync \} from "node:sqlite";/g, 'import pg from "pg";\nconst { Pool } = pg;');

// 2. Replace getDb logic
content = content.replace(/let db;\n\nexport function getDb\(\) \{[\s\S]*?return db;\n\}/m, `let db;
export async function getDb() {
  if (!db) {
    const connectionString = process.env.DATABASE_URL;
    db = new Pool({ connectionString });
    await initialize(db);
  }
  return db;
}`);

// 3. Make all exported functions async and await getDb()
content = content.replace(/export function/g, "export async function");
content = content.replace(/const database = getDb\(\);/g, "const database = await getDb();");
content = content.replace(/getDb\(\)\.prepare/g, "(await getDb()).query");

// 4. Update the hasCompatibleSchema logic
content = content.replace(/function hasCompatibleSchema\([\s\S]*?\}\n/m, `async function hasCompatibleSchema(database) {
  const res = await database.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  const tables = res.rows.map(r => r.table_name);
  return tables.includes('products') && tables.includes('orders');
}
`);

// 5. Update initialize to be async
content = content.replace(/function initialize/g, "async function initialize");
content = content.replace(/if \(!hasCompatibleSchema\(database\)\)/g, "if (!(await hasCompatibleSchema(database)))");
content = content.replace(/database\.exec\(`/g, "await database.query(`");
content = content.replace(/seedIfEmpty\(database\);/g, "await seedIfEmpty(database);");

// 6. Update seedIfEmpty
content = content.replace(/function seedIfEmpty/g, "async function seedIfEmpty");

// 7. Update query conversions - this is complex because sqlite .prepare(sql).get(...params) vs pg .query(sql, [...params])
// Let's write a smarter regex or just use pg's format.
// Wait, we can't easily regex ? to $1, $2. We have to do it manually for all queries.

fs.writeFileSync("server/db.pg.mjs", content);
console.log("Initial replacement done.");
