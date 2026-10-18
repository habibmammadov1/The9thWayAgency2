import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth';
import { LOCALES, slugSchema, blockInputSchema, normaliseBlock } from '../lib/pageBlocks';

const router = Router();
const prisma = new PrismaClient();

// Validation helper (same shape as the other route files)
const validate = (schema: z.ZodSchema) => (req: Request, res: Response, next: Function) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const issue = result.error.issues[0];
    res.status(400).json({ error: issue ? `${issue.path.join('.')}: ${issue.message}` : 'Validation Error' });
    return;
  }
  req.body = result.data;
  next();
};

const localeSchema = z.enum(LOCALES);

const translationSchema = z.object({
  locale: localeSchema,
  title: z.string().max(300).default(''),
  navLabel: z.string().max(100).nullable().optional(),
  seoTitle: z.string().max(300).nullable().optional(),
  seoDescription: z.string().max(500).nullable().optional(),
  ogImageUrl: z.string().max(1000).nullable().optional(),
});

const createPageSchema = z.object({
  title: z.string().min(1, 'Başlıq boş ola bilməz').max(300),
  slug: slugSchema,
  locale: localeSchema.default('az'),
  blocks: z.array(blockInputSchema).max(100).default([]),
});

const updatePageSchema = z.object({
  slug: slugSchema,
  showInNav: z.boolean().default(false),
  navOrder: z.number().int().min(0).max(1000).default(0),
  translations: z.array(translationSchema).max(LOCALES.length),
  blocks: z.object({
    az: z.array(blockInputSchema).max(100).default([]),
    ru: z.array(blockInputSchema).max(100).default([]),
    en: z.array(blockInputSchema).max(100).default([]),
  }),
});

const emptyToNull = (v?: string | null) => (v && v.trim() ? v.trim() : null);

async function slugTaken(slug: string, exceptId?: string) {
  const existing = await prisma.page.findUnique({ where: { slug } });
  return Boolean(existing && existing.id !== exceptId);
}

function normaliseBlocks(blocks: z.infer<typeof blockInputSchema>[]) {
  return blocks.map((b) => normaliseBlock(b));
}

// Full page with all locales, as used by the admin editor
async function loadFullPage(id: string) {
  const page = await prisma.page.findUnique({
    where: { id },
    include: {
      translations: true,
      blocks: { orderBy: [{ locale: 'asc' }, { order: 'asc' }] },
    },
  });
  if (!page) return null;

  const blocks: Record<string, unknown[]> = { az: [], ru: [], en: [] };
  for (const b of page.blocks) {
    (blocks[b.locale] ??= []).push({ id: b.id, type: b.type, isVisible: b.isVisible, props: b.props });
  }
  return {
    id: page.id,
    slug: page.slug,
    status: page.status,
    showInNav: page.showInNav,
    navOrder: page.navOrder,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
    translations: page.translations,
    blocks,
  };
}

// ---------------------------------------------------------------------------
// Public routes
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /api/pages/nav:
 *   get:
 *     summary: Published pages that should appear in the site navigation
 *     tags: [Pages]
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
router.get('/nav', async (req: Request, res: Response): Promise<void> => {
  try {
    const locale = localeSchema.safeParse(req.query.locale);
    if (!locale.success) {
      res.status(400).json({ error: 'locale query param is required' });
      return;
    }

    const pages = await prisma.page.findMany({
      where: { status: 'published', showInNav: true, translations: { some: { locale: locale.data } } },
      orderBy: [{ navOrder: 'asc' }, { createdAt: 'asc' }],
      include: { translations: { where: { locale: locale.data } } },
    });

    res.json(
      pages.map((p) => ({
        slug: p.slug,
        label: p.translations[0]?.navLabel || p.translations[0]?.title || p.slug,
      })),
    );
  } catch (error) {
    console.error('Error fetching nav pages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/pages/by-slug/{slug}:
 *   get:
 *     summary: Get a published page with its visible blocks for one locale
 *     tags: [Pages]
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
 *       404:
 *         description: Not found or not published in this locale
 */
router.get('/by-slug/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const locale = localeSchema.safeParse(req.query.locale);
    if (!locale.success) {
      res.status(400).json({ error: 'locale query param is required' });
      return;
    }

    const page = await prisma.page.findUnique({
      where: { slug: req.params.slug },
      include: {
        translations: true,
        blocks: { where: { locale: locale.data, isVisible: true }, orderBy: { order: 'asc' } },
      },
    });

    const translation = page?.translations.find((t) => t.locale === locale.data);
    if (!page || page.status !== 'published' || !translation) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }

    res.json({
      slug: page.slug,
      locale: locale.data,
      title: translation.title,
      seoTitle: translation.seoTitle,
      seoDescription: translation.seoDescription,
      ogImageUrl: translation.ogImageUrl,
      availableLocales: page.translations.map((t) => t.locale),
      updatedAt: page.updatedAt,
      blocks: page.blocks.map((b) => ({ id: b.id, type: b.type, props: b.props })),
    });
  } catch (error) {
    console.error('Error fetching page by slug:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ---------------------------------------------------------------------------
// Admin routes
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /api/pages:
 *   get:
 *     summary: List all pages (admin)
 *     tags: [Pages]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { translations: { select: { locale: true, title: true } } },
    });
    res.json(
      pages.map((p) => ({
        id: p.id,
        slug: p.slug,
        status: p.status,
        showInNav: p.showInNav,
        navOrder: p.navOrder,
        updatedAt: p.updatedAt,
        title: (p.translations.find((t) => t.locale === 'az') ?? p.translations[0])?.title ?? p.slug,
        locales: p.translations.map((t) => t.locale),
      })),
    );
  } catch (error) {
    console.error('Error listing pages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/pages/{id}:
 *   get:
 *     summary: Get a page with all translations and blocks (admin)
 *     tags: [Pages]
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
router.get('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = await loadFullPage(req.params.id);
    if (!page) {
      res.status(404).json({ error: 'Səhifə tapılmadı.' });
      return;
    }
    res.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/pages:
 *   post:
 *     summary: Create a new draft page (admin)
 *     tags: [Pages]
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/', requireAuth, validate(createPageSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body as z.infer<typeof createPageSchema>;

    if (await slugTaken(payload.slug)) {
      res.status(400).json({ error: 'Bu slug ilə səhifə artıq mövcuddur.' });
      return;
    }

    let blocks;
    try {
      blocks = normaliseBlocks(payload.blocks);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
      return;
    }

    const page = await prisma.page.create({
      data: {
        slug: payload.slug,
        translations: { create: { locale: payload.locale, title: payload.title } },
        blocks: {
          create: blocks.map((b, i) => ({
            locale: payload.locale,
            order: i,
            type: b.type,
            isVisible: b.isVisible,
            props: b.props as Prisma.InputJsonValue,
          })),
        },
      },
    });

    res.json(await loadFullPage(page.id));
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/pages/{id}:
 *   put:
 *     summary: Save page settings, translations and blocks for all locales (admin)
 *     tags: [Pages]
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
router.put('/:id', requireAuth, validate(updatePageSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payload = req.body as z.infer<typeof updatePageSchema>;

    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Səhifə tapılmadı.' });
      return;
    }
    if (await slugTaken(payload.slug, id)) {
      res.status(400).json({ error: 'Bu slug ilə səhifə artıq mövcuddur.' });
      return;
    }

    let blocksByLocale: Record<string, ReturnType<typeof normaliseBlocks>>;
    try {
      blocksByLocale = {
        az: normaliseBlocks(payload.blocks.az),
        ru: normaliseBlocks(payload.blocks.ru),
        en: normaliseBlocks(payload.blocks.en),
      };
    } catch (e: any) {
      res.status(400).json({ error: e.message });
      return;
    }

    // A locale "exists" only when it has a title; empty-title translations are removed.
    const filledTranslations = payload.translations.filter((t) => t.title.trim());
    const filledLocales = filledTranslations.map((t) => t.locale);

    if (existing.status === 'published' && filledLocales.length === 0) {
      res.status(400).json({ error: 'Dərc olunmuş səhifənin ən azı bir dildə başlığı olmalıdır.' });
      return;
    }

    await prisma.$transaction([
      prisma.page.update({
        where: { id },
        data: { slug: payload.slug, showInNav: payload.showInNav, navOrder: payload.navOrder },
      }),
      prisma.pageTranslation.deleteMany({ where: { pageId: id, locale: { notIn: filledLocales } } }),
      ...filledTranslations.map((t) =>
        prisma.pageTranslation.upsert({
          where: { pageId_locale: { pageId: id, locale: t.locale } },
          create: {
            pageId: id,
            locale: t.locale,
            title: t.title.trim(),
            navLabel: emptyToNull(t.navLabel),
            seoTitle: emptyToNull(t.seoTitle),
            seoDescription: emptyToNull(t.seoDescription),
            ogImageUrl: emptyToNull(t.ogImageUrl),
          },
          update: {
            title: t.title.trim(),
            navLabel: emptyToNull(t.navLabel),
            seoTitle: emptyToNull(t.seoTitle),
            seoDescription: emptyToNull(t.seoDescription),
            ogImageUrl: emptyToNull(t.ogImageUrl),
          },
        }),
      ),
      // Blocks belong only to this page, so replacing them is safe.
      prisma.pageBlock.deleteMany({ where: { pageId: id } }),
      prisma.pageBlock.createMany({
        data: Object.entries(blocksByLocale).flatMap(([locale, blocks]) =>
          blocks.map((b, i) => ({
            pageId: id,
            locale,
            order: i,
            type: b.type,
            isVisible: b.isVisible,
            props: b.props as Prisma.InputJsonValue,
          })),
        ),
      }),
    ]);

    res.json(await loadFullPage(id));
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/pages/{id}/publish:
 *   post:
 *     summary: Publish a page (admin)
 *     tags: [Pages]
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
router.post('/:id/publish', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const page = await prisma.page.findUnique({
      where: { id },
      include: { translations: true, blocks: { where: { isVisible: true }, select: { locale: true } } },
    });
    if (!page) {
      res.status(404).json({ error: 'Səhifə tapılmadı.' });
      return;
    }

    const readyLocale = page.translations.some(
      (t) => t.title.trim() && page.blocks.some((b) => b.locale === t.locale),
    );
    if (!readyLocale) {
      res.status(400).json({ error: 'Dərc üçün ən azı bir dildə başlıq və görünən blok olmalıdır.' });
      return;
    }

    await prisma.page.update({ where: { id }, data: { status: 'published' } });
    res.json(await loadFullPage(id));
  } catch (error) {
    console.error('Error publishing page:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/pages/{id}/unpublish:
 *   post:
 *     summary: Move a page back to draft (admin)
 *     tags: [Pages]
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
router.post('/:id/unpublish', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Səhifə tapılmadı.' });
      return;
    }
    await prisma.page.update({ where: { id }, data: { status: 'draft' } });
    res.json(await loadFullPage(id));
  } catch (error) {
    console.error('Error unpublishing page:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/pages/{id}/duplicate:
 *   post:
 *     summary: Copy a page (all locales) into a new draft (admin)
 *     tags: [Pages]
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
router.post('/:id/duplicate', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const source = await prisma.page.findUnique({
      where: { id: req.params.id },
      include: { translations: true, blocks: true },
    });
    if (!source) {
      res.status(404).json({ error: 'Səhifə tapılmadı.' });
      return;
    }

    let slug = `${source.slug}-kopya`.slice(0, 100);
    for (let n = 2; await slugTaken(slug); n++) {
      slug = `${source.slug}-kopya-${n}`.slice(0, 100);
    }

    const copy = await prisma.page.create({
      data: {
        slug,
        translations: {
          create: source.translations.map((t) => ({
            locale: t.locale,
            title: `${t.title} (kopya)`,
            navLabel: t.navLabel,
            seoTitle: t.seoTitle,
            seoDescription: t.seoDescription,
            ogImageUrl: t.ogImageUrl,
          })),
        },
        blocks: {
          create: source.blocks.map((b) => ({
            locale: b.locale,
            order: b.order,
            type: b.type,
            isVisible: b.isVisible,
            props: b.props as Prisma.InputJsonValue,
          })),
        },
      },
    });

    res.json(await loadFullPage(copy.id));
  } catch (error) {
    console.error('Error duplicating page:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/pages/{id}:
 *   delete:
 *     summary: Delete a page with its translations and blocks (admin)
 *     tags: [Pages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await prisma.page.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Səhifə tapılmadı.' });
      return;
    }
    // Translations and blocks are removed by ON DELETE CASCADE
    await prisma.page.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
