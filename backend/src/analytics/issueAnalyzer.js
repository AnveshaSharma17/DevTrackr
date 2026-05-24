/**
 * Issue Analyzer
 */
const { differenceInHours } = require('../utils/dateUtils');

const analyzeIssues = (issues) => {
  if (!issues || issues.length === 0) {
    return {
      total: 0, open: 0, closed: 0,
      completionRate: 0, avgResolutionTime: 0, byLabel: [],
    };
  }

  let open = 0, closed = 0;
  let totalResolutionHours = 0;
  let resolvedCount = 0;
  const labelMap = {};

  issues.forEach((issue) => {
    if (issue.state === 'open') {
      open++;
    } else {
      closed++;
      if (issue.closed_at) {
        const hours = differenceInHours(
          new Date(issue.closed_at),
          new Date(issue.created_at)
        );
        totalResolutionHours += hours;
        resolvedCount++;
      }
    }

    // Count by label
    (issue.labels || []).forEach((label) => {
      labelMap[label.name] = (labelMap[label.name] || 0) + 1;
    });
  });

  const byLabel = Object.entries(labelMap)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const total = issues.length;
  const completionRate = total > 0
    ? parseFloat(((closed / total) * 100).toFixed(1))
    : 0;

  const avgResolutionTime = resolvedCount > 0
    ? Math.round(totalResolutionHours / resolvedCount)
    : 0;

  return {
    total,
    open,
    closed,
    completionRate,
    avgResolutionTime, // hours
    byLabel,
  };
};

module.exports = { analyzeIssues };
