/**
 * Cambia il provider Prisma tra sqlite (dev) e postgresql (produzione).
 * Uso: node scripts/set-db-provider.mjs postgresql
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const provider = process.argv[2];
if (!["sqlite", "postgresql"].includes(provider)) {
  console.error("Uso: node scripts/set-db-provider.mjs <sqlite|postgresql>");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
let schema = fs.readFileSync(schemaPath, "utf8");

schema = schema.replace(/provider = "(sqlite|postgresql)"/, `provider = "${provider}"`);
fs.writeFileSync(schemaPath, schema);
console.log(`✓ Prisma provider impostato su: ${provider}`);
