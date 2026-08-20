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

const teamIntroSchema = z.object({
  pillLabel: z.string().min(1),
  heading: z.string().min(1),
  paragraph: z.string().min(1),
});

const teamTeaserSchema = z.object({
  heading: z.string().min(1),
  viewAllLabel: z.string().min(1),
  displayCount: z.number().int().min(1),
});

const teamMemberItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  role: z.string().min(1),
  department: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
  instagramUrl: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  order: z.number().int(),
});

const syncTeamMembersSchema = z.array(teamMemberItemSchema);

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
router.get('/intro', async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
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
router.put('/intro', requireAuth, validate(teamIntroSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { locale } = req.query;
    if (!locale || typeof locale !== 'string') {
      res.status(400).json({ error: 'locale query param is required' });
      return;
    }

    const payload = req.body as z.infer<typeof teamIntroSchema>;

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
  } catch (error) {
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
router.get('/teaser', async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
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
router.put('/teaser', requireAuth, validate(teamTeaserSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { locale, page } = req.query;
    if (!locale || typeof locale !== 'string' || !page || typeof page !== 'string') {
      res.status(400).json({ error: 'locale and page query params are required' });
      return;
    }

    const payload = req.body as z.infer<typeof teamTeaserSchema>;

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
  } catch (error) {
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
router.get('/members', async (req: Request, res: Response): Promise<void> => {
  try {
    const { locale, limit } = req.query;
    if (!locale || typeof locale !== 'string') {
      res.status(400).json({ error: 'locale query param is required' });
      return;
    }

    const queryLimit = limit ? parseInt(limit as string, 10) : undefined;

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
  } catch (error) {
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
router.put('/members', requireAuth, validate(syncTeamMembersSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { locale } = req.query;
    if (!locale || typeof locale !== 'string') {
      res.status(400).json({ error: 'locale query param is required' });
      return;
    }

    const payload = req.body as z.infer<typeof syncTeamMembersSchema>;

    const incomingIds = payload.map((m) => m.id).filter(Boolean) as string[];

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
      } else {
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
  } catch (error) {
    console.error('Error syncing team members:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
