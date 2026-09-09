// @vitest-environment node
import { beforeEach, describe, it, expect, vi } from 'vitest';
const exchange = vi.hoisted(() => vi.fn());
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: { exchangeCodeForSession: exchange } }) }));
import { GET } from '@/app/auth/callback/route';
beforeEach(() => { exchange.mockReset().mockResolvedValue({ error: null }); });
describe('actual auth callback', () => {
  it('missing code redirects to error without exchange', async () => {
    const response = await GET(new Request('https://example.com/auth/callback'));
    expect(response.status).toBe(307); expect(response.headers.get('location')).toContain('/auth/error?');
    expect(exchange).not.toHaveBeenCalled();
  });
  it('expired code redirects to error', async () => {
    exchange.mockResolvedValue({ error: { message: 'expired' } });
    expect((await GET(new Request('https://example.com/auth/callback?code=expired'))).headers.get('location')).toContain('/auth/error?');
  });
  it('recovery exchanges code before password destination', async () => {
    const response = await GET(new Request('https://example.com/auth/callback?code=test&next=/auth/actualizar-password'));
    expect(exchange).toHaveBeenCalledWith('test'); expect(response.headers.get('location')).toBe('https://example.com/auth/actualizar-password');
  });
  it('external redirect destination is rejected', async () => {
    expect((await GET(new Request('https://example.com/auth/callback?code=test&next=https://evil.example'))).headers.get('location')).toBe('https://example.com/auth/confirmado');
  });
});
