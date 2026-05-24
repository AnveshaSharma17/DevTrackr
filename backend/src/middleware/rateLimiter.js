const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter — 100 requests per 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again in 15 minutes.',
  },
  skip: (req) => process.env.NODE_ENV === 'development',
});

/**
 * Strict limiter for auth endpoints — 10 per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many auth attempts. Please try again later.',
  },
});

/**
 * AI endpoint limiter — 20 per hour (Gemini API cost protection)
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI request limit reached. Please try again in an hour.',
  },
});

module.exports = { apiLimiter, authLimiter, aiLimiter };
