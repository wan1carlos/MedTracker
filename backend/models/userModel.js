import pool from '../config/database.js';
import bcrypt from 'bcrypt';

export const UserModel = {
    create: async (userData) => {
        try {
            console.log('Creating user with data:', userData);
            const { 
                first_name, 
                middle_name, 
                last_name, 
                email, 
                password, 
                address, 
                gender, 
                date_of_birth 
            } = userData;
            
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const [result] = await pool.execute(
                `INSERT INTO users (
                    first_name, middle_name, last_name, email, 
                    password_hash, address, gender, date_of_birth
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    first_name, 
                    middle_name, 
                    last_name, 
                    email, 
                    hashedPassword, 
                    address, 
                    gender, 
                    date_of_birth
                ]
            );
            console.log('Database insert result:', result);
            return result;
        } catch (error) {
            console.error('Error in create user:', error);
            throw error;
        }
    },

    findByEmail: async (email) => {
        try {
            console.log('Searching for email:', email);
            const [rows] = await pool.execute(
                'SELECT *, is_admin FROM users WHERE email = ? AND deleted_at IS NULL AND is_active = TRUE',
                [email]
            );
            console.log('Found rows:', rows);
            return rows[0];
        } catch (error) {
            console.error('Error in findByEmail:', error);
            throw error;
        }
    },

    findById: async (id) => {
        try {
            const [rows] = await pool.execute(
                `SELECT id, first_name, middle_name, last_name, email, 
                 address, gender, date_of_birth, is_admin, password_hash 
                 FROM users WHERE id = ? AND deleted_at IS NULL`,
                [id]
            );
            return rows[0];
        } catch (error) {
            console.error('Error in findById:', error);
            throw error;
        }
    },

    update: async (id, userData) => {
        try {
            console.log('Updating user with data:', userData);

            const allowedFields = [
                'first_name', 
                'middle_name', 
                'last_name', 
                'address', 
                'date_of_birth'
            ];
            const updates = [];
            const values = [];

            Object.keys(userData).forEach(key => {
                if (allowedFields.includes(key)) {
                    updates.push(`${key} = ?`);
                    values.push(userData[key]);
                }
            });

            if (updates.length === 0) return null;

            values.push(id);
            const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
            console.log('Update query:', query, values);

            const [result] = await pool.execute(query, values);

            if (result.affectedRows > 0) {
                const [updatedUser] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
                console.log('Updated user:', updatedUser[0]);
                return updatedUser[0];
            }
            return null;
        } catch (error) {
            console.error('Error in update:', error);
            throw error;
        }
    },

    findAll: async () => {
        try {
            const [rows] = await pool.execute(
                `SELECT id, first_name, middle_name, last_name, email, 
                 address, gender, date_of_birth, is_admin, is_active 
                 FROM users WHERE deleted_at IS NULL ORDER BY first_name`
            );
            return rows;
        } catch (error) {
            console.error('Error in findAll:', error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const [result] = await pool.execute(
                'UPDATE users SET is_active = FALSE WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in delete:', error);
            throw error;
        }
    },

    updatePassword: async (userId, hashedPassword) => {
        try {
            const [result] = await pool.execute(
                'UPDATE users SET password_hash = ? WHERE id = ? AND deleted_at IS NULL',
                [hashedPassword, userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in updatePassword:', error);
            throw error;
        }
    }
}; 