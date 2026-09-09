export async function validateImage(file: File): Promise<string> {
  if (file.size <= 0 || file.size > 5 * 1024 * 1024) throw new Error('La imagen debe pesar entre 1 byte y 5 MB.');
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const png = [137,80,78,71,13,10,26,10].every((b,i) => bytes[i] === b);
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp = String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP';
  if (png && file.type === 'image/png') return 'png';
  if (jpeg && file.type === 'image/jpeg') return 'jpg';
  if (webp && file.type === 'image/webp') return 'webp';
  throw new Error('Usa una imagen PNG, JPEG o WebP válida.');
}
