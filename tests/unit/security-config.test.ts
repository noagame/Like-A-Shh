// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import config from '@/next.config';
import { isAdultBirthDate } from '@/lib/validation/profile';
import { getSiteUrl } from '@/lib/auth/site-url';
afterEach(() => vi.unstubAllEnvs());
describe('security configuration', () => {
  it('H09 allows Formspree without wildcard connections', async () => {
    const headers = await config.headers!();
    const csp = headers[0].headers.find(header => header.key === 'Content-Security-Policy')!.value;
    const connections = csp.split(';').find(part => part.trim().startsWith('connect-src'))!;
    expect(connections.split(/\s+/)).toContain('https://formspree.io');
    expect(connections.split(/\s+/)).not.toContain('*');
    expect(csp).not.toContain("'unsafe-eval'");
  });
  it('production requires an explicit HTTPS site URL', () => {
    vi.stubEnv('NODE_ENV','production'); vi.stubEnv('NEXT_PUBLIC_SITE_URL','');
    expect(() => getSiteUrl()).toThrow('NEXT_PUBLIC_SITE_URL');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL','http://example.com'); expect(() => getSiteUrl()).toThrow('HTTPS');
  });
  it('age boundary uses Chile civil date', () => {
    const today = new Date('2026-09-09T15:00:00Z');
    expect(isAdultBirthDate('2008-09-09',today)).toBe(true);
    expect(isAdultBirthDate('2008-09-10',today)).toBe(false);
    expect(isAdultBirthDate('2000-02-31',today)).toBe(false);
  });
});
