import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth';
import {
  AnswerError,
  FORM_LOCALES,
  FormField,
  formLocaleSchema,
  formFieldsSchema,
  validateAnswers,
} from '../lib/formFields';

const router = Router();

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

const localeSchema = z.enum(FORM_LOCALES);
const SUBMISSIONS_PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Soft rate limit for public submissions: per form and client address.
// In-memory (resets on restart), same approach as the contact form. Not a
// replacement for a captcha; the address is taken from X-Forwarded-For because
// behind the Azure proxy req.ip can be the same for every visitor.
// ---------------------------------------------------------------------------
const submitLimits = new Map<string, { count: number; resetAt: number }>();
const LIMIT_WINDOW_MS = 60 * 60 * 1000;
const LIMIT_MAX = 10;

function allowSubmission(formId: string, req: Request): boolean {
  const forwarded = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim();
  const key = `${formId}:${forwarded || req.ip || req.socket.remoteAddress || 'unknown'}`;
  const now = Date.now();

  // Keep the map from growing without bound
  if (submitLimits.size > 5000) {
    for (const [k, v] of submitLimits) if (now > v.resetAt) submitLimits.delete(k);
  }

  const entry = submitLimits.get(key);
  if (!entry || now > entry.resetAt) {
    submitLimits.set(key, { count: 1, resetAt: now + LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

function parseFields(json: Prisma.JsonValue): FormField[] {
  const parsed = formFieldsSchema.safeParse(json);
  return parsed.success ? parsed.data : [];
}

// ---------------------------------------------------------------------------
// Public routes
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /api/forms/public/{id}:
 *   get:
 *     summary: Get an active form definition for one locale
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: locale
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Form not found, inactive, or not available in this locale
 */
router.get('/public/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const locale = localeSchema.safeParse(req.query.locale);
    if (!locale.success) {
      res.status(400).json({ error: 'locale query param is required' });
      return;
    }

    const form = await prisma.form.findUnique({
      where: { id: req.params.id },
      include: { locales: { where: { locale: locale.data } } },
    });
    const def = form?.locales[0];
    if (!form || !form.isActive || !def) {
      res.status(404).json({ error: 'Form not found' });
      return;
    }

    const fields = parseFields(def.fields);
    if (fields.length === 0) {
      res.status(404).json({ error: 'Form not found' });
      return;
    }

    res.json({
      id: form.id,
      locale: locale.data,
      fields,
      submitLabel: def.submitLabel,
      successTitle: def.successTitle,
      successText: def.successText,
    });
  } catch (error) {
    console.error('Error fetching public form:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const submitSchema = z.object({
  locale: localeSchema,
  sourcePage: z.string().max(200).default(''),
  answers: z.record(z.any()).default({}),
  website: z.string().max(500).optional(), // honeypot
});

/**
 * @swagger
 * /api/forms/{id}/submit:
 *   post:
 *     summary: Submit answers to an active form
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Validation error
 *       429:
 *         description: Too many submissions
 */
router.post('/:id/submit', validate(submitSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payload = req.body as z.infer<typeof submitSchema>;

    // Honeypot: bots fill the hidden field. Answer "success" so they do not retry.
    if (payload.website) {
      res.json({ success: true });
      return;
    }

    if (!allowSubmission(id, req)) {
      res.status(429).json({ error: 'Çox sayda müraciət göndərildi. Zəhmət olmasa bir qədər sonra yenidən cəhd edin.' });
      return;
    }

    const form = await prisma.form.findUnique({
      where: { id },
      include: { locales: { where: { locale: payload.locale } } },
    });
    const def = form?.locales[0];
    if (!form || !form.isActive || !def) {
      res.status(404).json({ error: 'Forma tapılmadı.' });
      return;
    }

    let data;
    try {
      data = validateAnswers(parseFields(def.fields), payload.answers);
    } catch (e) {
      if (e instanceof AnswerError) {
        res.status(400).json({ error: e.message });
        return;
      }
      throw e;
    }

    await prisma.formSubmission.create({
      data: {
        formId: form.id,
        locale: payload.locale,
        sourcePage: payload.sourcePage,
        data: data as unknown as Prisma.InputJsonValue,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving form submission:', error);
    res.status(500).json({ error: 'Müraciət göndərilərkən xəta baş verdi.' });
  }
});

// ---------------------------------------------------------------------------
// Admin routes (static paths first so they are not captured by "/:id")
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /api/forms/unread-count:
 *   get:
 *     summary: Number of new submissions across all forms (admin)
 *     tags: [Forms]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/unread-count', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json({ unreadCount: await prisma.formSubmission.count({ where: { status: 'new' } }) });
  } catch (error) {
    console.error('Error counting form submissions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const statusSchema = z.object({ status: z.enum(['new', 'read', 'archived']) });

/**
 * @swagger
 * /api/forms/submissions/{sid}/status:
 *   put:
 *     summary: Mark a submission new, read or archived (admin)
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: sid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.put('/submissions/:sid/status', requireAuth, validate(statusSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await prisma.formSubmission.findUnique({ where: { id: req.params.sid } });
    if (!existing) {
      res.status(404).json({ error: 'Cavab tapılmadı.' });
      return;
    }
    const submission = await prisma.formSubmission.update({
      where: { id: req.params.sid },
      data: { status: req.body.status },
    });
    res.json({ success: true, submission });
  } catch (error) {
    console.error('Error updating submission status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/forms/submissions/{sid}:
 *   delete:
 *     summary: Delete one submission, e.g. to remove personal data (admin)
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: sid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/submissions/:sid', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await prisma.formSubmission.findUnique({ where: { id: req.params.sid } });
    if (!existing) {
      res.status(404).json({ error: 'Cavab tapılmadı.' });
      return;
    }
    await prisma.formSubmission.delete({ where: { id: req.params.sid } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/forms:
 *   get:
 *     summary: List forms with answer counts (admin)
 *     tags: [Forms]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    const [forms, counts] = await Promise.all([
      prisma.form.findMany({
        orderBy: { updatedAt: 'desc' },
        include: { locales: { select: { locale: true } } },
      }),
      prisma.formSubmission.groupBy({ by: ['formId', 'status'], _count: { _all: true } }),
    ]);

    res.json(
      forms.map((f) => {
        const mine = counts.filter((c) => c.formId === f.id);
        return {
          id: f.id,
          name: f.name,
          isActive: f.isActive,
          updatedAt: f.updatedAt,
          locales: f.locales.map((l) => l.locale),
          submissionCount: mine.reduce((sum, c) => sum + c._count._all, 0),
          newCount: mine.find((c) => c.status === 'new')?._count._all ?? 0,
        };
      }),
    );
  } catch (error) {
    console.error('Error listing forms:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const createFormSchema = z.object({ name: z.string().trim().min(1, 'Ad boş ola bilməz').max(200) });

/**
 * @swagger
 * /api/forms:
 *   post:
 *     summary: Create an empty form (admin)
 *     tags: [Forms]
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/', requireAuth, validate(createFormSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const form = await prisma.form.create({ data: { name: req.body.name } });
    res.json(await loadAdminForm(form.id));
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function loadAdminForm(id: string) {
  const form = await prisma.form.findUnique({ where: { id }, include: { locales: true } });
  if (!form) return null;

  const locales: Record<string, unknown> = {};
  for (const l of form.locales) {
    locales[l.locale] = {
      fields: parseFields(l.fields),
      submitLabel: l.submitLabel,
      successTitle: l.successTitle,
      successText: l.successText,
    };
  }
  return { id: form.id, name: form.name, isActive: form.isActive, createdAt: form.createdAt, updatedAt: form.updatedAt, locales };
}

/**
 * @swagger
 * /api/forms/{id}:
 *   get:
 *     summary: Get a form with all language versions (admin)
 *     tags: [Forms]
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
    const form = await loadAdminForm(req.params.id);
    if (!form) {
      res.status(404).json({ error: 'Forma tapılmadı.' });
      return;
    }
    res.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const updateFormSchema = z.object({
  name: z.string().trim().min(1, 'Ad boş ola bilməz').max(200),
  isActive: z.boolean(),
  locales: z.object({
    az: formLocaleSchema.optional(),
    ru: formLocaleSchema.optional(),
    en: formLocaleSchema.optional(),
  }),
});

/**
 * @swagger
 * /api/forms/{id}:
 *   put:
 *     summary: Save name, active flag and the fields/texts of every language (admin)
 *     tags: [Forms]
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
router.put('/:id', requireAuth, validate(updateFormSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payload = req.body as z.infer<typeof updateFormSchema>;

    const existing = await prisma.form.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Forma tapılmadı.' });
      return;
    }

    // A language exists only while it has at least one field
    const keep = FORM_LOCALES.filter((l) => (payload.locales[l]?.fields.length ?? 0) > 0);

    await prisma.$transaction([
      prisma.form.update({ where: { id }, data: { name: payload.name, isActive: payload.isActive } }),
      prisma.formLocale.deleteMany({ where: { formId: id, locale: { notIn: keep } } }),
      ...keep.map((locale) => {
        const def = payload.locales[locale]!;
        const data = {
          fields: def.fields as unknown as Prisma.InputJsonValue,
          submitLabel: def.submitLabel,
          successTitle: def.successTitle,
          successText: def.successText,
        };
        return prisma.formLocale.upsert({
          where: { formId_locale: { formId: id, locale } },
          create: { formId: id, locale, ...data },
          update: data,
        });
      }),
    ]);

    res.json(await loadAdminForm(id));
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/forms/{id}/duplicate:
 *   post:
 *     summary: Copy a form (without its answers) (admin)
 *     tags: [Forms]
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
    const source = await prisma.form.findUnique({ where: { id: req.params.id }, include: { locales: true } });
    if (!source) {
      res.status(404).json({ error: 'Forma tapılmadı.' });
      return;
    }
    const copy = await prisma.form.create({
      data: {
        name: `${source.name} (kopya)`.slice(0, 200),
        isActive: source.isActive,
        locales: {
          create: source.locales.map((l) => ({
            locale: l.locale,
            fields: l.fields as Prisma.InputJsonValue,
            submitLabel: l.submitLabel,
            successTitle: l.successTitle,
            successText: l.successText,
          })),
        },
      },
    });
    res.json(await loadAdminForm(copy.id));
  } catch (error) {
    console.error('Error duplicating form:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/forms/{id}:
 *   delete:
 *     summary: Delete a form without answers; forms with answers must be deactivated (admin)
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       400:
 *         description: The form has answers
 */
router.delete('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.form.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Forma tapılmadı.' });
      return;
    }
    const answers = await prisma.formSubmission.count({ where: { formId: id } });
    if (answers > 0) {
      res.status(400).json({ error: `Bu formanın ${answers} cavabı var, silmək olmaz. Əvəzinə formanı deaktiv edin.` });
      return;
    }
    await prisma.form.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/forms/{id}/submissions:
 *   get:
 *     summary: Answers of one form, newest first (admin)
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:id/submissions', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const status = z.enum(['new', 'read', 'archived']).safeParse(req.query.status);
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);

    const where: Prisma.FormSubmissionWhereInput = { formId: id, ...(status.success ? { status: status.data } : {}) };

    const [submissions, totalItems, unreadCount] = await Promise.all([
      prisma.formSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * SUBMISSIONS_PAGE_SIZE,
        take: SUBMISSIONS_PAGE_SIZE,
      }),
      prisma.formSubmission.count({ where }),
      prisma.formSubmission.count({ where: { formId: id, status: 'new' } }),
    ]);

    res.json({
      submissions,
      pagination: { page, pageSize: SUBMISSIONS_PAGE_SIZE, totalItems, totalPages: Math.ceil(totalItems / SUBMISSIONS_PAGE_SIZE) },
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
