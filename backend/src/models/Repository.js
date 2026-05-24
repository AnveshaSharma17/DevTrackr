const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema(
  {
    // GitHub identifiers
    githubRepoId: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true, // "owner/repo"
      trim: true,
    },
    owner: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    // Ownership
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Repository metadata from GitHub
    language: {
      type: String,
      default: null,
    },
    languages: {
      type: Map,
      of: Number,
      default: {},
    },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    openIssues: { type: Number, default: 0 },
    isPrivate: { type: Boolean, default: false },
    defaultBranch: { type: String, default: 'main' },
    htmlUrl: { type: String, default: '' },
    // Sync tracking
    lastSynced: {
      type: Date,
      default: null,
    },
    syncStatus: {
      type: String,
      enum: ['pending', 'syncing', 'synced', 'error'],
      default: 'pending',
    },
    syncError: {
      type: String,
      default: null,
    },
    // Reference to latest analytics
    analyticsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Analytics',
      default: null,
    },
    // Cached stats (for quick dashboard display)
    cachedStats: {
      totalCommits: { type: Number, default: 0 },
      openPRs: { type: Number, default: 0 },
      closedIssues: { type: Number, default: 0 },
      contributors: { type: Number, default: 0 },
      healthScore: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for fast lookups
repositorySchema.index({ userId: 1, fullName: 1 }, { unique: true });
repositorySchema.index({ githubRepoId: 1, userId: 1 });

module.exports = mongoose.model('Repository', repositorySchema);
