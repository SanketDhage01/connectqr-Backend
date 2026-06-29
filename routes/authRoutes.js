import express from 'express';
import { register, login, getMe, logout } from '../controllers/authController.js';
import { registerRules, loginRules, validate } from '../validators/authValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);
router.get('/me', protect, getMe);
router.post('/logout', logout);

export default router;
