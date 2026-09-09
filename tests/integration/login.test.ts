// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
const client = vi.hoisted(() => vi.fn());
vi.mock('@/lib/supabase/server', () => ({ createClient: client }));
vi.mock('@/lib/auth/request-limit', () => ({ allowAuthRequest: async () => true }));
import { signIn, signUp } from '@/app/login/actions';
describe('actual login and signup validation', () => {
  it('invalid email never reaches authentication', async () => {
    const data = new FormData(); data.set('email','bad'); data.set('password','test');
    expect(await signIn(data)).toHaveProperty('error'); expect(client).not.toHaveBeenCalled();
  });
  it('mismatched passwords never create account', async () => {
    const data = new FormData();
    Object.entries({ full_name:'Test',email:'test@example.com',password:'12345678',confirm_password:'87654321',accepted_privacy:'on' }).forEach(([k,v]) => data.set(k,v));
    expect(await signUp(data)).toHaveProperty('error'); expect(client).not.toHaveBeenCalled();
  });
});
