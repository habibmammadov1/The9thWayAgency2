"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const zod_1 = require("zod");
const requireAuth_1 = require("../middleware/requireAuth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Rate-limit login: 10 attempts per 15 minutes per IP
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Çox sayda uğursuz cəhd. 15 dəqiqə sonra yenidən cəhd edin.' },
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Düzgün e-poçt ünvanı daxil edin'),
    password: zod_1.z.string().min(1, 'Şifrə tələb olunur'),
});
// Helper — build cookie options based on environment
function cookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProd, // HTTPS only in prod
        sameSite: (isProd ? 'strict' : 'lax'),
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
        path: '/',
    };
}
// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Yanlış məlumat' });
    }
    const { email, password } = parsed.data;
    try {
        const user = await prisma.adminUser.findUnique({ where: { email } });
        // Use a constant-time check even when user is not found to prevent timing attacks
        const dummyHash = '$2a$10$invalidhashfortimingprotection00000000000000000000';
        const hashToCheck = user?.passwordHash ?? dummyHash;
        const passwordMatch = await bcryptjs_1.default.compare(password, hashToCheck);
        if (!user || !passwordMatch || !user.isActive) {
            return res.status(401).json({ error: 'E-poçt və ya şifrə yanlışdır' });
        }
        const secret = process.env.JWT_SECRET;
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, secret, { expiresIn: '7d' });
        // Update lastLoginAt
        await prisma.adminUser.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        res.cookie('admin_token', token, cookieOptions());
        return res.json({
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Server xətası. Yenidən cəhd edin.' });
    }
});
// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.clearCookie('admin_token', { path: '/' });
    return res.json({ ok: true });
});
// GET /api/auth/me
router.get('/me', async (req, res) => {
    const token = req.cookies?.admin_token;
    if (!token)
        return res.status(401).json({ error: 'Unauthorized' });
    const secret = process.env.JWT_SECRET;
    if (!secret)
        return res.status(500).json({ error: 'Server configuration error' });
    try {
        const payload = jsonwebtoken_1.default.verify(token, secret);
        // Verify user still exists and is active in DB
        const user = await prisma.adminUser.findUnique({ where: { id: payload.id } });
        if (!user || !user.isActive) {
            res.clearCookie('admin_token', { path: '/' });
            return res.status(401).json({ error: 'Unauthorized' });
        }
        return res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                mustChangePassword: user.mustChangePassword,
            },
        });
    }
    catch {
        return res.status(401).json({ error: 'Unauthorized' });
    }
});
// PUT /api/auth/change-password — for logged-in user to set a new password
// Used when mustChangePassword=true on first login with a temporary password
const changePasswordSchema = zod_1.z.object({
    newPassword: zod_1.z.string().min(8, 'Şifrə minimum 8 simvol olmalıdır'),
    confirmPassword: zod_1.z.string().min(1, 'Şifrəni təsdiqləyin'),
}).refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Şifrələr uyğun gəlmir',
    path: ['confirmPassword'],
});
router.put('/change-password', requireAuth_1.requireAuth, async (req, res) => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Yanlış məlumat' });
    }
    try {
        const user = await prisma.adminUser.findUnique({ where: { id: req.adminUser.id } });
        if (!user)
            return res.status(404).json({ error: 'İstifadəçi tapılmadı' });
        const passwordHash = await bcryptjs_1.default.hash(parsed.data.newPassword, 12);
        await prisma.adminUser.update({
            where: { id: user.id },
            data: { passwordHash, mustChangePassword: false },
        });
        return res.json({ ok: true });
    }
    catch (error) {
        console.error('[Auth] change-password error:', error);
        return res.status(500).json({ error: 'Şifrə dəyişdirilə bilmədi' });
    }
});
exports.default = router;
