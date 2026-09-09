// @vitest-environment node
// Regression tests exercise actual actions; every assertion now requires safe behavior.
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ client: vi.fn(), limit: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.client }));
vi.mock('@/lib/rate-limit', () => ({ checkLoginRateLimit: mocks.limit }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/headers', () => ({ headers: async () => new Headers({ 'x-forwarded-for': '192.0.2.1' }) }));
vi.mock('next/navigation', () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } }));
import { signIn, resetPassword, signUp } from '@/app/login/actions';
import { updateUser } from '@/app/admin/usuarios/actions';
import { createGallery, deleteMedia, uploadMedia } from '@/app/admin/medios/actions';
import { eliminarCuentaTotal, anonimizarDatos, actualizarPerfil } from '@/app/mi-cuenta/perfil/actions';
import { attendEvent } from '@/app/mi-cuenta/actions';
import { GET } from '@/app/api/maps/route';
const id = '10000000-0000-4000-8000-000000000001';
function form(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}
function database(role = 'user') {
  const result = { data: null, error: null };
  const query = {
    select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(), delete: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { role }, error: null }),
    maybeSingle: vi.fn().mockResolvedValue(result),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve),
  };
  const storage = { remove: vi.fn().mockResolvedValue({ error: null }), upload: vi.fn().mockResolvedValue({ error: null }), getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/a.png' } })) };
  const client = {
    from: vi.fn(() => query), rpc: vi.fn().mockResolvedValue({ error: null }),
    storage: { from: vi.fn(() => storage) },
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id, email: 'audit@example.com' } }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    },
  };
  mocks.client.mockResolvedValue(client);
  return { client, query, storage };
}
beforeEach(() => { vi.clearAllMocks(); mocks.limit.mockResolvedValue({ success: true }); vi.stubEnv('NEXT_PUBLIC_SITE_URL','https://example.com'); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
describe('Security regression tests', () => {
  it('H01 normal user cannot promote itself', async () => {
    const { client, query } = database();
    await expect(updateUser(id, form({ name: 'Test', role: 'admin' }))).rejects.toThrow('No autorizado');
    expect(query.update).not.toHaveBeenCalled(); expect(client.rpc).not.toHaveBeenCalled();
  });
  it('H01 anonymous user cannot create gallery', async () => {
    const { client, query } = database();
    client.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(createGallery(form({ name: 'Test' }))).rejects.toThrow('No autorizado');
    expect(query.insert).not.toHaveBeenCalled();
  });
  it('H01 unavailable role lookup denies mutation', async () => {
    const { query } = database('admin');
    query.single.mockResolvedValue({ data: null, error: { message: 'offline' } });
    await expect(createGallery(form({ name: 'Test' }))).rejects.toThrow('No autorizado');
    expect(query.insert).not.toHaveBeenCalled();
  });
  it('H01 admin can create gallery', async () => {
    const { query } = database('admin');
    expect(await createGallery(form({ name: 'Test', description: 'Audit' }))).toEqual({ success: true });
    expect(query.insert).toHaveBeenCalled();
  });
  it('H02 production limiter failure prevents login', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { client } = database();
    mocks.limit.mockRejectedValue(new Error('Redis unavailable'));
    expect(await signIn(form({ email: 'audit@example.com', password: 'test-password' }))).toHaveProperty('error');
    expect(client.auth.signInWithPassword).not.toHaveBeenCalled();
  });
  it('H02 denied account limit prevents login', async () => {
    const { client } = database();
    mocks.limit.mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false });
    await signIn(form({ email: 'audit@example.com', password: 'test-password' }));
    expect(client.auth.signInWithPassword).not.toHaveBeenCalled();
  });
  it('H02 allowed login normalizes email and redirects', async () => {
    const { client } = database();
    await expect(signIn(form({ email: ' AUDIT@example.com ', password: 'test-password' }))).rejects.toThrow('REDIRECT:/mi-cuenta');
    expect(client.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'audit@example.com', password: 'test-password' });
  });
  it('H03 failed deletion does not sign out or return success', async () => {
    const { client } = database();
    client.rpc.mockResolvedValue({ error: { message: 'permission denied' } });
    expect(await eliminarCuentaTotal(form({ password: 'test-password' }))).toHaveProperty('error');
    expect(client.auth.signOut).not.toHaveBeenCalled();
  });
  it('H03 wrong password prevents deletion RPC', async () => {
    const { client } = database(); client.auth.signInWithPassword.mockResolvedValue({ error: { message: 'invalid' } });
    expect(await eliminarCuentaTotal(form({ password: 'wrong' }))).toHaveProperty('error');
    expect(client.rpc).not.toHaveBeenCalled();
  });
  it('H03 successful transaction signs out and redirects', async () => {
    const { client } = database();
    await expect(eliminarCuentaTotal(form({ password: 'test-password' }))).rejects.toThrow('REDIRECT:/?cuenta_eliminada=1');
    expect(client.rpc).toHaveBeenCalledWith('delete_account', { target_user_id: id });
    expect(client.auth.signOut).toHaveBeenCalled();
  });
  it('H04 hiding profile handles transaction failure', async () => {
    const { client } = database(); client.rpc.mockResolvedValue({ error: { message: 'offline' } });
    expect(await anonimizarDatos()).toHaveProperty('error');
  });
  it('H05 recovery uses code-exchange callback and password destination', async () => {
    const { client } = database();
    expect(await resetPassword(form({ email: 'audit@example.com' }))).toEqual({ success: true });
    expect(client.auth.resetPasswordForEmail).toHaveBeenCalledWith('audit@example.com', { redirectTo: 'https://example.com/auth/callback?next=/auth/actualizar-password' });
  });
  it.each(['full','missing','past','draft'])('H06 RPC rejects %s event without fallback write', async () => {
    const { client, query } = database(); client.rpc.mockResolvedValue({ error: { message: 'not available' } });
    expect(await attendEvent(id)).toHaveProperty('error');
    expect(query.insert).not.toHaveBeenCalled(); expect(query.update).not.toHaveBeenCalled();
  });
  it('H06 reservation succeeds only via transaction', async () => {
    const { client } = database();
    expect(await attendEvent(id)).toEqual({ error: null, success: true });
    expect(client.rpc).toHaveBeenCalledWith('reserve_event', { target_event_id: id });
  });
  it('H06 invalid identifier never reaches RPC', async () => {
    const { client } = database(); await attendEvent('invalid'); expect(client.rpc).not.toHaveBeenCalled();
  });
  it.each(['2099-01-01','2020-01-01','2000-02-31','not-a-date'])('H07 rejects birth date %s', async birth => {
    const { query } = database();
    expect(await actualizarPerfil(form({ full_name: 'Audit User', birth_date: birth }))).toHaveProperty('error');
    expect(query.update).not.toHaveBeenCalled();
  });
  it('H07 editing valid profile resets hidden flag', async () => {
    const { query } = database();
    expect(await actualizarPerfil(form({ full_name: 'Audit User', birth_date: '1990-01-01' }))).toEqual({ success: true });
    expect(query.update).toHaveBeenCalledWith(expect.objectContaining({ is_anonymized: false }));
  });
  it('H08 map query preserves special characters inside q', async () => {
    database('admin');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] }); vi.stubGlobal('fetch', fetchMock);
    const q = 'Santiago&countrycodes=us#ñ';
    expect((await GET(new Request('https://example.com/api/maps?q='+encodeURIComponent(q)))).status).toBe(200);
    const sentUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(sentUrl.searchParams.getAll('countrycodes')).toEqual(['cl']); expect(sentUrl.searchParams.get('q')).toBe(q);
  });
  it('H08 non-admin cannot invoke upstream search', async () => {
    database(); const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock);
    expect((await GET(new Request('https://example.com/api/maps?q=Santiago'))).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('H08 upstream HTTP error is not success', async () => {
    database('admin'); vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    expect((await GET(new Request('https://example.com/api/maps?q=Santiago'))).status).toBe(502);
  });
  it('H11 media deletion uses stored path, not caller path', async () => {
    const { query, storage } = database('admin');
    query.single.mockResolvedValueOnce({ data: { role:'admin' }, error:null }).mockResolvedValueOnce({ data: { storage_path:'safe/image.png' }, error:null });
    await deleteMedia(form({ id, storage_path: 'another/image.png' }));
    expect(storage.remove).toHaveBeenCalledWith(['safe/image.png']);
  });
  it('H11 storage failure prevents metadata deletion', async () => {
    const { query, storage } = database('admin');
    query.single.mockResolvedValueOnce({ data: { role:'admin' }, error:null }).mockResolvedValueOnce({ data: { storage_path:'safe/image.png' }, error:null });
    storage.remove.mockResolvedValue({ error: { message:'offline' } });
    await expect(deleteMedia(form({ id }))).rejects.toThrow('No se pudo retirar');
    expect(query.delete).not.toHaveBeenCalled();
  });
  it('H11 invalid image never reaches Storage', async () => {
    const { storage } = database('admin'); const data = new FormData(); data.set('file',new File(['<svg/>'],'evil.png',{ type:'image/png' }));
    await expect(uploadMedia(id,data)).rejects.toThrow('válida'); expect(storage.upload).not.toHaveBeenCalled();
  });
  it('H11 signup forwards consent to transactional Auth trigger', async () => {
    const { client, query } = database();
    await expect(signUp(form({ full_name:'Test User',email:'audit@example.com',password:'test-password',confirm_password:'test-password',accepted_privacy:'on' }))).rejects.toThrow('REDIRECT:');
    expect(client.auth.signUp).toHaveBeenCalledWith(expect.objectContaining({ options:expect.objectContaining({ data:expect.objectContaining({accepted_privacy:true,privacy_policy_version:'privacidad-v3-2026-09'}) }) }));
    expect(query.insert).not.toHaveBeenCalled();
  });
});
