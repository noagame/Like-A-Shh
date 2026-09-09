// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const mocks = vi.hoisted(() => ({ getUser: vi.fn(), single: vi.fn() }));
vi.mock('@supabase/ssr', () => ({ createServerClient: () => ({
  auth: { getUser: mocks.getUser },
  from: () => ({ select: () => ({ eq: () => ({ single: mocks.single }) }) }),
}) }));
import { proxy } from '@/proxy';
beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL','https://example.supabase.co'); vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','test');
  mocks.getUser.mockResolvedValue({ data:{ user:{id:'test'} }, error:null });
});
afterEach(() => vi.unstubAllEnvs());
it('redirects normal users away from administrative pages', async () => {
  mocks.single.mockResolvedValue({ data:{role:'user'},error:null });
  const result = await proxy(new NextRequest('https://example.com/admin/usuarios'));
  expect(result.headers.get('location')).toBe('https://example.com/');
});
it('allows admin navigation', async () => {
  mocks.single.mockResolvedValue({ data:{role:'admin'},error:null });
  const result = await proxy(new NextRequest('https://example.com/admin/usuarios'));
  expect(result.headers.get('location')).toBeNull();
});
it('rejects unknown role on failed lookup', async () => {
  mocks.single.mockResolvedValue({ data:null,error:{message:'offline'} });
  const result = await proxy(new NextRequest('https://example.com/admin/usuarios'));
  expect(result.headers.get('location')).toBe('https://example.com/');
});
