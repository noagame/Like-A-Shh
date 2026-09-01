import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasUpstashConfig =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

export const loginRateLimit = hasUpstashConfig
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "60 s"),
    })
  : null;

export async function checkLoginRateLimit(ip: string) {
  if (!loginRateLimit) {
    if (process.env.NODE_ENV === "production") {
      console.error("[rate-limit] Upstash no configurado en producción. Bloqueando login por seguridad.");
      return { success: false, retryAfter: 60 };
    }

    console.warn("[rate-limit] Upstash no configurado en desarrollo; permitiendo temporalmente.");
    return { success: true };
  }

  return loginRateLimit.limit(ip);
}