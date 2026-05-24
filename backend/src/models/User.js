const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password in queries
    },
    avatar: {
      type: String,
      default: null,
    },
    // GitHub OAuth integration
    githubAccessToken: {
      type: String,
      default: null,
      select: false,
    },
    githubUsername: {
      type: String,
      default: null,
    },
    githubId: {
      type: String,
      default: null,
    },
    isGithubConnected: {
      type: Boolean,
      default: false,
    },
    // Connected repositories (array of repo full names)
    connectedRepositories: [
      {
        type: String,
      },
    ],
    // User preferences
    preferences: {
      defaultRepo: { type: String, default: null },
      theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
      emailNotifications: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Hash password before saving ───────────────────────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ─── Method: Compare passwords ─────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Virtual: Safe user object ─────────────────────────────────────────────────
userSchema.virtual('safeData').get(function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    githubUsername: this.githubUsername,
    isGithubConnected: this.isGithubConnected,
    connectedRepositories: this.connectedRepositories,
    preferences: this.preferences,
    createdAt: this.createdAt,
  };
});

module.exports = mongoose.model('User', userSchema);
