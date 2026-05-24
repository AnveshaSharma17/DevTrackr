/**
 * Pull Request Analyzer
 */
const { differenceInHours, subDays, isAfter } = require('../utils/dateUtils');

const analyzePRs = (prs) => {
  if (!prs || prs.length === 0) {
    return {
      total: 0, open: 0, closed: 0, merged: 0,
      avgMergeTime: 0, mergeRate: 0, pendingReview: 0, stalePRs: 0,
    };
  }

  const now = new Date();
  const staleThreshold = subDays(now, 7);

  let open = 0, closed = 0, merged = 0;
  let totalMergeHours = 0;
  let mergedCount = 0;
  let pendingReview = 0;
  let stalePRs = 0;

  prs.forEach((pr) => {
    if (pr.state === 'open') {
      open++;
      // Check if stale (open > 7 days)
      if (!isAfter(new Date(pr.created_at), staleThreshold)) {
        stalePRs++;
      }
      // Has no reviews and is open
      if (!pr.requested_reviewers?.length) {
        pendingReview++;
      }
    } else if (pr.merged_at) {
      merged++;
      const hours = differenceInHours(new Date(pr.merged_at), new Date(pr.created_at));
      totalMergeHours += hours;
      mergedCount++;
    } else {
      closed++;
    }
  });

  const avgMergeTime = mergedCount > 0
    ? Math.round(totalMergeHours / mergedCount)
    : 0;

  const total = prs.length;
  const mergeRate = total > 0 ? parseFloat(((merged / total) * 100).toFixed(1)) : 0;

  return {
    total,
    open,
    closed,
    merged,
    avgMergeTime, // hours
    mergeRate,    // percentage
    pendingReview,
    stalePRs,
  };
};

module.exports = { analyzePRs };
