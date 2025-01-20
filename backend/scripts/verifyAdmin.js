import pool from '../config/database.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const verifyAdmin = async () => {
    try {
        // Check admin in database
        const [admins] = await pool.execute(
            'SELECT * FROM admins WHERE email = ?',
            ['admin@gmail.com']
        );

        if (admins.length === 0) {
            console.log('Admin not found in database');
            return;
        }

        const admin = admins[0];
        console.log('Admin found:', {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            password_hash_length: admin.password_hash?.length
        });

        // Test password verification
        const testPassword = 'Admin.123123';
        const passwordMatch = await bcrypt.compare(testPassword, admin.password_hash);
        console.log('Password match test:', passwordMatch);

        // If password doesn't match, update it
        if (!passwordMatch) {
            const newPasswordHash = await bcrypt.hash(testPassword, 10);
            await pool.execute(
                'UPDATE admins SET password_hash = ? WHERE id = ?',
                [newPasswordHash, admin.id]
            );
            console.log('Password has been updated');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
        process.exit();
    }
};

verifyAdmin(); 