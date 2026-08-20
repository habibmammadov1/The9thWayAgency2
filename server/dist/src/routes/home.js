"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Schemas for validation
const slideSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    overline: zod_1.z.string(),
    headline: zod_1.z.string(),
    supporting: zod_1.z.string(),
    image: zod_1.z.string().optional(),
});
const heroPayloadSchema = zod_1.z.object({
    slides: zod_1.z.array(slideSchema),
    founderTitle: zod_1.z.string(),
    letsTalk: zod_1.z.string(),
    seePortfolio: zod_1.z.string(),
    founderName: zod_1.z.string(),
    founderImage: zod_1.z.string().optional(),
});
const uniquenessCardSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    icon: zod_1.z.string(),
    title: zod_1.z.string(),
    desc: zod_1.z.string(),
    image: zod_1.z.string().optional(),
});
const uniquenessPayloadSchema = zod_1.z.object({
    sectionTitle: zod_1.z.string().optional(), // Currently not persisted as a single field, can omit or just accept
    cards: zod_1.z.array(uniquenessCardSchema),
});
const statSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    value: zod_1.z.string(),
    label: zod_1.z.string(),
});
const aboutStatsPayloadSchema = zod_1.z.object({
    title: zod_1.z.string(),
    desc: zod_1.z.string(),
    image: zod_1.z.string().optional(),
    stats: zod_1.z.array(statSchema),
});
const socialSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    platform: zod_1.z.string(),
    url: zod_1.z.string(),
});
const footerPayloadSchema = zod_1.z.object({
    stayConnected: zod_1.z.string(),
    desc: zod_1.z.string(),
    contactNow: zod_1.z.string(),
    email: zod_1.z.string().optional(),
    copyright: zod_1.z.string().optional(), // Not currently explicitly in schema, ignored or just add if needed
    socials: zod_1.z.array(socialSchema).optional(),
});
// Middleware for validation
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (err) {
        return res.status(400).json({ error: 'Validation Error', details: err.errors });
    }
};
/**
 * @swagger
 * /api/home/hero:
 *   get:
 *     summary: Get hero slides and team lead
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/hero', async (req, res) => {
    const { locale } = req.query;
    if (!locale)
        return res.status(400).json({ error: 'Locale is required' });
    try {
        const slides = await prisma.heroSlide.findMany({
            where: { locale: String(locale) },
            orderBy: { order: 'asc' },
        });
        const lead = await prisma.heroTeamLead.findUnique({
            where: { locale: String(locale) },
        });
        res.json({
            slides: slides.map((s) => ({ id: s.id, overline: s.overline, headline: s.headline, supporting: s.description, image: s.imageUrl })),
            founderTitle: lead?.role || '',
            letsTalk: lead?.linkLabel || '',
            seePortfolio: 'Portfelimizə Baxın', // Currently not mapped to DB, hardcoded or needs schema change
            founderName: lead?.name || '',
            founderImage: lead?.photoUrl || '',
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/home/hero:
 *   put:
 *     summary: Update hero slides and team lead
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: OK
 */
// TODO: add admin auth middleware
router.put('/hero', validate(heroPayloadSchema), async (req, res) => {
    const { locale } = req.query;
    if (!locale)
        return res.status(400).json({ error: 'Locale is required' });
    const payload = req.body;
    try {
        await prisma.$transaction(async (tx) => {
            // Slides
            await tx.heroSlide.deleteMany({ where: { locale: String(locale) } });
            let order = 1;
            for (const slide of payload.slides) {
                await tx.heroSlide.create({
                    data: {
                        locale: String(locale),
                        order: order++,
                        overline: slide.overline,
                        headline: slide.headline,
                        description: slide.supporting,
                        imageUrl: slide.image,
                    },
                });
            }
            // Lead
            await tx.heroTeamLead.upsert({
                where: { locale: String(locale) },
                create: {
                    locale: String(locale),
                    name: payload.founderName,
                    role: payload.founderTitle,
                    linkLabel: payload.letsTalk,
                    photoUrl: payload.founderImage,
                },
                update: {
                    name: payload.founderName,
                    role: payload.founderTitle,
                    linkLabel: payload.letsTalk,
                    photoUrl: payload.founderImage,
                }
            });
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/home/uniqueness:
 *   get:
 *     summary: Get uniqueness cards
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/uniqueness', async (req, res) => {
    const { locale } = req.query;
    if (!locale)
        return res.status(400).json({ error: 'Locale is required' });
    try {
        const cards = await prisma.uniquenessCard.findMany({
            where: { locale: String(locale) },
            orderBy: { order: 'asc' },
        });
        res.json({
            sectionTitle: 'Niyə The9thway?',
            cards: cards.map((c) => ({ id: c.id, icon: c.icon, title: c.title, desc: c.description, image: c.imageUrl })),
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/home/uniqueness:
 *   put:
 *     summary: Update uniqueness cards
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: OK
 */
// TODO: add admin auth middleware
router.put('/uniqueness', validate(uniquenessPayloadSchema), async (req, res) => {
    const { locale } = req.query;
    if (!locale)
        return res.status(400).json({ error: 'Locale is required' });
    const payload = req.body;
    try {
        await prisma.$transaction(async (tx) => {
            await tx.uniquenessCard.deleteMany({ where: { locale: String(locale) } });
            let order = 1;
            for (const card of payload.cards) {
                await tx.uniquenessCard.create({
                    data: {
                        locale: String(locale),
                        order: order++,
                        icon: card.icon,
                        title: card.title,
                        description: card.desc,
                        imageUrl: card.image,
                    },
                });
            }
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/home/about-stats:
 *   get:
 *     summary: Get about stats
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/about-stats', async (req, res) => {
    const { locale } = req.query;
    if (!locale)
        return res.status(400).json({ error: 'Locale is required' });
    try {
        const content = await prisma.aboutStatsContent.findUnique({
            where: { locale: String(locale) },
        });
        const stats = await prisma.aboutStat.findMany({
            where: { locale: String(locale) },
            orderBy: { order: 'asc' },
        });
        res.json({
            title: content?.heading || '',
            desc: content?.paragraph || '',
            image: content?.imageUrl || '',
            stats: stats.map((s) => ({ id: s.id, value: s.value, label: s.label })),
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/home/about-stats:
 *   put:
 *     summary: Update about stats
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: OK
 */
// TODO: add admin auth middleware
router.put('/about-stats', validate(aboutStatsPayloadSchema), async (req, res) => {
    const { locale } = req.query;
    if (!locale)
        return res.status(400).json({ error: 'Locale is required' });
    const payload = req.body;
    try {
        await prisma.$transaction(async (tx) => {
            await tx.aboutStatsContent.upsert({
                where: { locale: String(locale) },
                create: {
                    locale: String(locale),
                    heading: payload.title,
                    paragraph: payload.desc,
                    imageUrl: payload.image,
                    caption: 'Customer Happiness',
                },
                update: {
                    heading: payload.title,
                    paragraph: payload.desc,
                    imageUrl: payload.image,
                },
            });
            await tx.aboutStat.deleteMany({ where: { locale: String(locale) } });
            let order = 1;
            for (const stat of payload.stats) {
                await tx.aboutStat.create({
                    data: {
                        locale: String(locale),
                        order: order++,
                        value: stat.value,
                        label: stat.label,
                    },
                });
            }
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/home/footer:
 *   get:
 *     summary: Get footer content
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/footer', async (req, res) => {
    const { locale } = req.query;
    if (!locale)
        return res.status(400).json({ error: 'Locale is required' });
    try {
        const content = await prisma.footerContent.findUnique({
            where: { locale: String(locale) },
        });
        const socials = await prisma.footerSocialLink.findMany({
            orderBy: { order: 'asc' },
        });
        res.json({
            stayConnected: content?.connectHeading || '',
            desc: content?.supportingText || '',
            contactNow: content?.ctaLabel || '',
            email: content?.email || '',
            copyright: content?.copyrightText || 'Müəllif hüquqları © The9thway Agency 2026',
            socials: socials.map((s) => ({ id: s.id, platform: s.platform, url: s.url })),
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/home/footer:
 *   put:
 *     summary: Update footer content
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: OK
 */
// TODO: add admin auth middleware
router.put('/footer', validate(footerPayloadSchema), async (req, res) => {
    const { locale } = req.query;
    if (!locale)
        return res.status(400).json({ error: 'Locale is required' });
    const payload = req.body;
    try {
        await prisma.$transaction(async (tx) => {
            await tx.footerContent.upsert({
                where: { locale: String(locale) },
                create: {
                    locale: String(locale),
                    connectHeading: payload.stayConnected,
                    supportingText: payload.desc,
                    email: payload.email || '',
                    ctaLabel: payload.contactNow,
                    copyrightText: payload.copyright,
                },
                update: {
                    connectHeading: payload.stayConnected,
                    supportingText: payload.desc,
                    email: payload.email || '',
                    ctaLabel: payload.contactNow,
                    copyrightText: payload.copyright,
                },
            });
            // Update socials (just replace them for the locale... wait, socials in schema don't have locale! Let's add locale to them or just replace all for now as this is a single instance)
            // Since social links are global across languages usually, but let's just replace all.
            await tx.footerSocialLink.deleteMany();
            let order = 1;
            for (const social of payload.socials || []) {
                await tx.footerSocialLink.create({
                    data: {
                        order: order++,
                        platform: social.platform,
                        url: social.url,
                    },
                });
            }
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/home/footer/social-links:
 *   put:
 *     summary: Update footer social links
 *     responses:
 *       200:
 *         description: OK
 */
// TODO: add admin auth middleware
router.put('/footer/social-links', validate(zod_1.z.object({ socials: zod_1.z.array(socialSchema) })), async (req, res) => {
    const payload = req.body;
    try {
        await prisma.$transaction(async (tx) => {
            await tx.footerSocialLink.deleteMany();
            let order = 1;
            for (const social of payload.socials) {
                await tx.footerSocialLink.create({
                    data: {
                        order: order++,
                        platform: social.platform,
                        url: social.url,
                    },
                });
            }
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
