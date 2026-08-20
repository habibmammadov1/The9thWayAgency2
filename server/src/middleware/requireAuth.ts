import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AdminUserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Extend Express Request to carry the decoded admin user
declare global {
  namespace Express {
    interface Request {
      adminUser?: AdminUserPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
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
    const payload = jwt.verify(token, secret) as AdminUserPayload;
    req.adminUser = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: invalid or expired session' });
  }
}
