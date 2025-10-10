import express from 'express';
import { register, login } from '../controllers/auth.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;