import { AdminModel } from '../models/adminModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../config/database.js';

export const AdminAuthController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log('Admin login attempt for:', email);

            // Direct database query for debugging
            const [admins] = await pool.execute(
                'SELECT * FROM admins WHERE email = ? AND deleted_at IS NULL',
                [email]
            );

            if (admins.length === 0) {
                console.log('No admin found with email:', email);
                return res.status(401).json({ message: 'Invalid admin credentials' });
            }

            const admin = admins[0];
            console.log('Admin found:', { id: admin.id, email: admin.email });

            // Verify password
            const isValidPassword = await bcrypt.compare(password, admin.password_hash);
            console.log('Password validation result:', isValidPassword);

            if (!isValidPassword) {
                console.log('Invalid password for admin:', email);
                return res.status(401).json({ message: 'Invalid admin credentials' });
            }

            // Create token
            const token = jwt.sign(
                { 
                    userId: admin.id, 
                    email: admin.email, 
                    isAdmin: true,
                    type: 'admin'
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Send response
            console.log('Admin login successful for:', email);
            res.json({ 
                token, 
                user: { 
                    id: admin.id, 
                    email: admin.email, 
                    name: admin.name,
                    isAdmin: true,
                    type: 'admin'
                } 
            });
        } catch (error) {
            console.error('Admin login error:', error);
            res.status(500).json({ 
                message: 'Error during admin login', 
                error: error.message 
            });
        }
    }
}; 