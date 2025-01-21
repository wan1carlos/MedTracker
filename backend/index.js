import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import healthDataRoutes from "./routes/healthDataRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import { dbConnection } from "./config/database.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

// Routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/health', healthDataRoutes);
app.use('/api/feedback', feedbackRoutes);

// Database connection
dbConnection();

const PORT = process.env.PORT || 3100;

// Try to start server with error handling
const startServer = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`API is running on port ${PORT}`);
        });
    } catch (error) {
        if (error.code === 'EADDRINUSE') {
            console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
            app.listen(PORT + 1, () => {
                console.log(`API is running on port ${PORT + 1}`);
            });
        } else {
            console.error('Failed to start server:', error);
        }
    }
};

startServer();