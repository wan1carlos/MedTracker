import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { HealthDataController } from '../controllers/healthDataController.js';

const router = express.Router();

router.get('/', authMiddleware, HealthDataController.getUserHealthData);
router.post('/', authMiddleware, HealthDataController.addHealthData);
router.delete('/:id', authMiddleware, HealthDataController.deleteHealthData);

export default router; 