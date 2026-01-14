import { Router } from 'express';
import { z } from 'zod';
import * as partnerController from '../controllers/partnerController.js';
import { authenticate, requirePartnership } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';

const router = Router();

// Validation schemas
const joinSchema = z.object({
  code: z
    .string()
    .transform((val) => val.toUpperCase())
    .refine((val) => /^PLAY-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(val), {
      message: 'Invalid invite code format. Expected: PLAY-XXXX-XXXX',
    }),
});

// Routes
router.post('/create-invite', authenticate, partnerController.createInvite);
router.post('/join', authenticate, validateBody(joinSchema), partnerController.joinPartnership);
router.get('/current', authenticate, partnerController.getCurrentPartnership);
router.get(
  '/activity-feed',
  authenticate,
  requirePartnership,
  partnerController.getActivityFeed
);

export default router;
