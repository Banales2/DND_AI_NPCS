const express = require('express');
const router = express.Router();
const { createNPC, getNpcs } = require('../controllers/npcsController');
const { requireAuth } = require('../middleware/auth');

// Ruta protegida: solo usuarios autenticados pueden crear NPCs
router.post('/', requireAuth, createNPC);
router.get('/', getNpcs);

module.exports = router;
