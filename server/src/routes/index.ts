import { Router } from 'express';
import authRoutes from './auth.js';
import partnerRoutes from './partners.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API version
router.get('/', (req, res) => {
  res.json({
    name: 'DuoPlay API',
    version: '1.0.0',
    description: 'Async-friendly 2-player gaming platform',
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/partnerships', partnerRoutes);

// Game routes will be added here
// router.use('/games/garden', gardenRoutes);
// router.use('/games/doodle', doodleRoutes);
// router.use('/games/treasure', treasureRoutes);

export default router;
