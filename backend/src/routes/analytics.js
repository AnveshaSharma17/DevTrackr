const express = require('express');
const router = express.Router();
const { getAnalytics, generateAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/:repoId', protect, getAnalytics);
router.post('/generate/:repoId', protect, generateAnalytics);

module.exports = router;
