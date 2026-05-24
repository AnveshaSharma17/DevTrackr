const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { generateAIInsights } = require('../services/aiService');
const Analytics = require('../models/Analytics');
const Repository = require('../models/Repository');

/**
 * POST /api/ai/summary/:repoId
 * Regenerate AI summary for a repository (force)
 */
const generateSummary = asyncHandler(async (req, res) => {
  const { repoId } = req.params;

  const [analytics, repo] = await Promise.all([
    Analytics.findOne({ repoId, userId: req.user._id }),
    Repository.findOne({ _id: repoId, userId: req.user._id }),
  ]);

  if (!analytics || !repo) {
    return res.status(404).json({ success: false, message: 'Analytics not found. Generate analytics first.' });
  }

  const metrics = {
    commitStats: analytics.commitStats,
    prStats: analytics.prStats,
    issueStats: analytics.issueStats,
    contributorStats: analytics.contributorStats,
    sprintHealth: analytics.sprintHealth,
  };

  const aiSummary = await generateAIInsights(repo.fullName, metrics);

  // Update AI summary in analytics record
  await Analytics.findByIdAndUpdate(analytics._id, { aiSummary });

  return sendSuccess(res, { aiSummary }, 'AI summary generated');
});

/**
 * GET /api/ai/insights/:repoId
 * Get cached AI insights
 */
const getInsights = asyncHandler(async (req, res) => {
  const { repoId } = req.params;

  const analytics = await Analytics.findOne({ repoId, userId: req.user._id });

  if (!analytics) {
    return res.status(404).json({ success: false, message: 'No insights found. Generate analytics first.' });
  }

  return sendSuccess(res, { aiSummary: analytics.aiSummary }, 'AI insights retrieved');
});

module.exports = { generateSummary, getInsights };
