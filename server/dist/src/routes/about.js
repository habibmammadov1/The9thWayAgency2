"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const requireAuth_1 = require("../middleware/requireAuth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Validation Schemas
const validate = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    }
    catch (err) {
        res.status(400).json({ error: err.errors || 'Validation Error' });
    }
};
const studioIntroSchema = zod_1.z.object({
    overline: zod_1.z.string().min(1),
    heading: zod_1.z.string().min(1),
    paragraph: zod_1.z.string().min(1),
    image1Url: zod_1.z.string().nullable().optional(),
    image2Url: zod_1.z.string().nullable().optional(),
});
const whatWeBuildFeatureSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    icon: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    order: zod_1.z.number().int(),
});
const whatWeBuildSchema = zod_1.z.object({
    content: zod_1.z.object({
        mainImageUrl: zod_1.z.string().nullable().optional(),
        statValue: zod_1.z.string().min(1),
        statLabel: zod_1.z.string().min(1),
        statAvatarUrls: zod_1.z.array(zod_1.z.string()),
        statCaption: zod_1.z.string().min(1),
        heading: zod_1.z.string().min(1),
        paragraph: zod_1.z.string().min(1),
        ctaLabel: zod_1.z.string().min(1),
    }),
    features: zod_1.z.array(whatWeBuildFeatureSchema),
});
const recommendationSnippetSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    type: zod_1.z.enum(['quote', 'stat']),
    text: zod_1.z.string().min(1),
    value: zod_1.z.string().nullable().optional(),
    avatarUrl: zod_1.z.string().nullable().optional(),
    order: zod_1.z.number().int(),
});
const missionVisionSchema = zod_1.z.object({
    content: zod_1.z.object({
        statValue: zod_1.z.string().min(1),
        statLabel: zod_1.z.string().min(1),
        statAvatarUrls: zod_1.z.array(zod_1.z.string()),
        statCaption: zod_1.z.string().min(1),
        missionLabel: zod_1.z.string().min(1),
        missionText: zod_1.z.string().min(1),
        visionLabel: zod_1.z.string().min(1),
        visionText: zod_1.z.string().min(1),
    }),
    snippets: zod_1.z.array(recommendationSnippetSchema),
});
/**
 * @swagger
 * /api/about/studio-intro:
 *   get:
 *     summary: Get Studio Intro content
 *     tags: [About]
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
router.get('/studio-intro', async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const content = await prisma.studioIntroContent.findUnique({
            where: { locale },
        });
        if (!content) {
            res.status(404).json({ error: 'Studio Intro content not found' });
            return;
        }
        res.json(content);
    }
    catch (error) {
        console.error('Error fetching studio intro:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/about/studio-intro:
 *   put:
 *     summary: Update Studio Intro content
 *     tags: [About]
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/studio-intro', requireAuth_1.requireAuth, validate(studioIntroSchema), async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const payload = req.body;
        const updated = await prisma.studioIntroContent.upsert({
            where: { locale },
            create: {
                locale,
                overline: payload.overline,
                heading: payload.heading,
                paragraph: payload.paragraph,
                image1Url: payload.image1Url || null,
                image2Url: payload.image2Url || null,
            },
            update: {
                overline: payload.overline,
                heading: payload.heading,
                paragraph: payload.paragraph,
                image1Url: payload.image1Url || null,
                image2Url: payload.image2Url || null,
            },
        });
        res.json(updated);
    }
    catch (error) {
        console.error('Error updating studio intro:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/about/what-we-build:
 *   get:
 *     summary: Get What We Build content and features
 *     tags: [About]
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
router.get('/what-we-build', async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const [content, features] = await Promise.all([
            prisma.whatWeBuildContent.findUnique({ where: { locale } }),
            prisma.whatWeBuildFeature.findMany({
                where: { locale },
                orderBy: { order: 'asc' },
            }),
        ]);
        res.json({ content, features });
    }
    catch (error) {
        console.error('Error fetching what we build content:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/about/what-we-build:
 *   put:
 *     summary: Replace What We Build content and features
 *     tags: [About]
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/what-we-build', requireAuth_1.requireAuth, validate(whatWeBuildSchema), async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const payload = req.body;
        // 1. Upsert Content
        const updatedContent = await prisma.whatWeBuildContent.upsert({
            where: { locale },
            create: {
                locale,
                mainImageUrl: payload.content.mainImageUrl || null,
                statValue: payload.content.statValue,
                statLabel: payload.content.statLabel,
                statAvatarUrls: payload.content.statAvatarUrls,
                statCaption: payload.content.statCaption,
                heading: payload.content.heading,
                paragraph: payload.content.paragraph,
                ctaLabel: payload.content.ctaLabel,
            },
            update: {
                mainImageUrl: payload.content.mainImageUrl || null,
                statValue: payload.content.statValue,
                statLabel: payload.content.statLabel,
                statAvatarUrls: payload.content.statAvatarUrls,
                statCaption: payload.content.statCaption,
                heading: payload.content.heading,
                paragraph: payload.content.paragraph,
                ctaLabel: payload.content.ctaLabel,
            },
        });
        // 2. Sync Features List
        const incomingFeatureIds = payload.features.map((f) => f.id).filter(Boolean);
        // Delete missing items for this locale
        await prisma.whatWeBuildFeature.deleteMany({
            where: {
                locale,
                NOT: { id: { in: incomingFeatureIds } },
            },
        });
        // Upsert remaining items
        const updatedFeatures = [];
        for (const feat of payload.features) {
            if (feat.id) {
                const updated = await prisma.whatWeBuildFeature.update({
                    where: { id: feat.id },
                    data: {
                        icon: feat.icon,
                        title: feat.title,
                        description: feat.description,
                        order: feat.order,
                    },
                });
                updatedFeatures.push(updated);
            }
            else {
                const created = await prisma.whatWeBuildFeature.create({
                    data: {
                        locale,
                        icon: feat.icon,
                        title: feat.title,
                        description: feat.description,
                        order: feat.order,
                    },
                });
                updatedFeatures.push(created);
            }
        }
        res.json({ content: updatedContent, features: updatedFeatures });
    }
    catch (error) {
        console.error('Error updating what we build content:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/about/mission-vision:
 *   get:
 *     summary: Get Mission/Vision content and recommendation snippets
 *     tags: [About]
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
router.get('/mission-vision', async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const [content, snippets] = await Promise.all([
            prisma.missionVisionContent.findUnique({ where: { locale } }),
            prisma.recommendationSnippet.findMany({
                where: { locale },
                orderBy: { order: 'asc' },
            }),
        ]);
        res.json({ content, snippets });
    }
    catch (error) {
        console.error('Error fetching mission/vision content:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/about/mission-vision:
 *   put:
 *     summary: Replace Mission/Vision content and recommendation snippets
 *     tags: [About]
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/mission-vision', requireAuth_1.requireAuth, validate(missionVisionSchema), async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const payload = req.body;
        // 1. Upsert Content
        const updatedContent = await prisma.missionVisionContent.upsert({
            where: { locale },
            create: {
                locale,
                statValue: payload.content.statValue,
                statLabel: payload.content.statLabel,
                statAvatarUrls: payload.content.statAvatarUrls,
                statCaption: payload.content.statCaption,
                missionLabel: payload.content.missionLabel,
                missionText: payload.content.missionText,
                visionLabel: payload.content.visionLabel,
                visionText: payload.content.visionText,
            },
            update: {
                statValue: payload.content.statValue,
                statLabel: payload.content.statLabel,
                statAvatarUrls: payload.content.statAvatarUrls,
                statCaption: payload.content.statCaption,
                missionLabel: payload.content.missionLabel,
                missionText: payload.content.missionText,
                visionLabel: payload.content.visionLabel,
                visionText: payload.content.visionText,
            },
        });
        // 2. Sync Snippets
        const incomingSnippetIds = payload.snippets.map((s) => s.id).filter(Boolean);
        // Delete missing items for this locale
        await prisma.recommendationSnippet.deleteMany({
            where: {
                locale,
                NOT: { id: { in: incomingSnippetIds } },
            },
        });
        // Upsert remaining items
        const updatedSnippets = [];
        for (const snip of payload.snippets) {
            if (snip.id) {
                const updated = await prisma.recommendationSnippet.update({
                    where: { id: snip.id },
                    data: {
                        type: snip.type,
                        text: snip.text,
                        value: snip.value || null,
                        avatarUrl: snip.avatarUrl || null,
                        order: snip.order,
                    },
                });
                updatedSnippets.push(updated);
            }
            else {
                const created = await prisma.recommendationSnippet.create({
                    data: {
                        locale,
                        type: snip.type,
                        text: snip.text,
                        value: snip.value || null,
                        avatarUrl: snip.avatarUrl || null,
                        order: snip.order,
                    },
                });
                updatedSnippets.push(created);
            }
        }
        res.json({ content: updatedContent, snippets: updatedSnippets });
    }
    catch (error) {
        console.error('Error updating mission/vision content:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
