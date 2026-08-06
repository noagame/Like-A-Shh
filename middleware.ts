import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Si faltan las variables de entorno (typo, olvido al configurar Vercel,
  // etc.), esto NO debe tumbar el sitio entero con un 500 para todos los
  // visitantes. Se deja pasar la request sin protección de rutas, pero se
  // registra el error fuerte en los logs de Vercel para que se note rápido.
  //
  // Trade-off consciente: por unos minutos /admin y /mi-cuenta podrían
  // quedar sin el filtro del middleware si esto llega a pasar — pero cada
  // página igual vuelve a validar el usuario del lado del servidor
  // (ver AdminLayout y MiCuentaLayout), así que no se expone data real,
  // solo se pierde el redirect automático a /login.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    console.error(
      "[middleware] Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. " +
        "Revisa las variables de entorno en Vercel (Settings → Environment Variables) y redeploya."
    );
    return response;
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    if (!user && (pathname.startsWith("/admin") || pathname.startsWith("/"))) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch (err) {
    console.error("[middleware] Error inesperado, se deja pasar la request:", err);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/).*)"],
};