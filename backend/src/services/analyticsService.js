/**
 * Analytics Service
 * Orchestrates GitHub data fetch + analytics processing + caching
 */
const Repository = require('../models/Repository');
const Analytics = require('../models/Analytics');
const githubService = require('./githubService');
const { analyzeCommits } = require('../analytics/commitAnalyzer');
const { analyzePRs } = require('../analytics/prAnalyzer');
const { analyzeIssues } = require('../analytics/issueAnalyzer');
const { analyzeContributors } = require('../analytics/contributorAnalyzer');
const { scoreHealth } = require('../analytics/healthScorer');
const { generateAIInsights } = require('./aiService');

const CACHE_STALE_HOURS = 6; // Regenerate after 6 hours

/**
 * Get analytics for a repository — serves cache or triggers generation
 */
const getAnalytics = async (repoId, userId) => {
  const repo = await Repository.findOne({ _id: repoId, userId });
  if (!repo) {
    const err = new Error('Repository not found');
    err.statusCode = 404;
    throw err;
  }

  // Check for fresh cached analytics
  const existing = await Analytics.findOne({ repoId, userId }).sort({ generatedAt: -1 });

  if (existing) {
    const hoursOld = (Date.now() - existing.generatedAt) / (1000 * 60 * 60);
    if (hoursOld < CACHE_STALE_HOURS) {
      return existing;
    }
  }

  // Generate fresh analytics
  return generateAnalytics(repoId, userId, repo);
};

/**
 * Force-generate analytics (ignoring cache)
 */
const generateAnalytics = async (repoId, userId, repo = null) => {
  if (!repo) {
    repo = await Repository.findOne({ _id: repoId, userId });
    if (!repo) {
      const err = new Error('Repository not found');
      err.statusCode = 404;
      throw err;
    }
  }

  console.log(`📊 Generating analytics for ${repo.fullName}...`);

  // Update sync status
  await Repository.findByIdAndUpdate(repoId, { syncStatus: 'syncing' });

  try {
    const [owner, repoName] = repo.fullName.split('/');

    // Fetch all raw GitHub data in parallel
    const [commits, prs, issues, contributors] = await Promise.all([
      githubService.getCommits(userId, owner, repoName),
      githubService.getPullRequests(userId, owner, repoName),
      githubService.getIssues(userId, owner, repoName),
      githubService.getContributors(userId, owner, repoName),
    ]);

    // Process analytics
    const commitStats = analyzeCommits(commits);
    const prStats = analyzePRs(prs);
    const issueStats = analyzeIssues(issues);
    const contributorStats = analyzeContributors(commits, contributors);
    const health = scoreHealth(commitStats, prStats, issueStats, contributorStats);

    const metrics = {
      commitStats,
      prStats,
      issueStats,
      contributorStats,
      sprintHealth: health.sprintHealth,
    };

    // Generate AI insights
    const aiSummary = await generateAIInsights(repo.fullName, metrics);

    // Save to database (upsert)
    const analytics = await Analytics.findOneAndUpdate(
      { repoId, userId },
      {
        repoId,
        userId,
        commitStats,
        prStats,
        issueStats,
        contributorStats,
        sprintHealth: health.sprintHealth,
        healthScore: {
          overall: health.overall,
          breakdown: health.breakdown,
        },
        aiSummary,
        dataWindow: {
          from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          to: new Date(),
        },
        generatedAt: new Date(),
        cacheKey: `${repo.fullName}-${commitStats.total}-${prStats.total}`,
      },
      { upsert: true, new: true }
    );

    // Update repository with cached stats
    await Repository.findByIdAndUpdate(repoId, {
      syncStatus: 'synced',
      lastSynced: new Date(),
      analyticsId: analytics._id,
      cachedStats: {
        totalCommits: commitStats.total,
        openPRs: prStats.open,
        closedIssues: issueStats.closed,
        contributors: contributorStats.total,
        healthScore: health.overall,
      },
    });

    console.log(`✅ Analytics generated for ${repo.fullName} — Health: ${health.overall}/100`);
    return analytics;
  } catch (error) {
    await Repository.findByIdAndUpdate(repoId, {
      syncStatus: 'error',
      syncError: error.message,
    });
    throw error;
  }
};

module.exports = { getAnalytics, generateAnalytics };
