import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasUpstashConfig =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

export const loginRateLimit = hasUpstashConfig
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 intentos por minuto por IP
    })
  : null;

/**
 * Envuelve la llamada al rate limiter. Si Upstash no está configurado
 * (típico en desarrollo local antes de crear la base de datos en
 * upstash.com), deja pasar la request pero avisa por consola en vez de
 * romper el login. En producción SIEMPRE debe estar configurado Upstash;
 * no dependas de este "fail-open" fuera de desarrollo.
 */
export async function checkLoginRateLimit(ip: string) {
  if (!loginRateLimit) {
    console.warn(
      "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN no configurados — se omite el límite de intentos."
    );
    return { success: true };
  }
  return loginRateLimit.limit(ip);
}