import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from "./routes/userRoutes.js";
import healthDataRoutes from "./routes/healthDataRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import { dbConnection } from "./config/database.js";

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(express.json());

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, '../client/build')));

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

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

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