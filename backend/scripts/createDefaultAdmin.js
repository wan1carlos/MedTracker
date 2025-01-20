import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const createDefaultAdmin = async () => {
    try {
        // First, delete any existing admin with this email
        await pool.execute(
            'DELETE FROM admins WHERE email = ?',
            ['admin@gmail.com']
        );
        console.log('Cleaned up existing admin');

        const email = 'admin@gmail.com';
        const password = 'Admin.123123';
        const name = 'Admin';

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        console.log('Password hashed successfully');

        // Insert admin
        const [result] = await pool.execute(
            'INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, passwordHash]
        );

        console.log('Default admin created successfully with ID:', result.insertId);
    } catch (error) {
        console.error('Error creating default admin:', error);
    } finally {
        await pool.end();
        process.exit();
    }
};

createDefaultAdmin(); 