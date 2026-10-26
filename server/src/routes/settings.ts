import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

const settingsSchema = z.object({
  // Free text for display ("+1 (770) 679-2620"); the link uses only its digits. Empty hides the WhatsApp UI.
  whatsappNumber: z
    .string()
    .trim()
    .max(40, 'Nömrə çox uzundur')
    .refine((v) => v === '' || /^[+\d\s()\-.]+$/.test(v), 'Nömrədə yalnız rəqəm, +, boşluq, ( ) və - ola bilər')
    .refine((v) => v === '' || (v.replace(/\D/g, '').length >= 7 && v.replace(/\D/g, '').length <= 15), 'Nömrə 7-15 rəqəmdən ibarət olmalıdır'),
});

async function readSettings() {
  // No seed needed: a missing row simply means "nothing set yet"
  const row = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
  return { whatsappNumber: row?.whatsappNumber ?? '' };
}

// Public: the site header/CTA read the WhatsApp number from here
router.get('/', async (_req, res) => {
  try {
    res.json(await readSettings());
  } catch (error) {
    console.error('[Settings] read failed:', error);
    res.status(500).json({ error: 'Ayarlar oxuna bilmədi.' });
  }
});

router.put('/', requireAuth, async (req, res) => {
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Məlumat düzgün deyil' });
  }
  try {
    await prisma.siteSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', whatsappNumber: parsed.data.whatsappNumber },
      update: { whatsappNumber: parsed.data.whatsappNumber },
    });
    res.json(await readSettings());
  } catch (error) {
    console.error('[Settings] update failed:', error);
    res.status(500).json({ error: 'Ayarlar yadda saxlanıla bilmədi.' });
  }
});

export default router;
