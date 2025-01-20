import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Choikini.1234',
    database: 'medtracker',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const dbConnection = async () => {
    try {
        await pool.getConnection();
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

export default pool; 