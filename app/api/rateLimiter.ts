// import { Ratelimit } from "@upstash/ratelimit";
// import { Redis } from "@upstash/redis";

// export const redis = Redis.fromEnv();

// export const rateLimiter = new Ratelimit({
//   redis,
//   limiter: Ratelimit.fixedWindow(10, "60 s"), // 10 requests / 60 sec
//   analytics: true,
//   prefix: "news_api",
// });



// lib/rateLimiter.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ✅ Use Redis from environment (make sure UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set)
export const redis = Redis.fromEnv();

// ✅ Production-ready limiter
export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow( // you can swap for slidingWindow if you want smoother distribution
    100, // max requests
    "60 s" // per 60 seconds
  ),
  analytics: true,
  prefix: "thenews_api", // unique per project to avoid collisions
});
