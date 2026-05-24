const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    repoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Commit statistics
    commitStats: {
      total: { type: Number, default: 0 },
      last7Days: { type: Number, default: 0 },
      last30Days: { type: Number, default: 0 },
      dailyActivity: [
        {
          date: String,
          count: Number,
        },
      ],
      weeklyActivity: [
        {
          week: String,
          count: Number,
        },
      ],
      streak: { type: Number, default: 0 }, // Days in a row
      avgPerDay: { type: Number, default: 0 },
      peakDay: { date: String, count: Number },
    },
    // Pull Request statistics
    prStats: {
      total: { type: Number, default: 0 },
      open: { type: Number, default: 0 },
      closed: { type: Number, default: 0 },
      merged: { type: Number, default: 0 },
      avgMergeTime: { type: Number, default: 0 }, // hours
      mergeRate: { type: Number, default: 0 }, // percentage
      pendingReview: { type: Number, default: 0 },
      stalePRs: { type: Number, default: 0 }, // PRs older than 7 days
    },
    // Issue statistics
    issueStats: {
      total: { type: Number, default: 0 },
      open: { type: Number, default: 0 },
      closed: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 }, // percentage
      avgResolutionTime: { type: Number, default: 0 }, // hours
      byLabel: [{ label: String, count: Number }],
    },
    // Contributor analytics
    contributorStats: {
      total: { type: Number, default: 0 },
      active: { type: Number, default: 0 }, // active in last 14 days
      inactive: { type: Number, default: 0 },
      contributors: [
        {
          username: String,
          avatarUrl: String,
          totalCommits: Number,
          last7Days: Number,
          last30Days: Number,
          lastCommitDate: Date,
          isActive: Boolean,
          dominancePercent: Number, // % of total commits
          linesAdded: Number,
          linesDeleted: Number,
        },
      ],
      dominanceRisk: { type: Boolean, default: false }, // true if one person > 60% commits
      dominantContributor: { type: String, default: null },
    },
    // Sprint & velocity
    sprintHealth: {
      score: { type: Number, default: 0, min: 0, max: 100 },
      status: {
        type: String,
        enum: ['healthy', 'at-risk', 'critical'],
        default: 'healthy',
      },
      velocity: { type: Number, default: 0 }, // commits per week
      velocityTrend: {
        type: String,
        enum: ['increasing', 'stable', 'decreasing'],
        default: 'stable',
      },
      bottlenecks: [String],
      risks: [String],
    },
    // Overall health score
    healthScore: {
      overall: { type: Number, default: 0, min: 0, max: 100 },
      breakdown: {
        commitActivity: Number,
        prFlow: Number,
        issueManagement: Number,
        teamCollaboration: Number,
        codeQuality: Number,
      },
    },
    // AI-generated content (cached)
    aiSummary: {
      sprintSummary: { type: String, default: '' },
      productivityInsights: { type: String, default: '' },
      teamHealthAnalysis: { type: String, default: '' },
      recommendations: [
        {
          priority: { type: String, enum: ['high', 'medium', 'low'] },
          category: String,
          title: String,
          description: String,
          actionItems: [String],
        },
      ],
      bottleneckAnalysis: { type: String, default: '' },
      generatedAt: { type: Date, default: null },
      model: { type: String, default: 'gemini-2.0-flash' },
    },
    // Cache metadata
    dataWindow: {
      from: { type: Date },
      to: { type: Date },
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    // Used to detect if re-generation is needed
    cacheKey: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

analyticsSchema.index({ repoId: 1, userId: 1 });
analyticsSchema.index({ generatedAt: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
