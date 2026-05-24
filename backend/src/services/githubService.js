const axios = require('axios');
const User = require('../models/User');
const Repository = require('../models/Repository');
const cache = require('../utils/cache');

const GITHUB_API = 'https://api.github.com';
const GITHUB_OAUTH = 'https://github.com/login/oauth';

/**
 * Build GitHub OAuth authorization URL
 * Encodes userId in state param so callback can identify user
 */
const getAuthUrl = (userId) => {
  const statePayload = Buffer.from(JSON.stringify({
    userId: userId.toString(),
    nonce: Math.random().toString(36).substring(7),
  })).toString('base64');

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope: 'repo read:user user:email',
    state: statePayload,
  });
  return `${GITHUB_OAUTH}/authorize?${params.toString()}`;
};

/**
 * Exchange OAuth code for access token
 */
const exchangeCode = async (code) => {
  const response = await axios.post(
    `${GITHUB_OAUTH}/access_token`,
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_CALLBACK_URL,
    },
    {
      headers: { Accept: 'application/json' },
    }
  );

  if (response.data.error) {
    throw new Error(`GitHub OAuth error: ${response.data.error_description}`);
  }

  return response.data.access_token;
};

/**
 * Create authenticated GitHub API client
 */
const githubClient = (token) => {
  return axios.create({
    baseURL: GITHUB_API,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
};

/**
 * Fetch GitHub user info
 */
const getGitHubUser = async (token) => {
  const client = githubClient(token);
  const response = await client.get('/user');
  return response.data;
};

/**
 * Save GitHub token to user and fetch their info
 */
const connectGitHub = async (userId, code) => {
  const accessToken = await exchangeCode(code);
  const ghUser = await getGitHubUser(accessToken);

  const user = await User.findByIdAndUpdate(
    userId,
    {
      githubAccessToken: accessToken,
      githubUsername: ghUser.login,
      githubId: String(ghUser.id),
      isGithubConnected: true,
      avatar: ghUser.avatar_url,
    },
    { new: true }
  );

  return user.safeData;
};

/**
 * Fetch all repositories for authenticated user
 */
const getUserRepos = async (userId) => {
  const cacheKey = `repos:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const user = await User.findById(userId).select('+githubAccessToken');
  if (!user?.githubAccessToken) {
    const err = new Error('GitHub account not connected');
    err.statusCode = 400;
    throw err;
  }

  const client = githubClient(user.githubAccessToken);
  let allRepos = [];
  let page = 1;

  while (true) {
    const response = await client.get('/user/repos', {
      params: { per_page: 100, page, sort: 'updated', type: 'all' },
    });
    if (!response.data.length) break;
    allRepos = [...allRepos, ...response.data];
    if (response.data.length < 100) break;
    page++;
  }

  const formatted = allRepos.map((r) => ({
    githubRepoId: r.id,
    name: r.name,
    fullName: r.full_name,
    owner: r.owner.login,
    description: r.description || '',
    language: r.language,
    stars: r.stargazers_count,
    forks: r.forks_count,
    openIssues: r.open_issues_count,
    isPrivate: r.private,
    defaultBranch: r.default_branch,
    htmlUrl: r.html_url,
    updatedAt: r.updated_at,
  }));

  cache.set(cacheKey, formatted, 5 * 60 * 1000); // Cache 5 min
  return formatted;
};

/**
 * Fetch commits for a repository
 */
const getCommits = async (userId, owner, repo, since = null) => {
  const cacheKey = `commits:${owner}/${repo}:${since || 'all'}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const user = await User.findById(userId).select('+githubAccessToken');
  const client = githubClient(user.githubAccessToken);

  const params = { per_page: 100 };
  if (since) params.since = since;

  let allCommits = [];
  let page = 1;

  try {
    while (page <= 10) { // Cap at 1000 commits
      const response = await client.get(`/repos/${owner}/${repo}/commits`, {
        params: { ...params, page },
      });
      if (!response.data.length) break;
      allCommits = [...allCommits, ...response.data];
      if (response.data.length < 100) break;
      page++;
    }
  } catch (err) {
    if (err.response?.status === 409) return []; // Empty repo
    throw err;
  }

  cache.set(cacheKey, allCommits, 10 * 60 * 1000);
  return allCommits;
};

/**
 * Fetch pull requests for a repository
 */
const getPullRequests = async (userId, owner, repo) => {
  const cacheKey = `prs:${owner}/${repo}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const user = await User.findById(userId).select('+githubAccessToken');
  const client = githubClient(user.githubAccessToken);

  let allPRs = [];
  let page = 1;

  while (page <= 5) {
    const response = await client.get(`/repos/${owner}/${repo}/pulls`, {
      params: { state: 'all', per_page: 100, page },
    });
    if (!response.data.length) break;
    allPRs = [...allPRs, ...response.data];
    if (response.data.length < 100) break;
    page++;
  }

  cache.set(cacheKey, allPRs, 10 * 60 * 1000);
  return allPRs;
};

/**
 * Fetch issues for a repository
 */
const getIssues = async (userId, owner, repo) => {
  const cacheKey = `issues:${owner}/${repo}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const user = await User.findById(userId).select('+githubAccessToken');
  const client = githubClient(user.githubAccessToken);

  let allIssues = [];
  let page = 1;

  while (page <= 5) {
    const response = await client.get(`/repos/${owner}/${repo}/issues`, {
      params: { state: 'all', per_page: 100, page },
    });
    if (!response.data.length) break;
    // Filter out pull requests (GitHub issues API includes PRs)
    const issues = response.data.filter((i) => !i.pull_request);
    allIssues = [...allIssues, ...issues];
    if (response.data.length < 100) break;
    page++;
  }

  cache.set(cacheKey, allIssues, 10 * 60 * 1000);
  return allIssues;
};

/**
 * Fetch contributors for a repository
 */
const getContributors = async (userId, owner, repo) => {
  const cacheKey = `contributors:${owner}/${repo}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const user = await User.findById(userId).select('+githubAccessToken');
  const client = githubClient(user.githubAccessToken);

  try {
    const response = await client.get(`/repos/${owner}/${repo}/contributors`, {
      params: { per_page: 100 },
    });
    cache.set(cacheKey, response.data, 15 * 60 * 1000);
    return response.data;
  } catch (err) {
    if (err.response?.status === 204) return [];
    throw err;
  }
};

/**
 * Save repository to database
 */
const saveRepository = async (userId, repoData) => {
  const existing = await Repository.findOne({
    userId,
    githubRepoId: repoData.githubRepoId,
  });

  if (existing) return existing;

  const repo = await Repository.create({ ...repoData, userId });

  // Add to user's connected repos list
  await User.findByIdAndUpdate(userId, {
    $addToSet: { connectedRepositories: repoData.fullName },
  });

  return repo;
};

/**
 * Get all connected repositories for a user
 */
const getConnectedRepos = async (userId) => {
  return Repository.find({ userId }).sort({ updatedAt: -1 });
};

/**
 * Disconnect GitHub account
 */
const disconnectGitHub = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    githubAccessToken: null,
    githubUsername: null,
    githubId: null,
    isGithubConnected: false,
    connectedRepositories: [],
  });
};

module.exports = {
  getAuthUrl,
  exchangeCode,
  connectGitHub,
  getUserRepos,
  getCommits,
  getPullRequests,
  getIssues,
  getContributors,
  saveRepository,
  getConnectedRepos,
  disconnectGitHub,
};
