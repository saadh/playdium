import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/database.js';

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  isChild: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      userId?: string;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      req.user = decoded;
      req.userId = decoded.userId;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
        return;
      }
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      req.user = decoded;
      req.userId = decoded.userId;
    } catch {
      // Token invalid, but that's okay for optional auth
    }

    next();
  } catch (error) {
    next(error);
  }
}

// Middleware to check if user is part of a partnership
export async function requirePartnership(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const partnership = await prisma.partnership.findFirst({
      where: {
        status: 'ACTIVE',
        OR: [
          { user1Id: req.userId },
          { user2Id: req.userId },
        ],
      },
    });

    if (!partnership) {
      res.status(403).json({ error: 'No active partnership found' });
      return;
    }

    // Attach partnership info to request
    (req as any).partnershipId = partnership.id;
    (req as any).partnerId = partnership.user1Id === req.userId
      ? partnership.user2Id
      : partnership.user1Id;

    next();
  } catch (error) {
    next(error);
  }
}
