import { UserModel } from '../models/userModel.js';
import { HealthDataModel } from '../models/healthDataModel.js';

export const AdminController = {
    getAllUsers: async (req, res) => {
        try {
            const users = await UserModel.findAll();
            const sanitizedUsers = users.map(user => {
                const { password_hash, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });
            res.json(sanitizedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ message: 'Error fetching users', error: error.message });
        }
    },

    getUserHealthData: async (req, res) => {
        try {
            const userId = req.params.userId;
            const user = await UserModel.findById(userId);
            const healthData = await HealthDataModel.findByUserId(userId);
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Always return an array for healthData
            res.json({
                user,
                healthData: healthData || []
            });
        } catch (error) {
            console.error('Error fetching user health data:', error);
            res.status(500).json({ message: 'Error fetching health data', error: error.message });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const { userId } = req.params;
            const deleted = await UserModel.delete(userId);
            if (!deleted) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({ message: 'User account has been deactivated successfully' });
        } catch (error) {
            console.error('Error deactivating user:', error);
            res.status(500).json({ message: 'Error deactivating user', error: error.message });
        }
    },

    deleteHealthRecord: async (req, res) => {
        try {
            const { userId, recordId } = req.params;
            const deleted = await HealthDataModel.delete(recordId, userId);
            if (!deleted) {
                return res.status(404).json({ message: 'Health record not found' });
            }
            res.json({ message: 'Health record deleted successfully' });
        } catch (error) {
            console.error('Error deleting health record:', error);
            res.status(500).json({ message: 'Error deleting health record', error: error.message });
        }
    }
}; 