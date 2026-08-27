"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(req, res, next) {
    const token = req.cookies?.admin_token;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: no session' });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error('JWT_SECRET is not set');
        return res.status(500).json({ error: 'Server configuration error' });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, secret);
        req.adminUser = payload;
        next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Unauthorized: invalid or expired session' });
    }
}
