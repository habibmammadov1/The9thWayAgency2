/**
 * One-time migration script: reads az.json, en.json, ru.json,
 * filters to only the non-superseded namespaces, and seeds TranslationEntry.
 *
 * Run with: npx ts-node --project tsconfig.json prisma/migrate-translations.ts
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Only migrate these namespaces — all others are superseded by dedicated DB models.
const ALLOWED_NAMESPACES = ["Navbar", "StickyCTA", "Metadata"];

type NestedJson = { [key: string]: string | NestedJson };

/**
 * Flatten a nested JSON object into dot-notation keys.
 * e.g., { Navbar: { home: "Ana səhifə" } } → [{ namespace: "Navbar", key: "home", value: "Ana səhifə" }]
 */
function flattenNamespace(
  obj: NestedJson,
  prefix = ""
): { key: string; value: string }[] {
  const result: { key: string; value: string }[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") {
      result.push({ key: fullKey, value: v });
    } else {
      result.push(...flattenNamespace(v as NestedJson, fullKey));
    }
  }
  return result;
}

async function main() {
  const locales = ["az", "en", "ru"];
  const messagesDir = path.join(
    __dirname,
    "../../src/i18n/messages"
  );

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const locale of locales) {
    const filePath = path.join(messagesDir, `${locale}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filePath} — skipping locale "${locale}"`);
      continue;
    }

    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8")) as NestedJson;

    for (const namespace of ALLOWED_NAMESPACES) {
      if (!(namespace in raw)) {
        console.warn(`  Namespace "${namespace}" not found in ${locale}.json — skipping`);
        continue;
      }

      const entries = flattenNamespace(raw[namespace] as NestedJson);

      for (const { key, value } of entries) {
        try {
          await prisma.translationEntry.upsert({
            where: { namespace_key_locale: { namespace, key, locale } },
            create: { namespace, key, locale, value },
            update: {}, // Never overwrite existing admin-edited values
          });
          totalInserted++;
        } catch (err) {
          console.error(`  ❌ Failed: ${namespace}.${key} [${locale}]`, err);
          totalSkipped++;
        }
      }

      console.log(`  ✅ [${locale}] ${namespace}: ${entries.length} keys processed`);
    }
  }

  console.log(`\n✅ Migration complete. Inserted/verified: ${totalInserted}, Skipped: ${totalSkipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
