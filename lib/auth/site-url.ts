export function getSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL;
  if (!value) {
    if (process.env.NODE_ENV === 'production') throw new Error('Falta configurar NEXT_PUBLIC_SITE_URL.');
    return 'http://localhost:3000';
  }
  const url = new URL(value);
  if (url.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && url.protocol === 'http:')) {
    throw new Error('La URL del sitio debe usar HTTPS.');
  }
  return url.origin;
}
