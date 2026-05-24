/**
 * Repository Health Scorer
 * Produces 0-100 composite health score with breakdown
 */

const scoreHealth = (commitStats, prStats, issueStats, contributorStats) => {
  const scores = {};
  const bottlenecks = [];
  const risks = [];

  // ── Commit Activity Score (0-25) ──────────────────────────────────────────
  let commitScore = 0;
  if (commitStats.last7Days >= 10) commitScore = 25;
  else if (commitStats.last7Days >= 5) commitScore = 20;
  else if (commitStats.last7Days >= 2) commitScore = 15;
  else if (commitStats.last7Days >= 1) commitScore = 10;
  else commitScore = 0;

  if (commitStats.streak >= 7) commitScore = Math.min(25, commitScore + 3);
  scores.commitActivity = commitScore;

  if (commitStats.last7Days === 0) {
    bottlenecks.push('No commits in the past week');
  } else if (commitStats.last7Days < 2) {
    risks.push('Low commit activity this week');
  }

  // ── PR Flow Score (0-25) ──────────────────────────────────────────────────
  let prScore = 0;
  if (prStats.total === 0) {
    prScore = 12; // Neutral if no PRs (might be direct-push workflow)
  } else {
    if (prStats.mergeRate >= 70) prScore += 15;
    else if (prStats.mergeRate >= 50) prScore += 10;
    else prScore += 5;

    if (prStats.stalePRs === 0) prScore += 5;
    else if (prStats.stalePRs <= 2) prScore += 3;

    if (prStats.avgMergeTime <= 24) prScore += 5;
    else if (prStats.avgMergeTime <= 72) prScore += 3;
  }
  prScore = Math.min(25, prScore);
  scores.prFlow = prScore;

  if (prStats.stalePRs > 5) {
    bottlenecks.push(`${prStats.stalePRs} stale pull requests (>7 days old)`);
  }
  if (prStats.pendingReview > 3) {
    risks.push(`${prStats.pendingReview} PRs awaiting review`);
  }

  // ── Issue Management Score (0-25) ─────────────────────────────────────────
  let issueScore = 0;
  if (issueStats.total === 0) {
    issueScore = 12;
  } else {
    if (issueStats.completionRate >= 70) issueScore += 15;
    else if (issueStats.completionRate >= 50) issueScore += 10;
    else issueScore += 5;

    if (issueStats.avgResolutionTime <= 48) issueScore += 10;
    else if (issueStats.avgResolutionTime <= 120) issueScore += 6;
    else issueScore += 2;
  }
  issueScore = Math.min(25, issueScore);
  scores.issueManagement = issueScore;

  if (issueStats.open > 20) {
    risks.push(`High open issue count (${issueStats.open} open)`);
  }

  // ── Team Collaboration Score (0-25) ───────────────────────────────────────
  let teamScore = 0;
  if (contributorStats.total === 0) {
    teamScore = 10;
  } else {
    if (contributorStats.active >= 3) teamScore += 15;
    else if (contributorStats.active >= 2) teamScore += 10;
    else teamScore += 5;

    if (!contributorStats.dominanceRisk) teamScore += 10;
    else teamScore += 2;
  }
  teamScore = Math.min(25, teamScore);
  scores.teamCollaboration = teamScore;

  if (contributorStats.dominanceRisk) {
    risks.push(
      `Single contributor dominance risk: ${contributorStats.dominantContributor} handles majority of commits`
    );
  }
  if (contributorStats.inactive > 0) {
    risks.push(`${contributorStats.inactive} inactive contributor(s) (no commits in 14+ days)`);
  }

  const overall = Object.values(scores).reduce((a, b) => a + b, 0);

  let status = 'healthy';
  if (overall < 40) status = 'critical';
  else if (overall < 65) status = 'at-risk';

  // Velocity (commits per week based on last 30 days data)
  const velocity = Math.round(commitStats.last30Days / 4);
  const prevVelocity = Math.round((commitStats.total - commitStats.last30Days) / 8) || 0;
  let velocityTrend = 'stable';
  if (velocity > prevVelocity * 1.1) velocityTrend = 'increasing';
  else if (velocity < prevVelocity * 0.9) velocityTrend = 'decreasing';

  return {
    overall,
    breakdown: {
      commitActivity: scores.commitActivity,
      prFlow: scores.prFlow,
      issueManagement: scores.issueManagement,
      teamCollaboration: scores.teamCollaboration,
      codeQuality: 0, // Placeholder for future static analysis
    },
    sprintHealth: {
      score: overall,
      status,
      velocity,
      velocityTrend,
      bottlenecks,
      risks,
    },
  };
};

module.exports = { scoreHealth };
