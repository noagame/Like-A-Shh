import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q) {
        return NextResponse.json([]);
    }

    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=cl&q=${q}&limit=5`, {
            headers: {
                // Nominatim exige un User-Agent personalizado, pon tu correo aquí
                'User-Agent': 'MiAppEventos/1.0 (20puro.webeo@gmail.com)'
            }
        });

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Fallo al conectar con el mapa' }, { status: 500 });
    }
}