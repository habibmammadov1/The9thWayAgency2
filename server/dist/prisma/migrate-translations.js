"use strict";
/**
 * One-time migration script: reads az.json, en.json, ru.json,
 * filters to only the non-superseded namespaces, and seeds TranslationEntry.
 *
 * Run with: npx ts-node --project tsconfig.json prisma/migrate-translations.ts
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prisma = new client_1.PrismaClient();
// Only migrate these namespaces — all others are superseded by dedicated DB models.
const ALLOWED_NAMESPACES = ["Navbar", "StickyCTA", "Metadata"];
/**
 * Flatten a nested JSON object into dot-notation keys.
 * e.g., { Navbar: { home: "Ana səhifə" } } → [{ namespace: "Navbar", key: "home", value: "Ana səhifə" }]
 */
function flattenNamespace(obj, prefix = "") {
    const result = [];
    for (const [k, v] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${k}` : k;
        if (typeof v === "string") {
            result.push({ key: fullKey, value: v });
        }
        else {
            result.push(...flattenNamespace(v, fullKey));
        }
    }
    return result;
}
async function main() {
    const locales = ["az", "en", "ru"];
    const messagesDir = path.join(__dirname, "../../src/i18n/messages");
    let totalInserted = 0;
    let totalSkipped = 0;
    for (const locale of locales) {
        const filePath = path.join(messagesDir, `${locale}.json`);
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️  File not found: ${filePath} — skipping locale "${locale}"`);
            continue;
        }
        const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        for (const namespace of ALLOWED_NAMESPACES) {
            if (!(namespace in raw)) {
                console.warn(`  Namespace "${namespace}" not found in ${locale}.json — skipping`);
                continue;
            }
            const entries = flattenNamespace(raw[namespace]);
            for (const { key, value } of entries) {
                try {
                    await prisma.translationEntry.upsert({
                        where: { namespace_key_locale: { namespace, key, locale } },
                        create: { namespace, key, locale, value },
                        update: {}, // Never overwrite existing admin-edited values
                    });
                    totalInserted++;
                }
                catch (err) {
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
