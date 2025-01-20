import express from 'express';
import { AdminAuthController } from '../controllers/adminAuthController.js';

const router = express.Router();

router.post('/login', AdminAuthController.login);

export default router; 