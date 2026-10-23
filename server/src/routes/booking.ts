import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth';
import {
  BOOKING_LOCALES,
  DEFAULT_BOOKING_SETTINGS,
  BookingSettingsData,
  bookingSettingsSchema,
  computeSlots,
  isSlotAvailable,
  isValidTimeZone,
  localToDate,
  pickLocaleText,
} from '../lib/bookingSlots';

const router = Router();
const prisma = new PrismaClient();

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

const localeSchema = z.enum(BOOKING_LOCALES);
const BOOKINGS_PAGE_SIZE = 20;
const MAX_SLOT_RANGE_DAYS = 62;

// All booking attempts take this lock inside their transaction, so two visitors can
// never both be given the same time (works across several API replicas).
const BOOKING_LOCK_KEY = 728_339;

// ---------------------------------------------------------------------------
// Soft rate limit for public bookings (in memory, per client address)
// ---------------------------------------------------------------------------
const bookLimits = new Map<string, { count: number; resetAt: number }>();
const LIMIT_WINDOW_MS = 60 * 60 * 1000;
const LIMIT_MAX = 5;

function allowBooking(req: Request): boolean {
  const forwarded = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim();
  const key = forwarded || req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  if (bookLimits.size > 5000) {
    for (const [k, v] of bookLimits) if (now > v.resetAt) bookLimits.delete(k);
  }
  const entry = bookLimits.get(key);
  if (!entry || now > entry.resetAt) {
    bookLimits.set(key, { count: 1, resetAt: now + LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loadSettings(): Promise<BookingSettingsData> {
  const row = await prisma.bookingSettings.upsert({
    where: { id: 'default' },
    create: { id: 'default', ...DEFAULT_BOOKING_SETTINGS, weeklyHours: DEFAULT_BOOKING_SETTINGS.weeklyHours as unknown as Prisma.InputJsonValue },
    update: {},
  });
  const parsed = bookingSettingsSchema.safeParse({
    timezone: row.timezone,
    weeklyHours: row.weeklyHours,
    slotStepMinutes: row.slotStepMinutes,
    bufferMinutes: row.bufferMinutes,
    minNoticeHours: row.minNoticeHours,
    maxDaysAhead: row.maxDaysAhead,
  });
  return parsed.success ? parsed.data : DEFAULT_BOOKING_SETTINGS;
}

type Db = Prisma.TransactionClient | PrismaClient;

/** Confirmed bookings and time off that can influence slots in [from, to). */
async function loadBusy(db: Db, settings: BookingSettingsData, from: Date, to: Date) {
  const pad = (settings.bufferMinutes + 24 * 60) * 60_000;
  const [bookings, timeOff] = await Promise.all([
    db.booking.findMany({
      where: { status: 'confirmed', startsAt: { lt: new Date(to.getTime() + pad) }, endsAt: { gt: new Date(from.getTime() - pad) } },
      select: { startsAt: true, endsAt: true },
    }),
    db.bookingTimeOff.findMany({
      where: { startsAt: { lt: new Date(to.getTime() + pad) }, endsAt: { gt: new Date(from.getTime() - pad) } },
      select: { startsAt: true, endsAt: true },
    }),
  ]);
  return {
    bookings: bookings.map((b) => ({ start: b.startsAt, end: b.endsAt })),
    timeOff: timeOff.map((t) => ({ start: t.startsAt, end: t.endsAt })),
  };
}

const emptyToNull = (v?: string | null) => (v && v.trim() ? v.trim() : null);

// ---------------------------------------------------------------------------
// Public routes
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /api/booking/public/types:
 *   get:
 *     summary: Active meeting types for one locale
 *     tags: [Booking]
 *     parameters:
 *       - in: query
 *         name: locale
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/public/types', async (req: Request, res: Response): Promise<void> => {
  try {
    const locale = localeSchema.safeParse(req.query.locale);
    if (!locale.success) {
      res.status(400).json({ error: 'locale query param is required' });
      return;
    }
    // A type without a text in this language falls back to Azerbaijani (then any language),
    // so forgetting one language does not make the type disappear from the site.
    const types = await prisma.bookingType.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      include: { locales: true },
    });
    res.json(
      types.flatMap((t) => {
        const text = pickLocaleText(t.locales, locale.data);
        return text ? [{ id: t.id, durationMinutes: t.durationMinutes, title: text.title, description: text.description }] : [];
      }),
    );
  } catch (error) {
    console.error('Error fetching booking types:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const slotsQuerySchema = z.object({
  typeId: z.string().min(1).max(100),
  from: z.string().min(1),
  to: z.string().min(1),
});

/**
 * @swagger
 * /api/booking/public/slots:
 *   get:
 *     summary: Available start times (UTC) for a meeting type in a date range (max 62 days)
 *     tags: [Booking]
 *     parameters:
 *       - in: query
 *         name: typeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/public/slots', async (req: Request, res: Response): Promise<void> => {
  try {
    const q = slotsQuerySchema.safeParse(req.query);
    const from = q.success ? new Date(q.data.from) : null;
    const to = q.success ? new Date(q.data.to) : null;
    if (!q.success || !from || !to || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) {
      res.status(400).json({ error: 'typeId, from və to düzgün olmalıdır' });
      return;
    }
    if (to.getTime() - from.getTime() > MAX_SLOT_RANGE_DAYS * 86_400_000) {
      res.status(400).json({ error: `Aralıq ən çox ${MAX_SLOT_RANGE_DAYS} gün ola bilər` });
      return;
    }

    const type = await prisma.bookingType.findUnique({ where: { id: q.data.typeId } });
    if (!type || !type.isActive) {
      res.status(404).json({ error: 'Görüş növü tapılmadı' });
      return;
    }

    const settings = await loadSettings();
    const busy = await loadBusy(prisma, settings, from, to);
    const slots = computeSlots({
      settings,
      durationMinutes: type.durationMinutes,
      ...busy,
      from,
      to,
      now: new Date(),
    });

    res.set('Cache-Control', 'no-store');
    res.json({ timezone: settings.timezone, durationMinutes: type.durationMinutes, slots });
  } catch (error) {
    console.error('Error computing slots:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const bookSchema = z.object({
  typeId: z.string().min(1).max(100),
  startsAt: z.string().min(1),
  name: z.string().trim().min(1, 'Ad boş ola bilməz').max(200),
  email: z
    .string()
    .trim()
    .max(254)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Düzgün e-poçt daxil edin'),
  phone: z.string().trim().max(50).regex(/^([+()\d\s.\-]{5,30})?$/, 'Düzgün telefon nömrəsi daxil edin').optional(),
  message: z.string().trim().max(2000).optional(),
  locale: localeSchema,
  timezone: z.string().max(100).optional(),
  website: z.string().max(500).optional(), // honeypot
});

/**
 * @swagger
 * /api/booking/public/book:
 *   post:
 *     summary: Book a meeting slot
 *     tags: [Booking]
 *     responses:
 *       200:
 *         description: Booked
 *       409:
 *         description: The time is no longer available
 *       429:
 *         description: Too many attempts
 */
router.post('/public/book', validate(bookSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body as z.infer<typeof bookSchema>;

    // Honeypot: bots fill the hidden field; answer "success" so they do not retry
    if (payload.website) {
      res.json({ success: true });
      return;
    }
    if (!allowBooking(req)) {
      res.status(429).json({ error: 'Çox sayda cəhd edildi. Zəhmət olmasa bir qədər sonra yenidən cəhd edin.' });
      return;
    }

    const startsAt = new Date(payload.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
      res.status(400).json({ error: 'Vaxt düzgün deyil' });
      return;
    }

    const type = await prisma.bookingType.findUnique({ where: { id: payload.typeId }, include: { locales: true } });
    if (!type || !type.isActive) {
      res.status(404).json({ error: 'Görüş növü tapılmadı' });
      return;
    }

    const settings = await loadSettings();
    const endsAt = new Date(startsAt.getTime() + type.durationMinutes * 60_000);

    const booking = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${BOOKING_LOCK_KEY})`;
      const busy = await loadBusy(tx, settings, startsAt, endsAt);
      const available = isSlotAvailable({
        settings,
        durationMinutes: type.durationMinutes,
        ...busy,
        startsAt,
        now: new Date(),
      });
      if (!available) return null;

      return tx.booking.create({
        data: {
          typeId: type.id,
          startsAt,
          endsAt,
          name: payload.name,
          email: payload.email,
          phone: emptyToNull(payload.phone),
          message: emptyToNull(payload.message),
          locale: payload.locale,
          visitorTimezone: payload.timezone && isValidTimeZone(payload.timezone) ? payload.timezone : '',
        },
      });
    });

    if (!booking) {
      res.status(409).json({ error: 'Bu vaxt artıq tutulub. Zəhmət olmasa başqa vaxt seçin.' });
      return;
    }

    const text = pickLocaleText(type.locales, payload.locale) ?? type.locales[0];
    res.json({
      success: true,
      booking: {
        id: booking.id,
        startsAt: booking.startsAt,
        endsAt: booking.endsAt,
        title: text?.title ?? type.name,
        locationNote: text?.locationNote ?? '',
        successText: text?.successText ?? '',
      },
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Rezervasiya zamanı xəta baş verdi.' });
  }
});

// ---------------------------------------------------------------------------
// Admin: settings
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /api/booking/settings:
 *   get:
 *     summary: Working hours and booking rules (admin)
 *     tags: [Booking]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/settings', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json(await loadSettings());
  } catch (error) {
    console.error('Error loading booking settings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/booking/settings:
 *   put:
 *     summary: Save working hours and booking rules (admin)
 *     tags: [Booking]
 *     responses:
 *       200:
 *         description: OK
 */
router.put('/settings', requireAuth, validate(bookingSettingsSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body as BookingSettingsData;
    const weeklyHours = data.weeklyHours as unknown as Prisma.InputJsonValue;
    await prisma.bookingSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...data, weeklyHours },
      update: { ...data, weeklyHours },
    });
    res.json(await loadSettings());
  } catch (error) {
    console.error('Error saving booking settings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ---------------------------------------------------------------------------
// Admin: meeting types
// ---------------------------------------------------------------------------

const typeLocaleSchema = z.object({
  title: z.string().trim().max(200).default(''),
  description: z.string().trim().max(3000).default(''),
  locationNote: z.string().trim().max(1000).default(''),
  successText: z.string().trim().max(2000).default(''),
});

const typeSchema = z.object({
  name: z.string().trim().min(1, 'Ad boş ola bilməz').max(200),
  durationMinutes: z.number().int().min(5, 'Müddət ən azı 5 dəqiqə olmalıdır').max(480),
  isActive: z.boolean().default(true),
  locales: z
    .object({
      az: typeLocaleSchema.optional(),
      ru: typeLocaleSchema.optional(),
      en: typeLocaleSchema.optional(),
    })
    .default({}),
});

async function loadAdminType(id: string) {
  const type = await prisma.bookingType.findUnique({
    where: { id },
    include: { locales: true, _count: { select: { bookings: true } } },
  });
  if (!type) return null;
  const locales: Record<string, unknown> = {};
  for (const l of type.locales) {
    locales[l.locale] = { title: l.title, description: l.description, locationNote: l.locationNote, successText: l.successText };
  }
  return {
    id: type.id,
    name: type.name,
    durationMinutes: type.durationMinutes,
    isActive: type.isActive,
    order: type.order,
    bookingCount: type._count.bookings,
    locales,
  };
}

/**
 * @swagger
 * /api/booking/types:
 *   get:
 *     summary: All meeting types with their language versions (admin)
 *     tags: [Booking]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/types', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    const types = await prisma.bookingType.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }], select: { id: true } });
    const full = await Promise.all(types.map((t) => loadAdminType(t.id)));
    res.json(full.filter(Boolean));
  } catch (error) {
    console.error('Error listing booking types:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const reorderSchema = z.object({ ids: z.array(z.string().max(100)).max(100) });

/**
 * @swagger
 * /api/booking/types/reorder:
 *   put:
 *     summary: Set the display order of meeting types (admin)
 *     tags: [Booking]
 *     responses:
 *       200:
 *         description: OK
 */
router.put('/types/reorder', requireAuth, validate(reorderSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids } = req.body as z.infer<typeof reorderSchema>;
    await prisma.$transaction(ids.map((id, i) => prisma.bookingType.updateMany({ where: { id }, data: { order: i } })));
    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering booking types:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/booking/types:
 *   post:
 *     summary: Create a meeting type (admin)
 *     tags: [Booking]
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/types', requireAuth, validate(typeSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body as z.infer<typeof typeSchema>;
    const last = await prisma.bookingType.aggregate({ _max: { order: true } });
    const type = await prisma.bookingType.create({
      data: {
        name: payload.name,
        durationMinutes: payload.durationMinutes,
        isActive: payload.isActive,
        order: (last._max.order ?? -1) + 1,
        locales: {
          create: BOOKING_LOCALES.filter((l) => payload.locales[l]?.title).map((l) => ({ locale: l, ...payload.locales[l]! })),
        },
      },
    });
    res.json(await loadAdminType(type.id));
  } catch (error) {
    console.error('Error creating booking type:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/booking/types/{id}:
 *   put:
 *     summary: Save a meeting type and its language versions (admin)
 *     tags: [Booking]
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
router.put('/types/:id', requireAuth, validate(typeSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payload = req.body as z.infer<typeof typeSchema>;
    const existing = await prisma.bookingType.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Görüş növü tapılmadı.' });
      return;
    }

    // A language exists only while it has a title
    const keep = BOOKING_LOCALES.filter((l) => payload.locales[l]?.title);

    await prisma.$transaction([
      prisma.bookingType.update({
        where: { id },
        data: { name: payload.name, durationMinutes: payload.durationMinutes, isActive: payload.isActive },
      }),
      prisma.bookingTypeLocale.deleteMany({ where: { typeId: id, locale: { notIn: keep } } }),
      ...keep.map((locale) =>
        prisma.bookingTypeLocale.upsert({
          where: { typeId_locale: { typeId: id, locale } },
          create: { typeId: id, locale, ...payload.locales[locale]! },
          update: payload.locales[locale]!,
        }),
      ),
    ]);
    res.json(await loadAdminType(id));
  } catch (error) {
    console.error('Error updating booking type:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/booking/types/{id}:
 *   delete:
 *     summary: Delete a meeting type that has no bookings; otherwise deactivate it (admin)
 *     tags: [Booking]
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
 *         description: The type has bookings
 */
router.delete('/types/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.bookingType.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Görüş növü tapılmadı.' });
      return;
    }
    const count = await prisma.booking.count({ where: { typeId: id } });
    if (count > 0) {
      res.status(400).json({ error: `Bu görüş növünün ${count} rezervasiyası var, silmək olmaz. Əvəzinə onu deaktiv edin.` });
      return;
    }
    await prisma.bookingType.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking type:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ---------------------------------------------------------------------------
// Admin: time off
// ---------------------------------------------------------------------------

const timeOffSchema = z.object({
  startsLocal: z.string().min(1),
  endsLocal: z.string().min(1),
  reason: z.string().trim().max(200).default(''),
});

/**
 * @swagger
 * /api/booking/time-off:
 *   get:
 *     summary: Blocked periods that have not ended yet (admin)
 *     tags: [Booking]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/time-off', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.bookingTimeOff.findMany({
      where: { endsAt: { gte: new Date() } },
      orderBy: { startsAt: 'asc' },
    });
    res.json(items);
  } catch (error) {
    console.error('Error listing time off:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/booking/time-off:
 *   post:
 *     summary: Block a period (holiday, vacation). Times are in the business time zone (admin)
 *     tags: [Booking]
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/time-off', requireAuth, validate(timeOffSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body as z.infer<typeof timeOffSchema>;
    const settings = await loadSettings();
    const startsAt = localToDate(payload.startsLocal, settings.timezone);
    const endsAt = localToDate(payload.endsLocal, settings.timezone);
    if (!startsAt || !endsAt) {
      res.status(400).json({ error: 'Tarix və saat düzgün deyil' });
      return;
    }
    if (endsAt <= startsAt) {
      res.status(400).json({ error: 'Bitmə vaxtı başlanğıcdan sonra olmalıdır' });
      return;
    }
    if (endsAt.getTime() - startsAt.getTime() > 366 * 86_400_000) {
      res.status(400).json({ error: 'Aralıq ən çox 1 il ola bilər' });
      return;
    }
    const item = await prisma.bookingTimeOff.create({ data: { startsAt, endsAt, reason: payload.reason } });
    res.json(item);
  } catch (error) {
    console.error('Error creating time off:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/booking/time-off/{id}:
 *   delete:
 *     summary: Remove a blocked period (admin)
 *     tags: [Booking]
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
router.delete('/time-off/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await prisma.bookingTimeOff.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Tapılmadı.' });
      return;
    }
    await prisma.bookingTimeOff.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting time off:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ---------------------------------------------------------------------------
// Admin: bookings
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /api/booking/unread-count:
 *   get:
 *     summary: Number of bookings the admin has not opened yet (admin)
 *     tags: [Booking]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/unread-count', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json({ unreadCount: await prisma.booking.count({ where: { isSeen: false, status: 'confirmed' } }) });
  } catch (error) {
    console.error('Error counting bookings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const scopeSchema = z.enum(['upcoming', 'past', 'cancelled']);

/**
 * @swagger
 * /api/booking/bookings:
 *   get:
 *     summary: Bookings by scope (upcoming, past, cancelled) with paging (admin)
 *     tags: [Booking]
 *     parameters:
 *       - in: query
 *         name: scope
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
router.get('/bookings', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const scope = scopeSchema.catch('upcoming').parse(req.query.scope);
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const now = new Date();

    const where: Prisma.BookingWhereInput =
      scope === 'upcoming'
        ? { status: 'confirmed', endsAt: { gte: now } }
        : scope === 'past'
          ? { status: 'confirmed', endsAt: { lt: now } }
          : { status: 'cancelled' };

    const [items, totalItems, unreadCount, settings] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { startsAt: scope === 'upcoming' ? 'asc' : 'desc' },
        skip: (page - 1) * BOOKINGS_PAGE_SIZE,
        take: BOOKINGS_PAGE_SIZE,
        include: { type: { select: { id: true, name: true } } },
      }),
      prisma.booking.count({ where }),
      prisma.booking.count({ where: { isSeen: false, status: 'confirmed' } }),
      loadSettings(),
    ]);

    res.json({
      timezone: settings.timezone,
      bookings: items,
      pagination: { page, pageSize: BOOKINGS_PAGE_SIZE, totalItems, totalPages: Math.ceil(totalItems / BOOKINGS_PAGE_SIZE) },
      unreadCount,
    });
  } catch (error) {
    console.error('Error listing bookings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const bookingUpdateSchema = z.object({
  status: z.enum(['confirmed', 'cancelled']).optional(),
  isSeen: z.boolean().optional(),
  adminNote: z.string().trim().max(2000).nullable().optional(),
});

/**
 * @swagger
 * /api/booking/bookings/{id}:
 *   put:
 *     summary: Cancel/restore a booking, mark it seen, or save an admin note (admin)
 *     tags: [Booking]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       409:
 *         description: Restoring would overlap another booking
 */
router.put('/bookings/:id', requireAuth, validate(bookingUpdateSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payload = req.body as z.infer<typeof bookingUpdateSchema>;
    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Rezervasiya tapılmadı.' });
      return;
    }

    const data: Prisma.BookingUpdateInput = {};
    if (payload.isSeen !== undefined) data.isSeen = payload.isSeen;
    if (payload.adminNote !== undefined) data.adminNote = emptyToNull(payload.adminNote);
    if (payload.status !== undefined) data.status = payload.status;

    // Restoring a cancelled booking must not collide with a booking made in the meantime
    if (payload.status === 'confirmed' && existing.status === 'cancelled') {
      const updated = await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${BOOKING_LOCK_KEY})`;
        const clash = await tx.booking.count({
          where: { id: { not: id }, status: 'confirmed', startsAt: { lt: existing.endsAt }, endsAt: { gt: existing.startsAt } },
        });
        if (clash > 0) return null;
        return tx.booking.update({ where: { id }, data });
      });
      if (!updated) {
        res.status(409).json({ error: 'Bu vaxt artıq başqa rezervasiya ilə tutulub, bərpa etmək olmur.' });
        return;
      }
      res.json(updated);
      return;
    }

    res.json(await prisma.booking.update({ where: { id }, data }));
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/booking/bookings/{id}:
 *   delete:
 *     summary: Delete a booking permanently, e.g. to remove personal data (admin)
 *     tags: [Booking]
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
router.delete('/bookings/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Rezervasiya tapılmadı.' });
      return;
    }
    await prisma.booking.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
