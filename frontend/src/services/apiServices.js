import api from './api';

export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  uploadAvatar: (avatar) => api.post('/auth/upload-avatar', { avatar }),
};

export const githubApi = {
  getConnectUrl: () => api.get('/github/connect'),
  getUserRepos: () => api.get('/github/repos'),
  getConnectedRepos: () => api.get('/github/connected-repos'),
  connectRepo: (repoData) => api.post('/github/connect-repo', repoData),
  addPublicRepo: (repoUrl) => api.post('/github/add-public', { repoUrl }),
  disconnect: () => api.delete('/github/disconnect'),
};

export const analyticsApi = {
  getAnalytics: (repoId) => api.get(`/analytics/${repoId}`),
  generateAnalytics: (repoId) => api.post(`/analytics/generate/${repoId}`),
};

export const aiApi = {
  generateSummary: (repoId) => api.post(`/ai/summary/${repoId}`),
  getInsights: (repoId) => api.get(`/ai/insights/${repoId}`),
};
