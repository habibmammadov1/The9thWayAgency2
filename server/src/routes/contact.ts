import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const prisma = new PrismaClient();

// Custom in-memory rate-limiter map to prevent brute-force spam submissions
const ipRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_SUBMISSIONS_PER_WINDOW = 5; // Max 5 submissions per hour per IP

function rateLimiter(ip: string): boolean {
  const now = Date.now();
  const limitInfo = ipRateLimitMap.get(ip);

  if (!limitInfo) {
    ipRateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (now > limitInfo.resetAt) {
    ipRateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (limitInfo.count >= MAX_SUBMISSIONS_PER_WINDOW) {
    return false;
  }

  limitInfo.count += 1;
  return true;
}

// 1. GET Contact Why Choose Us content & feature cards
router.get('/why-choose-us', async (req, res) => {
  try {
    const locale = (req.query.locale as string) || 'az';
    const content = await prisma.contactWhyChooseUsContent.findUnique({
      where: { locale }
    });

    const cards = await prisma.contactFeatureCard.findMany({
      where: { locale },
      orderBy: { order: 'asc' }
    });

    res.json({ content, cards });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load Why Choose Us content' });
  }
});

// 2. PUT Update Contact Why Choose Us content & feature cards
router.put('/why-choose-us', requireAuth, async (req, res) => {
  try {
    const locale = (req.query.locale as string) || 'az';
    const { content, cards } = req.body;

    const updatedContent = await prisma.contactWhyChooseUsContent.upsert({
      where: { locale },
      update: {
        overline: content.overline,
        chartLabel: content.chartLabel,
        chartHeading: content.chartHeading,
        chartParagraph: content.chartParagraph,
        chartBarValues: Array.isArray(content.chartBarValues) ? content.chartBarValues : JSON.parse(content.chartBarValues),
        rightHeading: content.rightHeading,
        rightParagraph: content.rightParagraph,
        bandText: content.bandText,
      },
      create: {
        locale,
        overline: content.overline,
        chartLabel: content.chartLabel,
        chartHeading: content.chartHeading,
        chartParagraph: content.chartParagraph,
        chartBarValues: Array.isArray(content.chartBarValues) ? content.chartBarValues : JSON.parse(content.chartBarValues),
        rightHeading: content.rightHeading,
        rightParagraph: content.rightParagraph,
        bandText: content.bandText,
      }
    });

    // Delete existing cards and insert new sorted cards
    await prisma.contactFeatureCard.deleteMany({ where: { locale } });
    if (cards && cards.length > 0) {
      await prisma.contactFeatureCard.createMany({
        data: cards.map((c: any, index: number) => ({
          locale,
          order: index + 1,
          icon: c.icon || 'LifeBuoy',
          title: c.title,
          description: c.description
        }))
      });
    }

    const updatedCards = await prisma.contactFeatureCard.findMany({
      where: { locale },
      orderBy: { order: 'asc' }
    });

    res.json({ content: updatedContent, cards: updatedCards });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update Why Choose Us content' });
  }
});

// 3. GET Contact Info coordinates and social links
router.get('/info', async (req, res) => {
  try {
    const locale = (req.query.locale as string) || 'az';
    const info = await prisma.contactInfo.findUnique({
      where: { locale }
    });

    const socialLinks = await prisma.footerSocialLink.findMany({
      orderBy: { order: 'asc' }
    });

    res.json({ info, socialLinks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Contact Info' });
  }
});

// 4. PUT Update Contact Info and social links
router.put('/info', requireAuth, async (req, res) => {
  try {
    const locale = (req.query.locale as string) || 'az';
    const { info, socialLinks } = req.body;

    const updatedInfo = await prisma.contactInfo.upsert({
      where: { locale },
      update: {
        address: info.address,
        phone: info.phone,
        email: info.email,
        workingHours: info.workingHours,
        mapLatitude: info.mapLatitude ? parseFloat(info.mapLatitude) : null,
        mapLongitude: info.mapLongitude ? parseFloat(info.mapLongitude) : null,
      },
      create: {
        locale,
        address: info.address,
        phone: info.phone,
        email: info.email,
        workingHours: info.workingHours,
        mapLatitude: info.mapLatitude ? parseFloat(info.mapLatitude) : null,
        mapLongitude: info.mapLongitude ? parseFloat(info.mapLongitude) : null,
      }
    });

    // Update global social links table
    if (socialLinks && socialLinks.length > 0) {
      await prisma.footerSocialLink.deleteMany();
      await prisma.footerSocialLink.createMany({
        data: socialLinks.map((s: any, idx: number) => ({
          platform: s.platform,
          url: s.url,
          order: idx + 1
        }))
      });
    }

    const updatedSocialLinks = await prisma.footerSocialLink.findMany({
      orderBy: { order: 'asc' }
    });

    res.json({ info: updatedInfo, socialLinks: updatedSocialLinks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update Contact Info' });
  }
});

// 5. POST Submit Contact Form submission with anti-spam honeypot
router.post('/submit', async (req, res) => {
  try {
    const { fullName, phone, email, message, sourcePage, locale, website } = req.body;
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    // Honeypot spam check: if website input has value, it's a bot submission
    if (website) {
      return res.status(200).json({ success: true, message: 'Spam filtered successfully' });
    }

    // Custom Rate Limiting
    if (!rateLimiter(clientIp)) {
      return res.status(429).json({ error: 'Çox sayda müraciət göndərildi. Zəhmət olmasa bir qədər sonra yenidən cəhd edin.' });
    }

    // Validations
    if (!fullName || !email || !message) {
      return res.status(400).json({ error: 'Ad, e-poçt və mesaj sahələri məcburidir.' });
    }

    const submission = await prisma.contactSubmission.create({
      data: {
        fullName,
        phone,
        email,
        message,
        sourcePage: sourcePage || 'home',
        locale: locale || 'az',
      }
    });

    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ error: 'Müraciət göndərilərkən xəta baş verdi.' });
  }
});

// 6. GET Fetch submissions inbox list
router.get('/submissions', async (req, res) => {
  try {
    const status = (req.query.status as string) || 'all';
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (status !== 'all') {
      where.status = status;
    }

    const [submissions, totalItems] = await Promise.all([
      prisma.contactSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.contactSubmission.count({ where }),
    ]);

    const unreadCount = await prisma.contactSubmission.count({
      where: { status: 'new' }
    });

    const totalPages = Math.ceil(totalItems / pageSize);

    res.json({
      submissions,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages
      },
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// 7. PUT Toggle submission read/archived status
router.put('/submissions/:id/status', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updated = await prisma.contactSubmission.update({
      where: { id },
      data: { status }
    });

    res.json({ success: true, submission: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update submission status' });
  }
});

export default router;
