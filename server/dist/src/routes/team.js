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
const teamIntroSchema = zod_1.z.object({
    pillLabel: zod_1.z.string().min(1),
    heading: zod_1.z.string().min(1),
    paragraph: zod_1.z.string().min(1),
});
const teamTeaserSchema = zod_1.z.object({
    heading: zod_1.z.string().min(1),
    viewAllLabel: zod_1.z.string().min(1),
    displayCount: zod_1.z.number().int().min(1),
});
const teamMemberItemSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1),
    role: zod_1.z.string().min(1),
    department: zod_1.z.string().nullable().optional(),
    photoUrl: zod_1.z.string().nullable().optional(),
    linkedinUrl: zod_1.z.string().nullable().optional(),
    instagramUrl: zod_1.z.string().nullable().optional(),
    isActive: zod_1.z.boolean().default(true),
    order: zod_1.z.number().int(),
});
const syncTeamMembersSchema = zod_1.z.array(teamMemberItemSchema);
/**
 * @swagger
 * /api/team/intro:
 *   get:
 *     summary: Get Team Page intro content
 *     tags: [Team]
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
router.get('/intro', async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const content = await prisma.teamIntroContent.findUnique({
            where: { locale },
        });
        if (!content) {
            res.status(404).json({ error: 'Team Intro content not found' });
            return;
        }
        res.json(content);
    }
    catch (error) {
        console.error('Error fetching team intro:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/team/intro:
 *   put:
 *     summary: Update Team Page intro content
 *     tags: [Team]
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
router.put('/intro', requireAuth_1.requireAuth, validate(teamIntroSchema), async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const payload = req.body;
        const updated = await prisma.teamIntroContent.upsert({
            where: { locale },
            create: {
                locale,
                pillLabel: payload.pillLabel,
                heading: payload.heading,
                paragraph: payload.paragraph,
            },
            update: {
                pillLabel: payload.pillLabel,
                heading: payload.heading,
                paragraph: payload.paragraph,
            },
        });
        res.json(updated);
    }
    catch (error) {
        console.error('Error updating team intro:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/team/teaser:
 *   get:
 *     summary: Get Team Teaser settings for a specific page
 *     tags: [Team]
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/teaser', async (req, res) => {
    try {
        const { locale, page } = req.query;
        if (!locale || typeof locale !== 'string' || !page || typeof page !== 'string') {
            res.status(400).json({ error: 'locale and page query params are required' });
            return;
        }
        const settings = await prisma.teamTeaserSettings.findUnique({
            where: {
                locale_page: { locale, page },
            },
        });
        if (!settings) {
            res.status(404).json({ error: 'Teaser settings not found' });
            return;
        }
        res.json(settings);
    }
    catch (error) {
        console.error('Error fetching teaser settings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/team/teaser:
 *   put:
 *     summary: Update Team Teaser settings for a specific page
 *     tags: [Team]
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/teaser', requireAuth_1.requireAuth, validate(teamTeaserSchema), async (req, res) => {
    try {
        const { locale, page } = req.query;
        if (!locale || typeof locale !== 'string' || !page || typeof page !== 'string') {
            res.status(400).json({ error: 'locale and page query params are required' });
            return;
        }
        const payload = req.body;
        const updated = await prisma.teamTeaserSettings.upsert({
            where: {
                locale_page: { locale, page },
            },
            create: {
                locale,
                page,
                heading: payload.heading,
                viewAllLabel: payload.viewAllLabel,
                displayCount: payload.displayCount,
            },
            update: {
                heading: payload.heading,
                viewAllLabel: payload.viewAllLabel,
                displayCount: payload.displayCount,
            },
        });
        res.json(updated);
    }
    catch (error) {
        console.error('Error updating teaser settings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/team/members:
 *   get:
 *     summary: List ordered team members
 *     tags: [Team]
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/members', async (req, res) => {
    try {
        const { locale, limit } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const queryLimit = limit ? parseInt(limit, 10) : undefined;
        // By default, admin layout fetches all (both active/inactive) to allow editing.
        // Public routes will only request active ones.
        const showOnlyActive = req.query.active !== 'false';
        const members = await prisma.teamMember.findMany({
            where: {
                locale,
                ...(showOnlyActive ? { isActive: true } : {}),
            },
            orderBy: { order: 'asc' },
            take: isNaN(Number(queryLimit)) ? undefined : Number(queryLimit),
        });
        res.json(members);
    }
    catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/team/members:
 *   put:
 *     summary: Sync full ordered members list
 *     tags: [Team]
 *     parameters:
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Synced
 */
router.put('/members', requireAuth_1.requireAuth, validate(syncTeamMembersSchema), async (req, res) => {
    try {
        const { locale } = req.query;
        if (!locale || typeof locale !== 'string') {
            res.status(400).json({ error: 'locale query param is required' });
            return;
        }
        const payload = req.body;
        const incomingIds = payload.map((m) => m.id).filter(Boolean);
        // 1. Delete members not in the payload for this locale
        await prisma.teamMember.deleteMany({
            where: {
                locale,
                NOT: { id: { in: incomingIds } },
            },
        });
        // 2. Upsert remaining items
        const updatedMembers = [];
        for (const mem of payload) {
            if (mem.id) {
                const updated = await prisma.teamMember.update({
                    where: { id: mem.id },
                    data: {
                        name: mem.name,
                        role: mem.role,
                        department: mem.department || null,
                        photoUrl: mem.photoUrl || null,
                        linkedinUrl: mem.linkedinUrl || null,
                        instagramUrl: mem.instagramUrl || null,
                        isActive: mem.isActive,
                        order: mem.order,
                    },
                });
                updatedMembers.push(updated);
            }
            else {
                const created = await prisma.teamMember.create({
                    data: {
                        locale,
                        name: mem.name,
                        role: mem.role,
                        department: mem.department || null,
                        photoUrl: mem.photoUrl || null,
                        linkedinUrl: mem.linkedinUrl || null,
                        instagramUrl: mem.instagramUrl || null,
                        isActive: mem.isActive,
                        order: mem.order,
                    },
                });
                updatedMembers.push(created);
            }
        }
        res.json(updatedMembers);
    }
    catch (error) {
        console.error('Error syncing team members:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
