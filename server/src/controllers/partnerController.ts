import { Request, Response, NextFunction } from 'express';
import * as partnerService from '../services/partnerService.js';

export async function createInvite(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;

    const invite = await partnerService.createInvite(userId);

    res.status(201).json({
      message: 'Invite code created',
      ...invite,
    });
  } catch (error) {
    next(error);
  }
}

export async function joinPartnership(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const { code } = req.body;

    const partnership = await partnerService.joinWithInvite(userId, code);

    res.json({
      message: 'Successfully joined partnership',
      partnership,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentPartnership(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;

    const partnership = await partnerService.getCurrentPartnership(userId);

    if (!partnership) {
      res.status(404).json({ error: 'No active partnership found' });
      return;
    }

    res.json({ partnership });
  } catch (error) {
    next(error);
  }
}

export async function getActivityFeed(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const partnershipId = (req as any).partnershipId;
    const { limit, cursor } = req.query;

    const feed = await partnerService.getActivityFeed(
      partnershipId,
      limit ? parseInt(limit as string, 10) : 20,
      cursor as string | undefined
    );

    res.json(feed);
  } catch (error) {
    next(error);
  }
}
