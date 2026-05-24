const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const githubService = require('../services/githubService');
const User = require('../models/User');
const axios = require('axios');

/**
 * GET /api/github/connect   (protected)
 * Returns GitHub OAuth authorization URL with userId embedded in state
 */
const getConnectUrl = asyncHandler(async (req, res) => {
  const url = githubService.getAuthUrl(req.user._id);
  return sendSuccess(res, { url }, 'GitHub OAuth URL generated');
});

/**
 * GET /api/github/callback   (public — GitHub redirects here)
 * Exchanges code for access token. userId comes from state param.
 */
const handleCallback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;

  // GitHub may return an error
  if (error) {
    console.error('GitHub OAuth denied:', error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/settings?github=error&message=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/settings?github=error&message=No+authorization+code+received`
    );
  }

  // Decode userId from state
  let userId;
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    userId = decoded.userId;
    if (!userId) throw new Error('No userId in state');
  } catch (err) {
    console.error('GitHub callback: invalid state param', err.message);
    return res.redirect(
      `${process.env.FRONTEND_URL}/settings?github=error&message=Invalid+OAuth+state`
    );
  }

  try {
    await githubService.connectGitHub(userId, code);
    return res.redirect(`${process.env.FRONTEND_URL}/settings?github=success`);
  } catch (err) {
    console.error('GitHub callback error:', err.message);
    return res.redirect(
      `${process.env.FRONTEND_URL}/settings?github=error&message=${encodeURIComponent(err.message)}`
    );
  }
});

/**
 * GET /api/github/repos   (protected)
 * Returns all repos from GitHub for the connected user
 */
const getUserRepos = asyncHandler(async (req, res) => {
  const repos = await githubService.getUserRepos(req.user._id);
  return sendSuccess(res, repos, 'Repositories fetched');
});

/**
 * GET /api/github/connected-repos   (protected)
 * Returns repos saved in our database
 */
const getConnectedRepos = asyncHandler(async (req, res) => {
  const repos = await githubService.getConnectedRepos(req.user._id);
  return sendSuccess(res, repos, 'Connected repositories retrieved');
});

/**
 * POST /api/github/connect-repo   (protected)
 * Save a repository to track it
 */
const connectRepo = asyncHandler(async (req, res) => {
  const repoData = req.body;

  if (!repoData.fullName || !repoData.githubRepoId) {
    return res.status(400).json({ success: false, message: 'Repository fullName and githubRepoId required' });
  }

  const repo = await githubService.saveRepository(req.user._id, repoData);
  return sendSuccess(res, repo, 'Repository connected', 201);
});

/**
 * DELETE /api/github/disconnect   (protected)
 * Disconnect GitHub account
 */
const disconnectGitHub = asyncHandler(async (req, res) => {
  await githubService.disconnectGitHub(req.user._id);
  return sendSuccess(res, {}, 'GitHub account disconnected');
});

/**
 * POST /api/github/add-public   (protected)
 * Add any public GitHub repo by URL or owner/repo slug.
 * Uses the user's GitHub token if connected (5000 req/hr),
 * otherwise falls back to unauthenticated (60 req/hr).
 */
const addPublicRepo = asyncHandler(async (req, res) => {
  const { repoUrl } = req.body;

  if (!repoUrl || !repoUrl.trim()) {
    return res.status(400).json({ success: false, message: 'Repository URL or owner/repo slug is required' });
  }

  // ── Parse input into owner/repo ──────────────────────────────────────────
  let owner, repo;
  const raw = repoUrl.trim().replace(/\/+$/, ''); // strip trailing slashes

  try {
    if (raw.includes('github.com')) {
      // Full URL: https://github.com/owner/repo or github.com/owner/repo
      const url = raw.startsWith('http') ? new URL(raw) : new URL('https://' + raw);
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length < 2) throw new Error('invalid');
      [owner, repo] = parts;
    } else if (raw.includes('/')) {
      // Slug: owner/repo
      [owner, repo] = raw.split('/');
    } else {
      throw new Error('invalid');
    }
    // Strip .git suffix if present
    repo = repo.replace(/\.git$/, '');
    if (!owner || !repo) throw new Error('invalid');
  } catch {
    return res.status(400).json({
      success: false,
      message: 'Invalid format. Use a GitHub URL (https://github.com/owner/repo) or owner/repo slug.',
    });
  }

  // ── Build GitHub API headers (use user token if available) ───────────────
  const user = await User.findById(req.user._id).select('+githubAccessToken');
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'DevTrackr-App',
  };
  if (user?.githubAccessToken) {
    headers['Authorization'] = `Bearer ${user.githubAccessToken}`;
  }

  // ── Fetch repo metadata from GitHub ──────────────────────────────────────
  let ghRepo;
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    ghRepo = response.data;
  } catch (err) {
    const status = err.response?.status;
    if (status === 404) {
      return res.status(404).json({
        success: false,
        message: `Repository "${owner}/${repo}" not found. Make sure it exists and is public.`,
      });
    }
    if (status === 403 || status === 429) {
      return res.status(429).json({
        success: false,
        message: 'GitHub API rate limit reached. Connect your GitHub account for higher limits.',
      });
    }
    throw err; // Let asyncHandler handle unexpected errors
  }

  // ── Block private repos (user doesn't own them) ───────────────────────────
  if (ghRepo.private) {
    return res.status(403).json({
      success: false,
      message: `"${owner}/${repo}" is a private repository. Only public repositories can be added this way.`,
    });
  }

  // ── Save to Repository collection (same as regular connect) ──────────────
  const repoData = {
    githubRepoId: ghRepo.id,
    name: ghRepo.name,
    fullName: ghRepo.full_name,
    owner: ghRepo.owner.login,
    description: ghRepo.description || '',
    language: ghRepo.language || null,
    stars: ghRepo.stargazers_count,
    forks: ghRepo.forks_count,
    openIssues: ghRepo.open_issues_count,
    isPrivate: false,
    defaultBranch: ghRepo.default_branch,
    htmlUrl: ghRepo.html_url,
  };

  const savedRepo = await githubService.saveRepository(req.user._id, repoData);
  return sendSuccess(res, savedRepo, `"${ghRepo.full_name}" added successfully!`, 201);
});

module.exports = {
  getConnectUrl,
  handleCallback,
  getUserRepos,
  getConnectedRepos,
  connectRepo,
  addPublicRepo,
  disconnectGitHub,
};
