import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const prisma = new PrismaClient();

// Validation Schemas
const validate = (schema: z.ZodSchema) => (req: Request, res: Response, next: Function) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err: any) {
    res.status(400).json({ error: err.errors || 'Validation Error' });
  }
};

const studioIntroSchema = z.object({
  overline: z.string().min(1),
  heading: z.string().min(1),
  paragraph: z.string().min(1),
  image1Url: z.string().nullable().optional(),
  image2Url: z.string().nullable().optional(),
});

const whatWeBuildFeatureSchema = z.object({
  id: z.string().optional(),
  icon: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  order: z.number().int(),
});

const whatWeBuildSchema = z.object({
  content: z.object({
    mainImageUrl: z.string().nullable().optional(),
    statValue: z.string().min(1),
    statLabel: z.string().min(1),
    statAvatarUrls: z.array(z.string()),
    statCaption: z.string().min(1),
    heading: z.string().min(1),
    paragraph: z.string().min(1),
    ctaLabel: z.string().min(1),
  }),
  features: z.array(whatWeBuildFeatureSchema),
});

const recommendationSnippetSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['quote', 'stat']),
  text: z.string().min(1),
  value: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  order: z.number().int(),
});

const missionVisionSchema = z.object({
  content: z.object({
    statValue: z.string().min(1),
    statLabel: z.string().min(1),
    statAvatarUrls: z.array(z.string()),
    statCaption: z.string().min(1),
    missionLabel: z.string().min(1),
    missionText: z.string().min(1),
    visionLabel: z.string().min(1),
    visionText: z.string().min(1),
  }),
  snippets: z.array(recommendationSnippetSchema),
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
router.get('/studio-intro', async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
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
router.put('/studio-intro', requireAuth, validate(studioIntroSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { locale } = req.query;
    if (!locale || typeof locale !== 'string') {
      res.status(400).json({ error: 'locale query param is required' });
      return;
    }

    const payload = req.body as z.infer<typeof studioIntroSchema>;

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
  } catch (error) {
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
router.get('/what-we-build', async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
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
router.put('/what-we-build', requireAuth, validate(whatWeBuildSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { locale } = req.query;
    if (!locale || typeof locale !== 'string') {
      res.status(400).json({ error: 'locale query param is required' });
      return;
    }

    const payload = req.body as z.infer<typeof whatWeBuildSchema>;

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
    const incomingFeatureIds = payload.features.map((f) => f.id).filter(Boolean) as string[];

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
      } else {
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
  } catch (error) {
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
router.get('/mission-vision', async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
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
router.put('/mission-vision', requireAuth, validate(missionVisionSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { locale } = req.query;
    if (!locale || typeof locale !== 'string') {
      res.status(400).json({ error: 'locale query param is required' });
      return;
    }

    const payload = req.body as z.infer<typeof missionVisionSchema>;

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
    const incomingSnippetIds = payload.snippets.map((s) => s.id).filter(Boolean) as string[];

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
      } else {
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
  } catch (error) {
    console.error('Error updating mission/vision content:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
