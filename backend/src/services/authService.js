const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

/**
 * Register a new user
 */
const signup = async ({ name, email, password }) => {
  // Check if user already exists
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  // Create user (password hashed by pre-save hook)
  const user = await User.create({ name, email: email.toLowerCase(), password });

  const token = generateToken(user._id);

  return { user: user.safeData, token };
};

/**
 * Login an existing user
 */
const login = async ({ email, password }) => {
  // Find user with password field included
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken(user._id);

  return { user: user.safeData, token };
};

/**
 * Get user profile
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user.safeData;
};

/**
 * Update user profile
 */
const updateProfile = async (userId, updates) => {
  const allowedUpdates = ['name', 'avatar', 'preferences'];
  const filteredUpdates = {};

  allowedUpdates.forEach((field) => {
    if (updates[field] !== undefined) {
      filteredUpdates[field] = updates[field];
    }
  });

  const user = await User.findByIdAndUpdate(userId, filteredUpdates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return user.safeData;
};

module.exports = { signup, login, getProfile, updateProfile };
