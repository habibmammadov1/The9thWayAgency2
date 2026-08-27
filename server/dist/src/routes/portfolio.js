"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const requireAuth_1 = require("../middleware/requireAuth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const heroSchema = zod_1.z.object({
    pillLabel: zod_1.z.string().min(1),
    heading: zod_1.z.string().min(1),
    paragraph: zod_1.z.string().min(1),
    primaryCtaLabel: zod_1.z.string().min(1),
    secondaryCtaLabel: zod_1.z.string().min(1),
    backgroundImageUrl: zod_1.z.string().nullable().optional(),
});
const caseStudySchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    slug: zod_1.z.string().min(1),
    tags: zod_1.z.array(zod_1.z.string()),
    title: zod_1.z.string().min(1),
    colorTheme: zod_1.z.enum(["ink", "lime-dark", "ink-light"]),
    stat1Value: zod_1.z.string(),
    stat1Label: zod_1.z.string(),
    stat2Value: zod_1.z.string(),
    stat2Label: zod_1.z.string(),
    stat3Value: zod_1.z.string(),
    stat3Label: zod_1.z.string(),
    viewProjectLabel: zod_1.z.string().min(1),
    projectLink: zod_1.z.string().nullable().optional(),
    challenge: zod_1.z.string(),
    approach: zod_1.z.string(),
    result: zod_1.z.string(),
    galleryImageUrls: zod_1.z.array(zod_1.z.string()),
});
const caseStudiesPayloadSchema = zod_1.z.object({
    caseStudies: zod_1.z.array(caseStudySchema),
});
const faqIntroSchema = zod_1.z.object({
    pillLabel: zod_1.z.string().min(1),
    heading: zod_1.z.string().min(1),
    calloutHeading: zod_1.z.string().min(1),
    calloutText: zod_1.z.string().min(1),
    calloutCtaLabel: zod_1.z.string().min(1),
});
const faqItemSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    question: zod_1.z.string().min(1),
    answer: zod_1.z.string().min(1),
});
const faqPayloadSchema = zod_1.z.object({
    intro: faqIntroSchema,
    items: zod_1.z.array(faqItemSchema),
});
/**
 * @swagger
 * /api/portfolio/hero:
 *   get:
 *     summary: Get Portfolio Hero Content
 *     tags: [Portfolio]
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
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const hero = await prisma.portfolioHero.findUnique({
            where: { locale }
        });
        if (!hero) {
            res.status(404).json({ error: 'Hero not found' });
            return;
        }
        res.json(hero);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/portfolio/hero:
 *   put:
 *     summary: Update Portfolio Hero Content
 *     tags: [Portfolio]
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
router.put('/hero', requireAuth_1.requireAuth, async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const body = heroSchema.parse(req.body);
        const updated = await prisma.portfolioHero.upsert({
            where: { locale },
            update: {
                pillLabel: body.pillLabel,
                heading: body.heading,
                paragraph: body.paragraph,
                primaryCtaLabel: body.primaryCtaLabel,
                secondaryCtaLabel: body.secondaryCtaLabel,
                backgroundImageUrl: body.backgroundImageUrl
            },
            create: {
                locale,
                pillLabel: body.pillLabel,
                heading: body.heading,
                paragraph: body.paragraph,
                primaryCtaLabel: body.primaryCtaLabel,
                secondaryCtaLabel: body.secondaryCtaLabel,
                backgroundImageUrl: body.backgroundImageUrl
            }
        });
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Bad request' });
    }
});
/**
 * @swagger
 * /api/portfolio/case-studies:
 *   get:
 *     summary: Get Portfolio Case Studies
 *     tags: [Portfolio]
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
router.get('/case-studies', async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const caseStudies = await prisma.caseStudy.findMany({
            where: { locale },
            orderBy: { order: 'asc' }
        });
        res.json({ caseStudies });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/portfolio/case-studies:
 *   put:
 *     summary: Replace Portfolio Case Studies List
 *     tags: [Portfolio]
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
router.put('/case-studies', requireAuth_1.requireAuth, async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const body = caseStudiesPayloadSchema.parse(req.body);
        await prisma.$transaction(async (tx) => {
            await tx.caseStudy.deleteMany({ where: { locale } });
            let order = 1;
            for (const item of body.caseStudies) {
                await tx.caseStudy.create({
                    data: {
                        locale,
                        slug: item.slug,
                        order: order++,
                        tags: item.tags,
                        title: item.title,
                        colorTheme: item.colorTheme,
                        stat1Value: item.stat1Value,
                        stat1Label: item.stat1Label,
                        stat2Value: item.stat2Value,
                        stat2Label: item.stat2Label,
                        stat3Value: item.stat3Value,
                        stat3Label: item.stat3Label,
                        viewProjectLabel: item.viewProjectLabel,
                        projectLink: item.projectLink,
                        challenge: item.challenge,
                        approach: item.approach,
                        result: item.result,
                        galleryImageUrls: item.galleryImageUrls
                    }
                });
            }
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Bad request' });
    }
});
/**
 * @swagger
 * /api/portfolio/case-studies/{slug}:
 *   get:
 *     summary: Get Case Study by Slug
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/case-studies/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const caseStudy = await prisma.caseStudy.findFirst({
            where: { slug, locale }
        });
        if (!caseStudy) {
            res.status(404).json({ error: 'Case study not found' });
            return;
        }
        res.json(caseStudy);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/portfolio/faq:
 *   get:
 *     summary: Get Portfolio FAQ Section
 *     tags: [Portfolio]
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
router.get('/faq', async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const [intro, items] = await Promise.all([
            prisma.portfolioFAQIntro.findUnique({ where: { locale } }),
            prisma.fAQItem.findMany({ where: { locale }, orderBy: { order: 'asc' } })
        ]);
        res.json({ intro: intro || null, items: items || [] });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/portfolio/faq:
 *   put:
 *     summary: Update Portfolio FAQ Section
 *     tags: [Portfolio]
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
router.put('/faq', requireAuth_1.requireAuth, async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const body = faqPayloadSchema.parse(req.body);
        await prisma.$transaction(async (tx) => {
            // 1. Update Intro
            await tx.portfolioFAQIntro.upsert({
                where: { locale },
                update: {
                    pillLabel: body.intro.pillLabel,
                    heading: body.intro.heading,
                    calloutHeading: body.intro.calloutHeading,
                    calloutText: body.intro.calloutText,
                    calloutCtaLabel: body.intro.calloutCtaLabel
                },
                create: {
                    locale,
                    pillLabel: body.intro.pillLabel,
                    heading: body.intro.heading,
                    calloutHeading: body.intro.calloutHeading,
                    calloutText: body.intro.calloutText,
                    calloutCtaLabel: body.intro.calloutCtaLabel
                }
            });
            // 2. Clear items
            await tx.fAQItem.deleteMany({ where: { locale } });
            // 3. Create items
            let order = 1;
            for (const item of body.items) {
                await tx.fAQItem.create({
                    data: {
                        locale,
                        order: order++,
                        question: item.question,
                        answer: item.answer
                    }
                });
            }
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Bad request' });
    }
});
exports.default = router;
