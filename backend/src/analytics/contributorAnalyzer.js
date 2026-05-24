/**
 * Contributor Analyzer
 * Identifies active/inactive contributors and dominance risk
 */
const { subDays, isAfter } = require('../utils/dateUtils');

const INACTIVE_THRESHOLD_DAYS = 14; // Inactive if no commits in 14+ days
const DOMINANCE_THRESHOLD = 0.60;   // Risk if >60% commits from one person

const analyzeContributors = (commits, githubContributors) => {
  if (!commits || commits.length === 0) {
    return {
      total: 0, active: 0, inactive: 0,
      contributors: [],
      dominanceRisk: false,
      dominantContributor: null,
    };
  }

  const now = new Date();
  const inactiveThreshold = subDays(now, INACTIVE_THRESHOLD_DAYS);
  const day7Ago = subDays(now, 7);
  const day30Ago = subDays(now, 30);

  // Build per-contributor commit maps
  const contribMap = {};

  commits.forEach((commit) => {
    const author = commit.author?.login ||
      commit.commit?.author?.name ||
      'Unknown';
    const avatarUrl = commit.author?.avatar_url || null;
    const dateStr = commit.commit?.author?.date;
    if (!dateStr) return;

    const date = new Date(dateStr);

    if (!contribMap[author]) {
      contribMap[author] = {
        username: author,
        avatarUrl,
        totalCommits: 0,
        last7Days: 0,
        last30Days: 0,
        lastCommitDate: null,
      };
    }

    contribMap[author].totalCommits++;

    if (isAfter(date, day7Ago)) contribMap[author].last7Days++;
    if (isAfter(date, day30Ago)) contribMap[author].last30Days++;

    if (
      !contribMap[author].lastCommitDate ||
      date > contribMap[author].lastCommitDate
    ) {
      contribMap[author].lastCommitDate = date;
    }
  });

  const totalCommits = commits.length;
  let active = 0, inactive = 0;
  let dominantContributor = null;
  let maxCommits = 0;

  const contributors = Object.values(contribMap).map((c) => {
    const isActive = c.lastCommitDate && isAfter(c.lastCommitDate, inactiveThreshold);
    const dominancePercent = parseFloat(((c.totalCommits / totalCommits) * 100).toFixed(1));

    if (isActive) active++;
    else inactive++;

    if (c.totalCommits > maxCommits) {
      maxCommits = c.totalCommits;
      dominantContributor = c.username;
    }

    // Enrich with GitHub API contributor data
    const ghData = (githubContributors || []).find(
      (g) => g.login === c.username
    );

    return {
      ...c,
      isActive,
      dominancePercent,
      linesAdded: ghData?.additions || 0,
      linesDeleted: ghData?.deletions || 0,
    };
  }).sort((a, b) => b.totalCommits - a.totalCommits);

  const dominanceRisk = totalCommits > 0 &&
    (maxCommits / totalCommits) >= DOMINANCE_THRESHOLD &&
    contributors.length > 1;

  return {
    total: contributors.length,
    active,
    inactive,
    contributors,
    dominanceRisk,
    dominantContributor: dominanceRisk ? dominantContributor : null,
  };
};

module.exports = { analyzeContributors };
