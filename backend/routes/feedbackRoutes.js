import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all feedback
router.get('/', authMiddleware, (req, res) => {
    res.status(501).json({ message: 'Get feedback - Not implemented' });
});

// Submit feedback
router.post('/', authMiddleware, (req, res) => {
    res.status(501).json({ message: 'Submit feedback - Not implemented' });
});

// Delete feedback
router.delete('/:id', authMiddleware, (req, res) => {
    res.status(501).json({ message: 'Delete feedback - Not implemented' });
});

export default router; 