import { UserModel } from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const UserController = {
    register: async (req, res) => {
        try {
            console.log('Registration request received:', req.body);

            // Validate required fields
            const requiredFields = ['first_name', 'last_name', 'email', 'password'];
            for (const field of requiredFields) {
                if (!req.body[field]) {
                    console.log('Missing required field:', field);
                    return res.status(400).json({ message: `${field} is required` });
                }
            }

            // Check if email already exists
            const existingUser = await UserModel.findByEmail(req.body.email);
            if (existingUser) {
                console.log('Email already exists:', req.body.email);
                return res.status(400).json({ message: 'Email already registered' });
            }

            // Create user
            const user = await UserModel.create({
                first_name: req.body.first_name,
                middle_name: req.body.middle_name,
                last_name: req.body.last_name,
                email: req.body.email,
                password: req.body.password,
                address: req.body.address,
                age: req.body.age,
                gender: req.body.gender,
                date_of_birth: req.body.date_of_birth
            });
            
            console.log('User created successfully:', user);
            
            res.status(201).json({ 
                message: 'User registered successfully', 
                userId: user.insertId 
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ 
                message: 'Error registering user', 
                error: error.message,
                stack: error.stack
            });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await UserModel.findByEmail(email);
            
            if (!user || !(await bcrypt.compare(password, user.password_hash))) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Add check for active status
            if (!user.is_active) {
                return res.status(401).json({ 
                    message: 'This account has been deactivated. Please contact administrator.' 
                });
            }

            const token = jwt.sign(
                { 
                    userId: user.id, 
                    email: user.email,
                    isAdmin: user.is_admin
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    is_admin: user.is_admin
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Error logging in', error: error.message });
        }
    },

    getProfile: async (req, res) => {
        try {
            const user = await UserModel.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Remove sensitive information
            delete user.password_hash;
            res.json(user);
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ message: 'Error fetching profile', error: error.message });
        }
    },

    updateProfile: async (req, res) => {
        try {
            console.log('Update profile request:', req.body); // Debug log

            const updatedUser = await UserModel.update(req.user.userId, req.body);
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Remove sensitive information
            delete updatedUser.password_hash;
            console.log('Sending updated user:', updatedUser); // Debug log

            res.json({ 
                message: 'Profile updated successfully', 
                user: updatedUser 
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ 
                message: 'Error updating profile', 
                error: error.message 
            });
        }
    },

    getUserDetails: async (req, res) => {
        try {
            const user = await UserModel.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Remove sensitive information
            delete user.password_hash;
            res.json(user);
        } catch (error) {
            console.error('Error fetching user details:', error);
            res.status(500).json({ message: 'Error fetching user details', error: error.message });
        }
    },

    updatePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            
            // Input validation
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ 
                    message: 'Current password and new password are required' 
                });
            }

            // Get user with password hash
            const user = await UserModel.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Verify current password
            const isValid = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isValid) {
                return res.status(401).json({ 
                    message: 'Current password is incorrect' 
                });
            }

            // Password validation
            const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                return res.status(400).json({ 
                    message: 'New password does not meet requirements' 
                });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            const updated = await UserModel.updatePassword(req.user.userId, hashedPassword);
            if (!updated) {
                return res.status(500).json({ 
                    message: 'Failed to update password' 
                });
            }

            res.json({ message: 'Password updated successfully' });
        } catch (error) {
            console.error('Update password error:', error);
            res.status(500).json({ 
                message: 'Error updating password', 
                error: error.message 
            });
        }
    },

    deleteAccount: async (req, res) => {
        try {
            const deleted = await UserModel.delete(req.user.userId);
            if (!deleted) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({ message: 'Account deactivated successfully' });
        } catch (error) {
            console.error('Error deactivating account:', error);
            res.status(500).json({ 
                message: 'Error deactivating account', 
                error: error.message 
            });
        }
    }
}; 