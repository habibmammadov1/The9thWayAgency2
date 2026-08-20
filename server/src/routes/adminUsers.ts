import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const prisma = new PrismaClient();

// All routes in this file require authentication — no exceptions
router.use(requireAuth);

// ─────────────────────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────────────────────

const createUserSchema = z.object({
  name: z.string().min(1, 'Ad tələb olunur'),
  email: z.string().email('Düzgün e-poçt ünvanı daxil edin'),
  password: z.string().min(8, 'Şifrə minimum 8 simvol olmalıdır'),
  role: z.string().default('admin'),
});

const updateUserSchema = z.object({
  name: z.string().min(1, 'Ad tələb olunur').optional(),
  email: z.string().email('Düzgün e-poçt ünvanı daxil edin').optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Şifrə minimum 8 simvol olmalıdır'),
});

// Helper: strip sensitive fields
function safeUser(user: {
  id: string; email: string; name: string; role: string;
  isActive: boolean; mustChangePassword: boolean;
  lastLoginAt: Date | null; createdAt: Date; updatedAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    mustChangePassword: user.mustChangePassword,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/users — list all admin users
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await prisma.adminUser.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true, email: true, name: true, role: true,
        isActive: true, mustChangePassword: true,
        lastLoginAt: true, createdAt: true, updatedAt: true,
      },
    });
    return res.json({ users });
  } catch (error) {
    console.error('[AdminUsers] GET / error:', error);
    return res.status(500).json({ error: 'İstifadəçilər yüklənə bilmədi' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/users — create a new admin user
// TODO: replace with email-based invite flow once SMTP/email service is configured
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Yanlış məlumat' });
  }

  const { name, email, password, role } = parsed.data;

  try {
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: `"${email}" e-poçtu artıq istifadə olunur` });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.adminUser.create({
      data: { name, email, passwordHash, role, mustChangePassword: true },
    });

    return res.status(201).json({ user: safeUser(user) });
  } catch (error) {
    console.error('[AdminUsers] POST / error:', error);
    return res.status(500).json({ error: 'İstifadəçi yaradıla bilmədi' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/users/:id — update name / email / role / isActive
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUserId = req.adminUser!.id;

  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Yanlış məlumat' });
  }

  const updates = parsed.data;

  try {
    const target = await prisma.adminUser.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ error: 'İstifadəçi tapılmadı' });

    // Self-deactivation guard
    if (id === currentUserId && updates.isActive === false) {
      return res.status(400).json({ error: 'Öz hesabınızı deaktiv edə bilməzsiniz' });
    }

    // Enforce at least one active admin remains
    if (updates.isActive === false) {
      const activeCount = await prisma.adminUser.count({ where: { isActive: true } });
      if (activeCount <= 1) {
        return res.status(400).json({ error: 'Ən azı bir aktiv admin hesabı qalmalıdır' });
      }
    }

    // Email uniqueness check (if changing email)
    if (updates.email && updates.email !== target.email) {
      const conflict = await prisma.adminUser.findUnique({ where: { email: updates.email } });
      if (conflict) {
        return res.status(409).json({ error: `"${updates.email}" e-poçtu artıq istifadə olunur` });
      }
    }

    const updated = await prisma.adminUser.update({
      where: { id },
      data: updates,
    });

    return res.json({ user: safeUser(updated) });
  } catch (error) {
    console.error('[AdminUsers] PUT /:id error:', error);
    return res.status(500).json({ error: 'İstifadəçi yenilənə bilmədi' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/users/:id — permanently delete a user
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUserId = req.adminUser!.id;

  try {
    const target = await prisma.adminUser.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ error: 'İstifadəçi tapılmadı' });

    // Self-delete guard
    if (id === currentUserId) {
      return res.status(400).json({ error: 'Öz hesabınızı silə bilməzsiniz' });
    }

    // Enforce at least one active admin remains
    if (target.isActive) {
      const activeCount = await prisma.adminUser.count({ where: { isActive: true } });
      if (activeCount <= 1) {
        return res.status(400).json({ error: 'Yeganə aktiv admini silmək mümkün deyil' });
      }
    }

    await prisma.adminUser.delete({ where: { id } });
    return res.json({ ok: true });
  } catch (error) {
    console.error('[AdminUsers] DELETE /:id error:', error);
    return res.status(500).json({ error: 'İstifadəçi silinə bilmədi' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/users/:id/reset-password — admin resets another user's password
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id/reset-password', async (req: Request, res: Response) => {
  const { id } = req.params;

  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Yanlış məlumat' });
  }

  try {
    const target = await prisma.adminUser.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ error: 'İstifadəçi tapılmadı' });

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

    await prisma.adminUser.update({
      where: { id },
      data: { passwordHash, mustChangePassword: true },
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error('[AdminUsers] PUT /:id/reset-password error:', error);
    return res.status(500).json({ error: 'Şifrə sıfırlana bilmədi' });
  }
});

export default router;
