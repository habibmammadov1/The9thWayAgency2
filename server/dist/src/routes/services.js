"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/ping', (req, res) => { res.send('pong from services'); });
// Schemas for validation
const servicesIntroSchema = zod_1.z.object({
    pillLabel: zod_1.z.string(),
    heading: zod_1.z.string(),
    ctaLabel: zod_1.z.string(),
});
const serviceSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    icon: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    bullets: zod_1.z.array(zod_1.z.string()),
    imageUrl: zod_1.z.string().optional(),
});
const servicesListPayloadSchema = zod_1.z.object({
    services: zod_1.z.array(serviceSchema),
});
const industrySchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    name: zod_1.z.string(),
});
const whyChooseUsBundleSchema = zod_1.z.object({
    intro: zod_1.z.object({
        pillLabel: zod_1.z.string(),
        heading: zod_1.z.string(),
        paragraph: zod_1.z.string(),
    }),
    industries: zod_1.z.array(industrySchema),
    statHighlight: zod_1.z.object({
        value: zod_1.z.string(),
        label: zod_1.z.string(),
        ctaText: zod_1.z.string(),
        ctaLinkLabel: zod_1.z.string(),
        imageUrl: zod_1.z.string().optional(),
    }),
    whyChooseUsCard: zod_1.z.object({
        heading: zod_1.z.string(),
        paragraph: zod_1.z.string(),
        checklistItems: zod_1.z.array(zod_1.z.string()),
        ctaLabel: zod_1.z.string(),
    }),
    happyClientsCard: zod_1.z.object({
        percentage: zod_1.z.string(),
        label: zod_1.z.string(),
        clientCount: zod_1.z.string(),
        avatarUrls: zod_1.z.array(zod_1.z.string()),
    }),
    supportCard: zod_1.z.object({
        badge: zod_1.z.string(),
        heading: zod_1.z.string(),
        description: zod_1.z.string(),
    }),
});
/**
 * @swagger
 * /api/services/intro:
 *   get:
 *     summary: Get Services Intro
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *         description: Locale (e.g. az, en, ru)
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/intro', async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const data = await prisma.servicesIntro.findUnique({ where: { locale } });
        if (!data) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.json(data);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
/**
 * @swagger
 * /api/services/intro:
 *   put:
 *     summary: Update Services Intro
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pillLabel:
 *                 type: string
 *               heading:
 *                 type: string
 *               ctaLabel:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/intro', async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const body = servicesIntroSchema.parse(req.body);
        const updated = await prisma.servicesIntro.upsert({
            where: { locale },
            update: body,
            create: { locale, ...body },
        });
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Bad request' });
    }
});
/**
 * @swagger
 * /api/services/list:
 *   get:
 *     summary: Get Services List
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/list', async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const services = await prisma.service.findMany({
            where: { locale },
            orderBy: { order: 'asc' },
        });
        res.json({ services });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
/**
 * @swagger
 * /api/services/list:
 *   put:
 *     summary: Replace Services List
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/list', async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const body = servicesListPayloadSchema.parse(req.body);
        await prisma.$transaction(async (tx) => {
            await tx.service.deleteMany({ where: { locale } });
            let order = 1;
            for (const item of body.services) {
                await tx.service.create({
                    data: {
                        locale,
                        order: order++,
                        icon: item.icon,
                        title: item.title,
                        description: item.description,
                        bullets: item.bullets,
                        imageUrl: item.imageUrl || '',
                    },
                });
            }
        });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Bad request' });
    }
});
/**
 * @swagger
 * /api/services/why-choose-us:
 *   get:
 *     summary: Get Why Choose Us Bundle
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/why-choose-us', async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const [intro, industries, statHighlight, whyChooseUsCard, happyClientsCard, supportCard] = await Promise.all([
            prisma.whyChooseUsIntro.findUnique({ where: { locale } }),
            prisma.industry.findMany({ where: { locale }, orderBy: { order: 'asc' } }),
            prisma.statHighlightCard.findUnique({ where: { locale } }),
            prisma.whyChooseUsCard.findUnique({ where: { locale } }),
            prisma.happyClientsCard.findUnique({ where: { locale } }),
            prisma.supportCard.findUnique({ where: { locale } }),
        ]);
        res.json({
            intro: intro || null,
            industries: industries || [],
            statHighlight: statHighlight || null,
            whyChooseUsCard: whyChooseUsCard || null,
            happyClientsCard: happyClientsCard || null,
            supportCard: supportCard || null,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
/**
 * @swagger
 * /api/services/why-choose-us:
 *   put:
 *     summary: Update Why Choose Us Bundle
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/why-choose-us', async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const body = whyChooseUsBundleSchema.parse(req.body);
        await prisma.$transaction(async (tx) => {
            await tx.whyChooseUsIntro.upsert({
                where: { locale },
                update: body.intro,
                create: { locale, ...body.intro },
            });
            await tx.industry.deleteMany({ where: { locale } });
            let order = 1;
            for (const item of body.industries) {
                await tx.industry.create({
                    data: {
                        locale,
                        order: order++,
                        name: item.name,
                    },
                });
            }
            await tx.statHighlightCard.upsert({
                where: { locale },
                update: body.statHighlight,
                create: { locale, ...body.statHighlight },
            });
            await tx.whyChooseUsCard.upsert({
                where: { locale },
                update: body.whyChooseUsCard,
                create: { locale, ...body.whyChooseUsCard },
            });
            await tx.happyClientsCard.upsert({
                where: { locale },
                update: body.happyClientsCard,
                create: { locale, ...body.happyClientsCard },
            });
            await tx.supportCard.upsert({
                where: { locale },
                update: body.supportCard,
                create: { locale, ...body.supportCard },
            });
        });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Bad request' });
    }
});
exports.default = router;
