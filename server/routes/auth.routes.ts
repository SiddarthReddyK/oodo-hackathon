import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db/dataStore';
import { authLoginSchema, authRegisterSchema, validateBody } from '../validators/schemas';
import { JWT_SECRET, AuthRequest, authMiddleware } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';
import { User } from '../../src/types/inventory';

export const authRouter = Router();

const sanitizeUser = (user: User): Omit<User, 'passwordHash'> => {
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
};

// POST /api/auth/login
authRouter.post(
  '/login',
  validateBody(authLoginSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { emailOrLoginId, password } = req.body;
    const clean = emailOrLoginId.trim().toLowerCase();

    const user = db.users.find(u => {
      const email = u.email.toLowerCase();
      const name = u.name.toLowerCase();
      const slug = name.replace(/\s+/g, '.');
      const emailPrefix = email.split('@')[0];
      return (
        email === clean ||
        name === clean ||
        slug === clean ||
        emailPrefix === clean ||
        (!clean.includes('@') && email === `${clean}@stocksense.io`)
      );
    });

    if (!user || !user.passwordHash) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials or user not found' });
      return;
    }

    // Verify password against stored bcrypt hash using bcrypt.compare()
    const isMatch = await bcrypt.compare(password || '', user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid password' });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: sanitizeUser(user)
    });
  })
);

// POST /api/auth/register
authRouter.post(
  '/register',
  validateBody(authRegisterSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, email, role, warehouseId, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const existing = db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      const token = jwt.sign(
        {
          id: existing.id,
          email: existing.email,
          role: existing.role,
          name: existing.name
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      res.json({ token, user: sanitizeUser(existing) });
      return;
    }

    // Securely hash password with bcrypt (10 rounds salt)
    const rawPassword = password && password.trim() ? password : 'Stocksense2026!';
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role,
      title: role === 'inventory_manager' ? 'Inventory Manager' : 'Warehouse Staff',
      warehouseId: warehouseId || 'wh-northdock',
      avatarUrl: '/src/assets/images/stocksense_user_avatar_1790401027960.jpg',
      passwordHash
    };

    db.users.push(newUser);
    db.save();

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: sanitizeUser(newUser)
    });
  })
);

// POST /api/auth/refresh
authRouter.post(
  '/refresh',
  asyncHandler((req: Request, res: Response): void => {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.startsWith('Bearer '))
      ? authHeader.split(' ')[1]
      : req.body?.token;

    if (!token) {
      res.status(401).json({ error: 'Unauthorized', message: 'No token provided to refresh' });
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as any;
      const user = db.users.find(u => u.id === decoded.id);

      if (!user) {
        res.status(401).json({ error: 'Unauthorized', message: 'User no longer exists' });
        return;
      }

      const newToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token: newToken,
        user: sanitizeUser(user)
      });
    } catch {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid refresh token' });
    }
  })
);

// GET /api/auth/me
authRouter.get(
  '/me',
  authMiddleware,
  asyncHandler((req: Request, res: Response): void => {
    const authReq = req as AuthRequest;
    const user = db.users.find(u => u.id === authReq.user?.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user: sanitizeUser(user) });
  })
);
