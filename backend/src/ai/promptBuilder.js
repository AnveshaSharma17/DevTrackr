/**
 * AI Prompt Builder
 * Converts structured analytics into focused prompts for Gemini
 * IMPORTANT: Never sends raw GitHub data — only preprocessed metrics
 */

/**
 * Build sprint summary prompt
 */
const buildSprintSummaryPrompt = (repoName, metrics) => {
  const { commitStats, prStats, issueStats, contributorStats, sprintHealth } = metrics;

  return `You are a senior engineering manager analyzing developer productivity data.

Repository: ${repoName}
Analysis Period: Last 30 days

## Commit Activity
- Total commits (last 30 days): ${commitStats.last30Days}
- Commits this week: ${commitStats.last7Days}
- Current streak: ${commitStats.streak} days
- Average commits/day: ${commitStats.avgPerDay}
- Velocity trend: ${sprintHealth.velocityTrend}

## Pull Requests
- Open PRs: ${prStats.open}
- Merged this period: ${prStats.merged}
- Merge rate: ${prStats.mergeRate}%
- Stale PRs (>7 days): ${prStats.stalePRs}
- Avg merge time: ${prStats.avgMergeTime} hours

## Issues
- Open issues: ${issueStats.open}
- Closed this period: ${issueStats.closed}
- Completion rate: ${issueStats.completionRate}%

## Team
- Active contributors (last 14 days): ${contributorStats.active}
- Inactive contributors: ${contributorStats.inactive}
- Dominance risk: ${contributorStats.dominanceRisk ? 'YES - ' + contributorStats.dominantContributor + ' handles majority of commits' : 'No'}

## Health Score: ${sprintHealth.score}/100 (${sprintHealth.status})
Bottlenecks: ${sprintHealth.bottlenecks.join('; ') || 'None detected'}

Respond with EXACTLY 4 bullet points. Each bullet must start with a relevant emoji, then a bold label, then a colon, then a concise 1-sentence insight. Use this exact format:
• 🚀 **Velocity**: <insight>
• 🤝 **Collaboration**: <insight>
• ⚠️ **Risk**: <insight>
• 🎯 **Health**: <insight>

Be specific and data-driven. Maximum 20 words per bullet. No paragraphs. No extra text.`;
};

/**
 * Build recommendations prompt
 */
const buildRecommendationsPrompt = (repoName, metrics) => {
  const { commitStats, prStats, issueStats, contributorStats, sprintHealth } = metrics;

  return `You are an AI engineering coach analyzing a software team's productivity metrics.

Repository: ${repoName}

Key metrics:
- Commit velocity: ${commitStats.last7Days} commits/week (trend: ${sprintHealth.velocityTrend})
- PR merge rate: ${prStats.mergeRate}%
- Stale PRs: ${prStats.stalePRs}
- Issue completion rate: ${issueStats.completionRate}%
- Active contributors: ${contributorStats.active}/${contributorStats.total}
- Dominance risk: ${contributorStats.dominanceRisk ? 'Yes' : 'No'}
- Health score: ${sprintHealth.score}/100
- Bottlenecks: ${sprintHealth.bottlenecks.join('; ') || 'None'}
- Risks: ${sprintHealth.risks.join('; ') || 'None'}

Generate exactly 4 actionable recommendations as a JSON array. Each recommendation should have:
- priority: "high", "medium", or "low"
- category: one of "velocity", "collaboration", "code-review", "issue-management", "team-health"
- title: brief title (max 60 chars)
- description: 1-2 sentence explanation
- actionItems: array of 2-3 specific action items

Respond ONLY with valid JSON array, no other text:
[
  {
    "priority": "high",
    "category": "velocity",
    "title": "...",
    "description": "...",
    "actionItems": ["...", "..."]
  }
]`;
};

/**
 * Build team health analysis prompt
 */
const buildTeamHealthPrompt = (repoName, contributorStats) => {
  const topContributors = contributorStats.contributors
    .slice(0, 5)
    .map(
      (c) =>
        `${c.username}: ${c.totalCommits} total commits, ${c.last7Days} this week, active: ${c.isActive}`
    )
    .join('\n');

  return `Analyze this engineering team's health for repository ${repoName}:

Top Contributors:
${topContributors}

Team Stats:
- Total contributors: ${contributorStats.total}
- Active (last 14 days): ${contributorStats.active}
- Inactive: ${contributorStats.inactive}
- Dominance risk: ${contributorStats.dominanceRisk ? 'Yes - ' + contributorStats.dominantContributor : 'No'}

Respond with EXACTLY 3 bullet points covering contributor balance, bus factor risk, and collaboration patterns. Each bullet must start with a relevant emoji, then a bold label, then a colon, then a concise 1-sentence insight. Use this exact format:
• 👥 **Balance**: <insight>
• 🚌 **Bus Factor**: <insight>
• 🔄 **Collaboration**: <insight>

Maximum 20 words per bullet. No paragraphs. No extra text.`;
};

module.exports = {
  buildSprintSummaryPrompt,
  buildRecommendationsPrompt,
  buildTeamHealthPrompt,
};
