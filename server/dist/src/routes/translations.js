"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const requireAuth_1 = require("../middleware/requireAuth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
/**
 * GET /api/translations?locale=az
 * Returns all TranslationEntry rows for the given locale, re-assembled into
 * the nested { namespace: { key: value } } shape that next-intl expects.
 */
router.get('/', async (req, res) => {
    const locale = req.query.locale || 'az';
    try {
        const entries = await prisma.translationEntry.findMany({
            where: { locale },
            select: { namespace: true, key: true, value: true },
        });
        // Re-assemble into nested shape: { Navbar: { home: "...", ... }, ... }
        const result = {};
        for (const entry of entries) {
            if (!result[entry.namespace])
                result[entry.namespace] = {};
            // Support dot-nested keys like "slides.slide1.overline"
            const parts = entry.key.split('.');
            let current = result[entry.namespace];
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]])
                    current[parts[i]] = {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = entry.value;
        }
        res.json(result);
    }
    catch (error) {
        console.error('[GET /api/translations] Error:', error);
        res.status(500).json({ error: 'Failed to fetch translations' });
    }
});
/**
 * GET /api/translations/all
 * Returns all entries for all locales, grouped as:
 * [{ namespace, key, locale, value, updatedAt }]
 * Used by the admin editor to show side-by-side AZ/EN/RU.
 */
router.get('/all', async (req, res) => {
    try {
        const entries = await prisma.translationEntry.findMany({
            orderBy: [{ namespace: 'asc' }, { key: 'asc' }, { locale: 'asc' }],
        });
        res.json(entries);
    }
    catch (error) {
        console.error('[GET /api/translations/all] Error:', error);
        res.status(500).json({ error: 'Failed to fetch all translations' });
    }
});
/**
 * PUT /api/translations
 * Bulk upsert. Body: Array of { namespace, key, locale, value }
 */
router.put('/', requireAuth_1.requireAuth, async (req, res) => {
    const updates = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({ error: 'Request body must be a non-empty array of translation updates.' });
    }
    try {
        const results = await Promise.all(updates.map((u) => prisma.translationEntry.upsert({
            where: { namespace_key_locale: { namespace: u.namespace, key: u.key, locale: u.locale } },
            create: { namespace: u.namespace, key: u.key, locale: u.locale, value: u.value },
            update: { value: u.value },
        })));
        res.json({ updated: results.length });
    }
    catch (error) {
        console.error('[PUT /api/translations] Error:', error);
        res.status(500).json({ error: 'Failed to save translations' });
    }
});
exports.default = router;
