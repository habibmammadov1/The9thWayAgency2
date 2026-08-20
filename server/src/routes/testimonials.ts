import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const testimonialsIntroSchema = z.object({
  heading: z.string().min(1),
});

const testimonialHighlightSchema = z.object({
  rating: z.string().min(1),
  reviewCount: z.string().min(1),
  blurb: z.string().min(1),
});

const testimonialSchema = z.object({
  id: z.string().optional(),
  quote: z.string().min(1),
  clientName: z.string().min(1),
  clientRole: z.string().min(1),
  avatarUrl: z.string().nullable().optional(),
  trustBadge: z.string().nullable().optional(),
});

const testimonialsListPayloadSchema = z.object({
  testimonials: z.array(testimonialSchema),
});

/**
 * @swagger
 * /api/testimonials/intro:
 *   get:
 *     summary: Get Testimonials Intro Heading
 *     tags: [Testimonials]
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
router.get('/intro', async (req: Request, res: Response): Promise<void> => {
  try {
    const { locale, page } = req.query;
    if (!locale || typeof locale !== 'string' || !page || typeof page !== 'string') {
      res.status(400).json({ error: 'locale and page query params are required' });
      return;
    }

    const intro = await prisma.testimonialsSectionIntro.findUnique({
      where: {
        locale_page: { locale, page }
      }
    });

    if (!intro) {
      res.status(404).json({ error: 'Intro heading not found' });
      return;
    }

    res.json(intro);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/testimonials/intro:
 *   put:
 *     summary: Update Testimonials Intro Heading
 *     tags: [Testimonials]
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
router.put('/intro', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { locale, page } = req.query;
    if (!locale || typeof locale !== 'string' || !page || typeof page !== 'string') {
      res.status(400).json({ error: 'locale and page query params are required' });
      return;
    }

    const body = testimonialsIntroSchema.parse(req.body);

    const updated = await prisma.testimonialsSectionIntro.upsert({
      where: {
        locale_page: { locale, page }
      },
      update: {
        heading: body.heading
      },
      create: {
        locale,
        page,
        heading: body.heading
      }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Bad request' });
  }
});

/**
 * @swagger
 * /api/testimonials/highlight:
 *   get:
 *     summary: Get Testimonial Rating Highlight Card
 *     tags: [Testimonials]
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
router.get('/highlight', async (req: Request, res: Response): Promise<void> => {
  try {
    const { locale } = req.query;
    if (!locale || typeof locale !== 'string') {
      res.status(400).json({ error: 'locale query param is required' });
      return;
    }

    const highlight = await prisma.testimonialHighlight.findUnique({
      where: { locale }
    });

    if (!highlight) {
      res.status(404).json({ error: 'Highlight not found' });
      return;
    }

    res.json(highlight);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/testimonials/highlight:
 *   put:
 *     summary: Update Testimonial Rating Highlight Card
 *     tags: [Testimonials]
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
router.put('/highlight', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { locale } = req.query;
    if (!locale || typeof locale !== 'string') {
      res.status(400).json({ error: 'locale query param is required' });
      return;
    }

    const body = testimonialHighlightSchema.parse(req.body);

    const updated = await prisma.testimonialHighlight.upsert({
      where: { locale },
      update: {
        rating: body.rating,
        reviewCount: body.reviewCount,
        blurb: body.blurb
      },
      create: {
        locale,
        rating: body.rating,
        reviewCount: body.reviewCount,
        blurb: body.blurb
      }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Bad request' });
  }
});

/**
 * @swagger
 * /api/testimonials/list:
 *   get:
 *     summary: Get Ordered Testimonials
 *     tags: [Testimonials]
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
router.get('/list', async (req: Request, res: Response): Promise<void> => {
  try {
    const { locale } = req.query;
    if (!locale || typeof locale !== 'string') {
      res.status(400).json({ error: 'locale query param is required' });
      return;
    }

    const testimonials = await prisma.testimonial.findMany({
      where: { locale },
      orderBy: { order: 'asc' }
    });

    res.json({ testimonials });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/testimonials/list:
 *   put:
 *     summary: Replace Testimonials List
 *     tags: [Testimonials]
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
 *               testimonials:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/list', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { locale } = req.query;
    if (!locale || typeof locale !== 'string') {
      res.status(400).json({ error: 'locale query param is required' });
      return;
    }

    const body = testimonialsListPayloadSchema.parse(req.body);

    await prisma.$transaction(async (tx) => {
      await tx.testimonial.deleteMany({ where: { locale } });
      let order = 1;
      for (const item of body.testimonials) {
        await tx.testimonial.create({
          data: {
            locale,
            order: order++,
            quote: item.quote,
            clientName: item.clientName,
            clientRole: item.clientRole,
            avatarUrl: item.avatarUrl,
            trustBadge: item.trustBadge
          }
        });
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Bad request' });
  }
});

export default router;
