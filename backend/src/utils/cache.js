/**
 * Simple in-memory LRU cache to reduce GitHub API calls
 */

const cache = new Map();
const TTL_MAP = new Map(); // key -> expiry timestamp

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_SIZE = 200;

const set = (key, value, ttl = DEFAULT_TTL) => {
  // Evict oldest if at capacity
  if (cache.size >= MAX_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
    TTL_MAP.delete(firstKey);
  }
  cache.set(key, value);
  TTL_MAP.set(key, Date.now() + ttl);
};

const get = (key) => {
  const expiry = TTL_MAP.get(key);
  if (!expiry) return null;

  if (Date.now() > expiry) {
    cache.delete(key);
    TTL_MAP.delete(key);
    return null;
  }

  return cache.get(key);
};

const del = (key) => {
  cache.delete(key);
  TTL_MAP.delete(key);
};

const clear = () => {
  cache.clear();
  TTL_MAP.clear();
};

const has = (key) => {
  return get(key) !== null;
};

const size = () => cache.size;

module.exports = { set, get, del, clear, has, size };
