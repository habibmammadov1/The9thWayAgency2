"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const requireAuth_1 = require("../middleware/requireAuth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// All routes in this file require authentication — no exceptions
router.use(requireAuth_1.requireAuth);
// ─────────────────────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────────────────────
const createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Ad tələb olunur'),
    email: zod_1.z.string().email('Düzgün e-poçt ünvanı daxil edin'),
    password: zod_1.z.string().min(8, 'Şifrə minimum 8 simvol olmalıdır'),
    role: zod_1.z.string().default('admin'),
});
const updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Ad tələb olunur').optional(),
    email: zod_1.z.string().email('Düzgün e-poçt ünvanı daxil edin').optional(),
    role: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
});
const resetPasswordSchema = zod_1.z.object({
    newPassword: zod_1.z.string().min(8, 'Şifrə minimum 8 simvol olmalıdır'),
});
// Helper: strip sensitive fields
function safeUser(user) {
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
router.get('/', async (req, res) => {
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
    }
    catch (error) {
        console.error('[AdminUsers] GET / error:', error);
        return res.status(500).json({ error: 'İstifadəçilər yüklənə bilmədi' });
    }
});
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/users — create a new admin user
// TODO: replace with email-based invite flow once SMTP/email service is configured
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
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
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma.adminUser.create({
            data: { name, email, passwordHash, role, mustChangePassword: true },
        });
        return res.status(201).json({ user: safeUser(user) });
    }
    catch (error) {
        console.error('[AdminUsers] POST / error:', error);
        return res.status(500).json({ error: 'İstifadəçi yaradıla bilmədi' });
    }
});
// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/users/:id — update name / email / role / isActive
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const currentUserId = req.adminUser.id;
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Yanlış məlumat' });
    }
    const updates = parsed.data;
    try {
        const target = await prisma.adminUser.findUnique({ where: { id } });
        if (!target)
            return res.status(404).json({ error: 'İstifadəçi tapılmadı' });
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
    }
    catch (error) {
        console.error('[AdminUsers] PUT /:id error:', error);
        return res.status(500).json({ error: 'İstifadəçi yenilənə bilmədi' });
    }
});
// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/users/:id — permanently delete a user
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const currentUserId = req.adminUser.id;
    try {
        const target = await prisma.adminUser.findUnique({ where: { id } });
        if (!target)
            return res.status(404).json({ error: 'İstifadəçi tapılmadı' });
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
    }
    catch (error) {
        console.error('[AdminUsers] DELETE /:id error:', error);
        return res.status(500).json({ error: 'İstifadəçi silinə bilmədi' });
    }
});
// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/users/:id/reset-password — admin resets another user's password
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id/reset-password', async (req, res) => {
    const { id } = req.params;
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Yanlış məlumat' });
    }
    try {
        const target = await prisma.adminUser.findUnique({ where: { id } });
        if (!target)
            return res.status(404).json({ error: 'İstifadəçi tapılmadı' });
        const passwordHash = await bcryptjs_1.default.hash(parsed.data.newPassword, 12);
        await prisma.adminUser.update({
            where: { id },
            data: { passwordHash, mustChangePassword: true },
        });
        return res.json({ ok: true });
    }
    catch (error) {
        console.error('[AdminUsers] PUT /:id/reset-password error:', error);
        return res.status(500).json({ error: 'Şifrə sıfırlana bilmədi' });
    }
});
exports.default = router;
