import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorize';
import { checkLoginRateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  let userId: string;
  try { userId = (await requireAdmin()).user.id; }
  catch { return NextResponse.json({ error: 'No autorizado' }, { status: 403 }); }
  const q = new URL(request.url).searchParams.get('q')?.trim();
  if (!q) return NextResponse.json([]);
  if (q.length < 3 || q.length > 200) return NextResponse.json({ error: 'Consulta inválida' }, { status: 400 });
  try {
    if (!(await checkLoginRateLimit(`maps:${userId}`)).success) return NextResponse.json({ error: 'Intenta más tarde' }, { status: 429 });
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.search = new URLSearchParams({ format: 'json', countrycodes: 'cl', q, limit: '5' }).toString();
    const res = await fetch(url, {
      headers: { 'User-Agent': 'LikeAShh/1.0 (https://www.likeashh.cl)' },
      signal: AbortSignal.timeout(5000), next: { revalidate: 86400 },
    });
    if (!res.ok) return NextResponse.json({ error: 'Servicio de mapas no disponible' }, { status: 502 });
    const data: unknown = await res.json();
    if (!Array.isArray(data)) throw new Error('Invalid response');
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Servicio de mapas no disponible' }, { status: 503 });
  }
}
