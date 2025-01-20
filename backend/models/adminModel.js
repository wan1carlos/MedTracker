import pool from '../config/database.js';
import bcrypt from 'bcrypt';

export const AdminModel = {
    findByEmail: async (email) => {
        try {
            console.log('Searching for admin with email:', email);
            const [rows] = await pool.execute(
                'SELECT * FROM admins WHERE email = ? AND deleted_at IS NULL',
                [email]
            );
            console.log('Found admin rows:', rows.length);
            return rows[0];
        } catch (error) {
            console.error('Error in findByEmail:', error);
            throw error;
        }
    },

    findById: async (id) => {
        try {
            console.log('Searching for admin with id:', id);
            const [rows] = await pool.execute(
                'SELECT * FROM admins WHERE id = ? AND deleted_at IS NULL',
                [id]
            );
            console.log('Found admin rows:', rows.length);
            return rows[0];
        } catch (error) {
            console.error('Error in findById:', error);
            throw error;
        }
    }
}; 