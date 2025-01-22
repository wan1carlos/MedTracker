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

            // Check for existing record today
            const today = new Date().toISOString().split('T')[0];
            const [existingRecords] = await pool.execute(
                `SELECT id FROM health_data 
                 WHERE user_id = ? 
                 AND DATE(created_at) = DATE(?)
                 AND deleted_at IS NULL`,
                [user_id, today]
            );

            if (existingRecords.length > 0) {
                // Update existing record
                const [result] = await pool.execute(
                    `UPDATE health_data 
                     SET height = ?, weight = ?, blood_pressure_systolic = ?,
                         blood_pressure_diastolic = ?, blood_sugar = ?, heart_rate = ?,
                         cholesterol = ?, bmi = ?, hemoglobin = ?, rbc = ?, wbc = ?,
                         platelet_count = ?, updated_at = CURRENT_TIMESTAMP
                     WHERE id = ?`,
                    [
                        Number(height),
                        Number(weight),
                        Number(blood_pressure_systolic),
                        Number(blood_pressure_diastolic),
                        Number(blood_sugar),
                        Number(heart_rate),
                        Number(cholesterol),
                        Number(bmi),
                        hemoglobin ? Number(hemoglobin) : null,
                        rbc ? Number(rbc) : null,
                        wbc ? Number(wbc) : null,
                        platelet_count ? Number(platelet_count) : null,
                        existingRecords[0].id
                    ]
                );
                return result;
            }

            // If no existing record, insert new one
            const [result] = await pool.execute(
                `INSERT INTO health_data (
                    user_id, height, weight, blood_pressure_systolic,
                    blood_pressure_diastolic, blood_sugar, heart_rate,
                    cholesterol, bmi, hemoglobin, rbc, wbc, platelet_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    user_id,
                    Number(height),
                    Number(weight),
                    Number(blood_pressure_systolic),
                    Number(blood_pressure_diastolic),
                    Number(blood_sugar),
                    Number(heart_rate),
                    Number(cholesterol),
                    Number(bmi),
                    hemoglobin ? Number(hemoglobin) : null,
                    rbc ? Number(rbc) : null,
                    wbc ? Number(wbc) : null,
                    platelet_count ? Number(platelet_count) : null
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