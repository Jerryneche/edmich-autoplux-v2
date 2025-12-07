// lib/rate-limit.ts
import { LRUCache } from "lru-cache";

type RateLimitOptions = {
  interval: number;
  uniqueTokenPerInterval: number;
};

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, [1]);
          resolve();
        } else if (tokenCount[0] < limit) {
          tokenCache.set(token, [tokenCount[0] + 1]);
          resolve();
        } else {
          reject(new Error("Rate limit exceeded"));
        }
      }),
  };
}

// Create rate limiter instances
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 unique IPs per interval
});

export const ratelimit = {
  limit: async (identifier: string) => {
    try {
      await limiter.check(10, identifier); // 10 requests per minute
      return { success: true, remaining: 10 };
    } catch {
      return { success: false, remaining: 0 };
    }
  },
};
