import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const prisma = new PrismaClient();

// Schemas for validation
const slideSchema = z.object({
  id: z.string().optional(),
  overline: z.string(),
  headline: z.string(),
  supporting: z.string(),
  image: z.string().optional(),
});

const heroPayloadSchema = z.object({
  slides: z.array(slideSchema),
  founderTitle: z.string(),
  letsTalk: z.string(),
  seePortfolio: z.string(),
  founderName: z.string(),
  founderImage: z.string().optional(),
});

const uniquenessCardSchema = z.object({
  id: z.string().optional(),
  icon: z.string(),
  title: z.string(),
  desc: z.string(),
  image: z.string().optional(),
});

const uniquenessPayloadSchema = z.object({
  sectionTitle: z.string().optional(), // Currently not persisted as a single field, can omit or just accept
  cards: z.array(uniquenessCardSchema),
});

const statSchema = z.object({
  id: z.string().optional(),
  value: z.string(),
  label: z.string(),
});

const aboutStatsPayloadSchema = z.object({
  title: z.string(),
  desc: z.string(),
  image: z.string().optional(),
  stats: z.array(statSchema),
});

const socialSchema = z.object({
  id: z.string().optional(),
  platform: z.string(),
  url: z.string(),
});

const footerPayloadSchema = z.object({
  stayConnected: z.string(),
  desc: z.string(),
  contactNow: z.string(),
  email: z.string().optional(),
  copyright: z.string().optional(), // Not currently explicitly in schema, ignored or just add if needed
  socials: z.array(socialSchema).optional(),
});

// Middleware for validation
const validate = (schema: z.Schema) => (req: Request, res: Response, next: Function) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err: any) {
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
router.get('/hero', async (req: Request, res: Response): Promise<any> => {
  const { locale } = req.query;
  if (!locale) return res.status(400).json({ error: 'Locale is required' });

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
  } catch (error) {
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
router.put('/hero', requireAuth, validate(heroPayloadSchema), async (req: Request, res: Response): Promise<any> => {
  const { locale } = req.query;
  if (!locale) return res.status(400).json({ error: 'Locale is required' });
  
  const payload = req.body as z.infer<typeof heroPayloadSchema>;

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
  } catch (error) {
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
router.get('/uniqueness', async (req: Request, res: Response): Promise<any> => {
  const { locale } = req.query;
  if (!locale) return res.status(400).json({ error: 'Locale is required' });

  try {
    const cards = await prisma.uniquenessCard.findMany({
      where: { locale: String(locale) },
      orderBy: { order: 'asc' },
    });

    res.json({
      sectionTitle: 'Niyə The9thway?',
      cards: cards.map((c) => ({ id: c.id, icon: c.icon, title: c.title, desc: c.description, image: c.imageUrl })),
    });
  } catch (error) {
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
router.put('/uniqueness', requireAuth, validate(uniquenessPayloadSchema), async (req: Request, res: Response): Promise<any> => {
  const { locale } = req.query;
  if (!locale) return res.status(400).json({ error: 'Locale is required' });

  const payload = req.body as z.infer<typeof uniquenessPayloadSchema>;

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
  } catch (error) {
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
router.get('/about-stats', async (req: Request, res: Response): Promise<any> => {
  const { locale } = req.query;
  if (!locale) return res.status(400).json({ error: 'Locale is required' });

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
  } catch (error) {
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
router.put('/about-stats', requireAuth, validate(aboutStatsPayloadSchema), async (req: Request, res: Response): Promise<any> => {
  const { locale } = req.query;
  if (!locale) return res.status(400).json({ error: 'Locale is required' });

  const payload = req.body as z.infer<typeof aboutStatsPayloadSchema>;

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
  } catch (error) {
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
router.get('/footer', async (req: Request, res: Response): Promise<any> => {
  const { locale } = req.query;
  if (!locale) return res.status(400).json({ error: 'Locale is required' });

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
  } catch (error) {
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
router.put('/footer', requireAuth, validate(footerPayloadSchema), async (req: Request, res: Response): Promise<any> => {
  const { locale } = req.query;
  if (!locale) return res.status(400).json({ error: 'Locale is required' });

  const payload = req.body as z.infer<typeof footerPayloadSchema>;

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
  } catch (error) {
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
router.put('/footer/social-links', requireAuth, validate(z.object({ socials: z.array(socialSchema) })), async (req: Request, res: Response): Promise<any> => {
  const payload = req.body as { socials: z.infer<typeof socialSchema>[] };

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
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
