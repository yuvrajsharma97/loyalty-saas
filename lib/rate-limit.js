
const requests = new Map();

function cleanupExpired() {
  const now = Date.now();
  for (const [key, data] of requests.entries()) {
    if (now > data.resetTime) {
      requests.delete(key);
    }
  }
}

function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown");

}

function withRateLimit(handler, options = {}) {
  const {
    windowMs = 60_000,
    max = 60,
    keyGenerator = getClientIP
  } = options;

  return async (req, res) => {
    cleanupExpired();

    const key = keyGenerator(req);
    const now = Date.now();
    const resetTime = now + windowMs;

    if (!requests.has(key)) {
      requests.set(key, { count: 1, resetTime });
    } else {
      const data = requests.get(key);
      if (now > data.resetTime) {
        data.count = 1;
        data.resetTime = resetTime;
      } else {
        data.count += 1;
        if (data.count > max) {
          return res.status(429).json({
            ok: false,
            error: "Too many requests"
          });
        }
      }
    }

    return handler(req, res);
  };
}

export { withRateLimit };