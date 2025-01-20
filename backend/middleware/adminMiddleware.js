import { UserModel } from '../models/userModel.js';

export const adminMiddleware = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user.userId);
        if (!user || !user.is_admin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({ message: 'Error checking admin privileges', error: error.message });
    }
}; 