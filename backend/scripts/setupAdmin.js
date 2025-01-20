import pool from '../config/database.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const setupAdmin = async () => {
    try {
        const email = 'admin@gmail.com';
        const password = 'Admin.123123';

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // First check if user exists
        const [existingUsers] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            // Update existing user to be admin
            await pool.execute(
                'UPDATE users SET is_admin = TRUE WHERE email = ?',
                [email]
            );
            console.log('Existing user updated to admin');
        } else {
            // Create new admin user
            await pool.execute(
                `INSERT INTO users (
                    first_name, last_name, email, password_hash, is_admin
                ) VALUES (?, ?, ?, ?, TRUE)`,
                ['Admin', 'User', email, hashedPassword]
            );
            console.log('New admin user created');
        }

        console.log('Admin setup completed successfully');
    } catch (error) {
        console.error('Error setting up admin:', error);
    } finally {
        await pool.end();
        process.exit();
    }
};

setupAdmin(); 