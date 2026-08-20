import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const prisma = new PrismaClient();

const validate = (schema: z.ZodSchema) => (req: Request, res: Response, next: Function) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err: any) {
    res.status(400).json({ error: err.errors || 'Validation Error' });
  }
};

const createLogoSchema = z.object({
  name: z.string().min(1),
  imageUrl: z.string().url(),
});

const updateLogoSchema = z.object({
  name: z.string().min(1).optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

const reorderSchema = z.object({
  orders: z.array(z.object({
    id: z.string(),
    order: z.number(),
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
router.get('/', async (req: Request, res: Response) => {
  try {
    const logos = await prisma.clientLogo.findMany({
      orderBy: { order: 'asc' },
    });
    res.json(logos);
  } catch (error) {
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
router.post('/', requireAuth, validate(createLogoSchema), async (req: Request, res: Response) => {
  const payload = req.body as z.infer<typeof createLogoSchema>;
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
  } catch (error) {
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
router.put('/reorder', requireAuth, validate(reorderSchema), async (req: Request, res: Response) => {
  const payload = req.body as z.infer<typeof reorderSchema>;
  try {
    await prisma.$transaction(
      payload.orders.map((item) =>
        prisma.clientLogo.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );
    res.json({ success: true });
  } catch (error) {
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
router.put('/:id', requireAuth, validate(updateLogoSchema), async (req: Request, res: Response) => {
  const payload = req.body as z.infer<typeof updateLogoSchema>;
  try {
    const updatedLogo = await prisma.clientLogo.update({
      where: { id: req.params.id },
      data: payload,
    });
    res.json(updatedLogo);
  } catch (error) {
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
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await prisma.clientLogo.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
