export function parsePurchaseUrl(value: unknown): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("El enlace de compra debe ser una URL HTTPS completa.");
  }
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error("El enlace de compra debe usar HTTPS y no incluir credenciales.");
  }
  return url.href;
}

function isMapsUrl(url: URL): boolean {
  if (url.protocol !== "https:" || url.username || url.password) return false;
  if (url.port && url.port !== "443") return false;
  if (url.hostname === "maps.app.goo.gl") return true;
  if (url.hostname === "goo.gl") return url.pathname.startsWith("/maps/");
  if (url.hostname === "maps.google.com") return true;
  const hosts = ["google.com", "www.google.com", "google.cl", "www.google.cl"];
  return hosts.includes(url.hostname) &&
    (url.pathname === "/maps" || url.pathname.startsWith("/maps/"));
}

export function parseEventLocation(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  // Aceptar direcciones; si parece un enlace, validar su destino.
  const looksLikeUrl = /^[a-z][a-z0-9+.-]*:/i.test(raw) ||
    /^(?:www\.|maps\.|google\.|goo\.gl|\/\/)/i.test(raw);
  if (!looksLikeUrl) return raw;

  try {
    const url = new URL(raw);
    if (isMapsUrl(url)) return url.href;
  } catch {
    // El error legible se genera abajo.
  }
  throw new Error("Usa una dirección o un enlace HTTPS válido de Google Maps.");
}

export function getLocationHref(value: string | null): string | null {
  if (!value?.trim()) return null;
  try {
    const location = parseEventLocation(value);
    if (location.startsWith("https://")) return location;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  } catch {
    // Los datos antiguos inválidos no se convierten en enlaces activos.
    return null;
  }
}
