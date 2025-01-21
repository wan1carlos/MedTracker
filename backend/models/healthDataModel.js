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
                cholesterol,
                hemoglobin,
                rbc,
                wbc,
                platelet_count
            } = data;

            // Calculate BMI
            const heightInMeters = height / 100;
            const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);

            // Convert and validate blood test values
            const validatedData = {
                user_id,
                height: Number(height),
                weight: Number(weight),
                blood_pressure_systolic: Number(blood_pressure_systolic),
                blood_pressure_diastolic: Number(blood_pressure_diastolic),
                blood_sugar: Number(blood_sugar),
                heart_rate: Number(heart_rate),
                cholesterol: Number(cholesterol),
                bmi: Number(bmi),
                hemoglobin: hemoglobin ? Number(Number(hemoglobin).toFixed(1)) : null,
                rbc: rbc ? Number(Number(rbc).toFixed(1)) : null,
                wbc: wbc ? Number(wbc) : null,
                platelet_count: platelet_count ? Number(platelet_count) : null
            };

            const [result] = await pool.execute(
                `INSERT INTO health_data (
                    user_id, height, weight, blood_pressure_systolic,
                    blood_pressure_diastolic, blood_sugar, heart_rate,
                    cholesterol, bmi, hemoglobin, rbc, wbc, platelet_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    validatedData.user_id,
                    validatedData.height,
                    validatedData.weight,
                    validatedData.blood_pressure_systolic,
                    validatedData.blood_pressure_diastolic,
                    validatedData.blood_sugar,
                    validatedData.heart_rate,
                    validatedData.cholesterol,
                    validatedData.bmi,
                    validatedData.hemoglobin,
                    validatedData.rbc,
                    validatedData.wbc,
                    validatedData.platelet_count
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
                'SELECT * FROM health_data WHERE user_id = ? AND deleted_at IS NULL ORDER BY created_at DESC',
                [userId]
            );
            return rows;
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