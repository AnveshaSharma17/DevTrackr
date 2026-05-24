const express = require('express');
const router = express.Router();
const {
  getConnectUrl,
  handleCallback,
  getUserRepos,
  getConnectedRepos,
  connectRepo,
  addPublicRepo,
  disconnectGitHub,
} = require('../controllers/githubController');
const { protect } = require('../middleware/auth');

router.get('/connect', protect, getConnectUrl);
router.get('/callback', handleCallback);
router.get('/repos', protect, getUserRepos);
router.get('/connected-repos', protect, getConnectedRepos);
router.post('/connect-repo', protect, connectRepo);
router.post('/add-public', protect, addPublicRepo);
router.delete('/disconnect', protect, disconnectGitHub);

module.exports = router;
