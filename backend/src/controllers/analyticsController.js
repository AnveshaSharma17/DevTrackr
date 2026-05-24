const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const analyticsService = require('../services/analyticsService');

/**
 * GET /api/analytics/:repoId
 * Get analytics (cached or fresh)
 */
const getAnalytics = asyncHandler(async (req, res) => {
  const { repoId } = req.params;
  const analytics = await analyticsService.getAnalytics(repoId, req.user._id);
  return sendSuccess(res, analytics, 'Analytics retrieved');
});

/**
 * POST /api/analytics/generate/:repoId
 * Force-regenerate analytics (bypasses cache)
 */
const generateAnalytics = asyncHandler(async (req, res) => {
  const { repoId } = req.params;
  const analytics = await analyticsService.generateAnalytics(repoId, req.user._id);
  return sendSuccess(res, analytics, 'Analytics generated successfully');
});

module.exports = { getAnalytics, generateAnalytics };
