/**
 * Background Analytics Job
 * Runs every 6 hours to sync all connected repositories
 */
const cron = require('node-cron');
const Repository = require('../models/Repository');
const { generateAnalytics } = require('../services/analyticsService');

let isRunning = false;

const runSync = async () => {
  if (isRunning) {
    console.log('⏭️  Analytics job already running, skipping...');
    return;
  }

  isRunning = true;
  console.log('🔄 Starting scheduled analytics sync...');

  try {
    // Find all repos that need sync (older than 6 hours or pending)
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

    const repos = await Repository.find({
      $or: [
        { lastSynced: null },
        { lastSynced: { $lt: sixHoursAgo } },
        { syncStatus: 'pending' },
      ],
    }).limit(20); // Process max 20 at a time

    console.log(`📦 Found ${repos.length} repositories to sync`);

    let synced = 0;
    let failed = 0;

    for (const repo of repos) {
      try {
        await generateAnalytics(repo._id, repo.userId);
        synced++;
        // Small delay between repos to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err) {
        failed++;
        console.error(`❌ Failed to sync ${repo.fullName}:`, err.message);
      }
    }

    console.log(`✅ Analytics sync complete — ${synced} synced, ${failed} failed`);
  } catch (err) {
    console.error('Analytics job error:', err.message);
  } finally {
    isRunning = false;
  }
};

/**
 * Start the cron job — runs every 6 hours
 */
const startAnalyticsJob = () => {
  console.log('⏰ Analytics background job scheduled (every 6 hours)');

  // Run every 6 hours: 0 */6 * * *
  cron.schedule('0 */6 * * *', runSync);

  // Also run on startup after 30 seconds (allow DB to settle)
  setTimeout(runSync, 30 * 1000);
};

module.exports = { startAnalyticsJob, runSync };
