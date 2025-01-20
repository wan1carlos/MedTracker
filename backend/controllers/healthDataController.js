import { HealthDataModel } from '../models/healthDataModel.js';

export const HealthDataController = {
    getUserHealthData: async (req, res) => {
        try {
            const healthData = await HealthDataModel.findByUserId(req.user.userId);
            res.json(healthData);
        } catch (error) {
            console.error('Error fetching health data:', error);
            res.status(500).json({ message: 'Error fetching health data', error: error.message });
        }
    },

    addHealthData: async (req, res) => {
        try {
            const healthData = await HealthDataModel.create({
                user_id: req.user.userId,
                ...req.body
            });
            res.status(201).json(healthData);
        } catch (error) {
            console.error('Error adding health data:', error);
            res.status(500).json({ message: 'Error adding health data', error: error.message });
        }
    },

    deleteHealthData: async (req, res) => {
        try {
            const deleted = await HealthDataModel.delete(req.params.id, req.user.userId);
            if (!deleted) {
                return res.status(404).json({ message: 'Health data record not found' });
            }
            res.json({ message: 'Health data deleted successfully' });
        } catch (error) {
            console.error('Error deleting health data:', error);
            res.status(500).json({ message: 'Error deleting health data', error: error.message });
        }
    }
}; 