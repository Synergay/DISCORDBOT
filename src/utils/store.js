const { Redis } = require("@upstash/redis");

let redis = null;

function getRedis() {
  if (!redis && process.env.UPSTASH_REDIS_REST_URL) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

async function get(key, fallback = null) {
  const r = getRedis();
  if (!r) return fallback;
  try {
    const val = await r.get(key);
    return val || fallback;
  } catch {
    return fallback;
  }
}

async function set(key, val) {
  const r = getRedis();
  if (!r) return false;
  try {
    await r.set(key, val);
    return true;
  } catch {
    return false;
  }
}

module.exports = { get, set };
