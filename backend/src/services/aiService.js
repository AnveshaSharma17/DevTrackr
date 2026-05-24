/**
 * AI Service
 * Orchestrates Gemini AI calls with caching and error handling
 */
const { generateContent } = require('../ai/geminiClient');
const {
  buildSprintSummaryPrompt,
  buildRecommendationsPrompt,
  buildTeamHealthPrompt,
} = require('../ai/promptBuilder');

/**
 * Generate full AI insights for a repository
 * Returns structured AI summary object
 */
const generateAIInsights = async (repoName, metrics) => {
  console.log(`🤖 Generating AI insights for ${repoName}...`);

  const results = {
    sprintSummary: '',
    teamHealthAnalysis: '',
    bottleneckAnalysis: '',
    recommendations: [],
    generatedAt: new Date(),
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  };

  try {
    // Sprint Summary
    const sprintPrompt = buildSprintSummaryPrompt(repoName, metrics);
    results.sprintSummary = await generateContent(sprintPrompt);
  } catch (err) {
    console.error('Sprint summary generation failed:', err.message);
    results.sprintSummary = 'AI sprint summary unavailable. Please try again later.';
  }

  try {
    // Recommendations (JSON format)
    const recoPrompt = buildRecommendationsPrompt(repoName, metrics);
    const recoText = await generateContent(recoPrompt);

    // Parse JSON safely
    const jsonMatch = recoText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      results.recommendations = JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.error('Recommendations generation failed:', err.message);
    results.recommendations = getDefaultRecommendations(metrics);
  }

  try {
    // Team Health Analysis
    const teamPrompt = buildTeamHealthPrompt(repoName, metrics.contributorStats);
    results.teamHealthAnalysis = await generateContent(teamPrompt);
  } catch (err) {
    console.error('Team health generation failed:', err.message);
    results.teamHealthAnalysis = 'AI team health analysis unavailable.';
  }

  // Bottleneck analysis (derived from health data, no extra AI call)
  results.bottleneckAnalysis = summarizeBottlenecks(metrics.sprintHealth);

  return results;
};

/**
 * Fallback recommendations if AI call fails
 */
const getDefaultRecommendations = (metrics) => {
  const recs = [];

  if (metrics.prStats?.stalePRs > 3) {
    recs.push({
      priority: 'high',
      category: 'code-review',
      title: 'Clear stale pull requests',
      description: `You have ${metrics.prStats.stalePRs} PRs open for more than 7 days. Review and merge or close them.`,
      actionItems: ['Schedule a PR review session', 'Set up auto-close for stale PRs', 'Assign reviewers to all open PRs'],
    });
  }

  if (metrics.commitStats?.last7Days < 3) {
    recs.push({
      priority: 'medium',
      category: 'velocity',
      title: 'Increase commit frequency',
      description: 'Low commit activity detected. Consider breaking work into smaller, more frequent commits.',
      actionItems: ['Commit after each logical unit of work', 'Use feature branches for better tracking', 'Set daily standup reminders'],
    });
  }

  return recs;
};

/**
 * Summarize bottlenecks from health data
 */
const summarizeBottlenecks = (sprintHealth) => {
  if (!sprintHealth?.bottlenecks?.length && !sprintHealth?.risks?.length) {
    return 'No significant bottlenecks detected. Repository is operating smoothly.';
  }

  const items = [
    ...(sprintHealth.bottlenecks || []),
    ...(sprintHealth.risks || []),
  ];

  return `Detected ${items.length} area(s) requiring attention: ${items.join('; ')}.`;
};

module.exports = { generateAIInsights };
