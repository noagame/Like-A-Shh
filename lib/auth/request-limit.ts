import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import { headers } from 'next/headers';
import { checkLoginRateLimit } from '@/lib/rate-limit';

export async function allowAuthRequest(action: string, email: string) {
  // Only trust a header explicitly configured and overwritten by the ingress proxy.
  const trustedHeader = process.env.TRUSTED_CLIENT_IP_HEADER;
  const headerValue = trustedHeader ? (await headers()).get(trustedHeader) : null;
  const ip = headerValue && isIP(headerValue.trim()) ? headerValue.trim() : 'shared';
  const account = createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
  try {
    const result = await checkLoginRateLimit(`${action}:ip:${ip}`);
    if (!result.success) return false;
    return (await checkLoginRateLimit(`${action}:account:${account}`)).success;
  } catch {
    console.error('[auth] Servicio de limitación no disponible.');
    return false;
  }
}
