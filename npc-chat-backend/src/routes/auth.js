const express = require('express');
const { register, login } = require('../controllers/auth.js');
const { requireAuth } = require('../middleware/auth.js');

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/profile', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;