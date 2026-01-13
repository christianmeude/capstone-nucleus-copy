const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);

// NEW: Admin Management Routes
// Note: We use the existing auth.middleware from your previous uploads
router.get('/users', authenticate, authorize('admin'), authController.getAllUsers);
router.delete('/users/:id', authenticate, authorize('admin'), authController.deleteUser);

module.exports = router;