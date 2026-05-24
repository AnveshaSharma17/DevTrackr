/**
 * Commit Activity Analyzer
 * Processes raw GitHub commits into structured metrics
 */

const { subDays, format, differenceInDays, parseISO, isAfter } = require('../utils/dateUtils');

/**
 * Analyze commits and produce structured statistics
 */
const analyzeCommits = (commits) => {
  if (!commits || commits.length === 0) {
    return {
      total: 0,
      last7Days: 0,
      last30Days: 0,
      dailyActivity: [],
      weeklyActivity: [],
      streak: 0,
      avgPerDay: 0,
      peakDay: { date: null, count: 0 },
    };
  }

  const now = new Date();
  const day7Ago = subDays(now, 7);
  const day30Ago = subDays(now, 30);
  const day90Ago = subDays(now, 90);

  // Build daily count map
  const dailyMap = {};
  let last7 = 0;
  let last30 = 0;

  commits.forEach((commit) => {
    const dateStr = commit.commit?.author?.date || commit.committer?.date;
    if (!dateStr) return;

    const commitDate = new Date(dateStr);
    const dayKey = format(commitDate, 'YYYY-MM-DD');

    dailyMap[dayKey] = (dailyMap[dayKey] || 0) + 1;

    if (isAfter(commitDate, day7Ago)) last7++;
    if (isAfter(commitDate, day30Ago)) last30++;
  });

  // Build sorted daily activity (last 90 days)
  const dailyActivity = [];
  for (let i = 89; i >= 0; i--) {
    const d = subDays(now, i);
    const key = format(d, 'YYYY-MM-DD');
    dailyActivity.push({ date: key, count: dailyMap[key] || 0 });
  }

  // Build weekly activity (last 12 weeks)
  const weeklyActivity = buildWeeklyActivity(dailyMap, now);

  // Calculate streak
  const streak = calculateStreak(dailyMap, now);

  // Average per day (over last 30 days)
  const avgPerDay = parseFloat((last30 / 30).toFixed(2));

  // Peak day
  let peakDay = { date: null, count: 0 };
  Object.entries(dailyMap).forEach(([date, count]) => {
    if (count > peakDay.count) peakDay = { date, count };
  });

  return {
    total: commits.length,
    last7Days: last7,
    last30Days: last30,
    dailyActivity,
    weeklyActivity,
    streak,
    avgPerDay,
    peakDay,
  };
};

/**
 * Build weekly commit totals for last 12 weeks
 */
const buildWeeklyActivity = (dailyMap, now) => {
  const weeks = [];
  for (let w = 11; w >= 0; w--) {
    const weekStart = subDays(now, w * 7 + 6);
    const weekEnd = subDays(now, w * 7);
    let count = 0;

    for (let d = 0; d <= 6; d++) {
      const day = subDays(weekEnd, d);
      const key = format(day, 'YYYY-MM-DD');
      count += dailyMap[key] || 0;
    }

    weeks.push({
      week: format(weekStart, 'MMM DD'),
      count,
    });
  }
  return weeks;
};

/**
 * Calculate current commit streak (consecutive days with commits)
 */
const calculateStreak = (dailyMap, now) => {
  let streak = 0;
  let d = new Date(now);
  d.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const key = format(d, 'YYYY-MM-DD');
    if (dailyMap[key] && dailyMap[key] > 0) {
      streak++;
      d = subDays(d, 1);
    } else {
      break;
    }
  }

  return streak;
};

module.exports = { analyzeCommits };
