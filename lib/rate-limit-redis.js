import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { sendRateLimitError } from "./api-response.js";

// Create Redis client
// In development without Upstash, this will be null
let redis = null;
let ratelimit = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // Create a new ratelimiter that allows 10 requests per 10 seconds by default
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
    prefix: "@upstash/ratelimit",
  });
}

/**
 * Get client identifier for rate limiting
 * @param {object} req - Request object
 * @returns {string} Client identifier
 */
function getClientIdentifier(req) {
  // Try to get IP from various headers
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : req.socket?.remoteAddress || "unknown";

  // For authenticated requests, use userId
  const userId = req.user?.id || req.session?.user?.id;

  return userId ? `user:${userId}` : `ip:${ip}`;
}

/**
 * Rate limiting middleware with Upstash Redis
 * Falls back to in-memory rate limiting if Redis is not configured
 *
 * @param {object} options - Rate limit options
 * @param {number} options.requests - Number of requests allowed
 * @param {string} options.window - Time window (e.g., "10 s", "1 m", "1 h")
 * @param {string} options.prefix - Optional prefix for the rate limit key
 */
export function withRateLimit(options = {}) {
  const {
    requests = 10,
    window = "10 s",
    prefix = "ratelimit",
  } = options;

  return async (req, res, next) => {
    // If Redis is not configured, skip rate limiting in development
    if (!ratelimit) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Redis rate limiting not configured, skipping in development');
        return next(req, res);
      } else {
        // In production, Redis should be configured
        console.error('Redis rate limiting not configured in production');
        return sendRateLimitError(res);
      }
    }

    try {
      const identifier = getClientIdentifier(req);
      const { success, limit, reset, remaining } = await ratelimit.limit(
        `${prefix}:${identifier}`
      );

      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", remaining);
      res.setHeader("X-RateLimit-Reset", reset);

      if (!success) {
        const retryAfter = Math.ceil((reset - Date.now()) / 1000);
        console.warn('Rate limit exceeded', {
          identifier,
          limit,
          path: req.url,
        });

        return sendRateLimitError(res, retryAfter);
      }

      return next(req, res);
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Don't block requests if rate limiting fails
      return next(req, res);
    }
  };
}

/**
 * Create custom rate limiter with specific settings
 * @param {object} options - Rate limit configuration
 * @returns {Ratelimit} Ratelimit instance
 */
export function createRateLimiter(options = {}) {
  const {
    requests = 10,
    window = "10 s",
    analytics = true,
  } = options;

  if (!redis) {
    console.warn('Redis not configured, rate limiter will not work');
    return null;
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics,
    prefix: "@upstash/ratelimit",
  });
}

/**
 * Preset rate limiters for common use cases
 */
export const rateLimiters = {
  // Strict rate limit for authentication endpoints (5 requests per minute)
  auth: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
    prefix: "ratelimit:auth",
  }) : null,

  // Moderate rate limit for API endpoints (30 requests per minute)
  api: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    analytics: true,
    prefix: "ratelimit:api",
  }) : null,

  // Lenient rate limit for public endpoints (100 requests per minute)
  public: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
    prefix: "ratelimit:public",
  }) : null,

  // Very strict for sensitive operations (3 requests per 5 minutes)
  sensitive: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "5 m"),
    analytics: true,
    prefix: "ratelimit:sensitive",
  }) : null,
};

/**
 * Wrapper for using preset rate limiters
 * @param {string} type - Type of rate limiter (auth, api, public, sensitive)
 */
export function withPresetRateLimit(type = 'api') {
  return async (req, res, next) => {
    const limiter = rateLimiters[type];

    if (!limiter) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Rate limiter '${type}' not configured, skipping in development`);
        return next(req, res);
      } else {
        console.error(`Rate limiter '${type}' not configured in production`);
        return sendRateLimitError(res);
      }
    }

    try {
      const identifier = getClientIdentifier(req);
      const { success, limit, reset, remaining } = await limiter.limit(identifier);

      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", remaining);
      res.setHeader("X-RateLimit-Reset", reset);

      if (!success) {
        const retryAfter = Math.ceil((reset - Date.now()) / 1000);
        console.warn(`Rate limit exceeded for ${type}`, {
          identifier,
          limit,
          path: req.url,
        });

        return sendRateLimitError(res, retryAfter);
      }

      return next(req, res);
    } catch (error) {
      console.error(`Rate limiting error (${type}):`, error);
      // Don't block requests if rate limiting fails
      return next(req, res);
    }
  };
}

export default withRateLimit;
