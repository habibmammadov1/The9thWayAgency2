import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const prisma = new PrismaClient();

router.get('/ping', (req, res) => { res.send('pong from services'); });

// Schemas for validation
const servicesIntroSchema = z.object({
  pillLabel: z.string(),
  heading: z.string(),
  ctaLabel: z.string(),
});

const serviceSchema = z.object({
  id: z.string().optional(),
  icon: z.string(),
  title: z.string(),
  description: z.string(),
  bullets: z.array(z.string()),
  imageUrl: z.string().nullable().optional(),
});

const servicesListPayloadSchema = z.object({
  services: z.array(serviceSchema),
});

const industrySchema = z.object({
  id: z.string().optional(),
  name: z.string(),
});

const whyChooseUsBundleSchema = z.object({
  intro: z.object({
    pillLabel: z.string(),
    heading: z.string(),
    paragraph: z.string(),
  }),
  industries: z.array(industrySchema),
  statHighlight: z.object({
    value: z.string(),
    label: z.string(),
    ctaText: z.string(),
    ctaLinkLabel: z.string(),
    imageUrl: z.string().nullable().optional(),
  }),
  whyChooseUsCard: z.object({
    heading: z.string(),
    paragraph: z.string(),
    checklistItems: z.array(z.string()),
    ctaLabel: z.string(),
  }),
  happyClientsCard: z.object({
    percentage: z.string(),
    label: z.string(),
    clientCount: z.string(),
    avatarUrls: z.array(z.string()),
  }),
  supportCard: z.object({
    badge: z.string(),
    heading: z.string(),
    description: z.string(),
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
router.get('/intro', async (req: Request, res: Response): Promise<void> => {
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
  } catch (err) {
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
router.put('/intro', requireAuth, async (req: Request, res: Response): Promise<void> => {
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
  } catch (err) {
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
router.get('/list', async (req: Request, res: Response): Promise<void> => {
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
  } catch (err) {
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
router.put('/list', requireAuth, async (req: Request, res: Response): Promise<void> => {
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
  } catch (err) {
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
router.get('/why-choose-us', async (req: Request, res: Response): Promise<void> => {
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
  } catch (err) {
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
router.put('/why-choose-us', requireAuth, async (req: Request, res: Response): Promise<void> => {
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
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Bad request' });
  }
});

export default router;
