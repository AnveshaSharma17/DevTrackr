const express = require('express');
const router = express.Router();
const { generateSummary, getInsights } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/summary/:repoId', protect, aiLimiter, generateSummary);
router.get('/insights/:repoId', protect, getInsights);

module.exports = router;
