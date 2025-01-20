import pool from '../config/database.js';
import { calculateAge } from '../utils/dateUtils.js';

export const HealthDataModel = {
    create: async (data) => {
        try {
            const {
                user_id,
                height,
                weight,
                blood_pressure_systolic,
                blood_pressure_diastolic,
                blood_sugar,
                heart_rate,
                cholesterol
            } = data;

            // Calculate BMI: weight (kg) / (height (m))²
            const heightInMeters = height / 100; // Convert cm to meters
            const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);

            const [result] = await pool.execute(
                `INSERT INTO health_data (
                    user_id, height, weight, blood_pressure_systolic,
                    blood_pressure_diastolic, blood_sugar, heart_rate,
                    cholesterol, bmi
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    user_id,
                    height,
                    weight,
                    blood_pressure_systolic,
                    blood_pressure_diastolic,
                    blood_sugar,
                    heart_rate,
                    cholesterol,
                    bmi
                ]
            );

            return result;
        } catch (error) {
            console.error('Error in create health data:', error);
            throw error;
        }
    },

    findByUserId: async (userId) => {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM health_data WHERE user_id = ? AND deleted_at IS NULL ORDER BY recorded_at DESC',
                [userId]
            );
            return rows; // This will always be an array
        } catch (error) {
            console.error('Error in findByUserId:', error);
            throw error;
        }
    },

    delete: async (id, userId) => {
        try {
            const [result] = await pool.execute(
                'UPDATE health_data SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
                [id, userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in delete health data:', error);
            throw error;
        }
    }
}; 