"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const validate = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    }
    catch (err) {
        res.status(400).json({ error: err.errors || 'Validation Error' });
    }
};
const createLogoSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    imageUrl: zod_1.z.string().url(),
});
const updateLogoSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    imageUrl: zod_1.z.string().url().optional(),
    isActive: zod_1.z.boolean().optional(),
});
const reorderSchema = zod_1.z.object({
    orders: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        order: zod_1.z.number(),
    })),
});
/**
 * @swagger
 * /api/client-logos:
 *   get:
 *     summary: Get active client logos
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', async (req, res) => {
    try {
        const logos = await prisma.clientLogo.findMany({
            orderBy: { order: 'asc' },
        });
        res.json(logos);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/client-logos:
 *   post:
 *     summary: Create a new client logo
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/', validate(createLogoSchema), async (req, res) => {
    const payload = req.body;
    try {
        const lastLogo = await prisma.clientLogo.findFirst({
            orderBy: { order: 'desc' },
        });
        const nextOrder = lastLogo ? lastLogo.order + 1 : 1;
        const newLogo = await prisma.clientLogo.create({
            data: {
                name: payload.name,
                imageUrl: payload.imageUrl,
                order: nextOrder,
            },
        });
        res.json(newLogo);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/client-logos/reorder:
 *   put:
 *     summary: Reorder client logos
 *     responses:
 *       200:
 *         description: OK
 */
router.put('/reorder', validate(reorderSchema), async (req, res) => {
    const payload = req.body;
    try {
        await prisma.$transaction(payload.orders.map((item) => prisma.clientLogo.update({
            where: { id: item.id },
            data: { order: item.order },
        })));
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/client-logos/{id}:
 *   put:
 *     summary: Update a client logo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.put('/:id', validate(updateLogoSchema), async (req, res) => {
    const payload = req.body;
    try {
        const updatedLogo = await prisma.clientLogo.update({
            where: { id: req.params.id },
            data: payload,
        });
        res.json(updatedLogo);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/client-logos/{id}:
 *   delete:
 *     summary: Delete a client logo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.delete('/:id', async (req, res) => {
    try {
        await prisma.clientLogo.delete({
            where: { id: req.params.id },
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
