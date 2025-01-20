import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { AdminController } from '../controllers/adminController.js';

const router = express.Router();

router.get('/users', authMiddleware, adminMiddleware, AdminController.getAllUsers);
router.get('/users/:userId/health', authMiddleware, adminMiddleware, AdminController.getUserHealthData);
router.delete('/users/:userId', authMiddleware, adminMiddleware, AdminController.deleteUser);
router.delete('/users/:userId/health/:recordId', authMiddleware, adminMiddleware, AdminController.deleteHealthRecord);

export default router; 