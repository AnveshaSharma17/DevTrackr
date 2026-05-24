const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const authService = require('../services/authService');

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  const result = await authService.signup({ name, email, password });
  return sendSuccess(res, result, 'Account created successfully', 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const result = await authService.login({ email, password });
  return sendSuccess(res, result, 'Logged in successfully');
});

const getProfile = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user._id);
  return sendSuccess(res, profile, 'Profile retrieved');
});

const updateProfile = asyncHandler(async (req, res) => {
  const updated = await authService.updateProfile(req.user._id, req.body);
  return sendSuccess(res, updated, 'Profile updated');
});

/**
 * POST /api/auth/upload-avatar
 * Accepts { avatar: 'data:image/...;base64,...' } — validates MIME + size, saves to DB
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  const { avatar } = req.body;

  if (!avatar || typeof avatar !== 'string') {
    return res.status(400).json({ success: false, message: 'avatar field (base64 data URL) is required' });
  }

  // Validate MIME type
  const mimeMatch = avatar.match(/^data:(image\/(jpeg|png|gif|webp));base64,/);
  if (!mimeMatch) {
    return res.status(400).json({ success: false, message: 'Only JPEG, PNG, GIF, or WebP images are allowed' });
  }

  // Validate size (base64 string ~= 4/3 * actual bytes; limit 5 MB raw)
  const base64Data = avatar.split(',')[1];
  const approxBytes = Math.ceil(base64Data.length * 0.75);
  if (approxBytes > 5 * 1024 * 1024) {
    return res.status(400).json({ success: false, message: 'Image must be smaller than 5 MB' });
  }

  const updated = await authService.updateProfile(req.user._id, { avatar });
  return sendSuccess(res, updated, 'Avatar updated');
});

module.exports = { signup, login, getProfile, updateProfile, uploadAvatar };
