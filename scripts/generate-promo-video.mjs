import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imagePath = path.join(root, "public/assets/promo/likeashh-promo-cover.png");
const outputPath = path.join(root, "public/assets/promo/likeashh-promo.webm");

const image = await readFile(imagePath);
const server = createServer((request, response) => {
  if (request.url === "/cover.png") {
    response.writeHead(200, { "Content-Type": "image/png", "Cache-Control": "no-store" });
    response.end(image);
    return;
  }
  response.writeHead(404).end();
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
if (!address || typeof address === "string") throw new Error("No se pudo iniciar el servidor local del video.");

const browser = await chromium.launch({
  headless: true,
  executablePath: "/usr/bin/google-chrome",
  args: ["--use-fake-ui-for-media-stream"],
});

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const downloadPromise = page.waitForEvent("download");

  await page.setContent(`
    <canvas id="promo" width="1280" height="720"></canvas>
    <script>
      const canvas = document.querySelector('#promo');
      const context = canvas.getContext('2d');
      const cover = new Image();
      cover.src = 'http://127.0.0.1:${address.port}/cover.png';
      await new Promise((resolve, reject) => { cover.onload = resolve; cover.onerror = reject; });

      const duration = 6000;
      const startedAt = performance.now();
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8', videoBitsPerSecond: 4000000 });
      const chunks = [];
      recorder.ondataavailable = event => chunks.push(event.data);
      const done = new Promise(resolve => recorder.onstop = resolve);

      function clamp(value) { return Math.max(0, Math.min(1, value)); }
      function draw(now) {
        const elapsed = now - startedAt;
        const progress = clamp(elapsed / duration);
        const fadeIn = clamp(elapsed / 700);
        const fadeOut = clamp((duration - elapsed) / 600);
        const opacity = Math.min(fadeIn, fadeOut);

        context.clearRect(0, 0, 1280, 720);
        context.drawImage(cover, 0, 0, 1280, 720);
        const gradient = context.createLinearGradient(0, 0, 1280, 0);
        gradient.addColorStop(0, 'rgba(0,0,0,.9)');
        gradient.addColorStop(.6, 'rgba(0,0,0,.42)');
        gradient.addColorStop(1, 'rgba(0,0,0,.08)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 1280, 720);

        context.save();
        context.globalAlpha = opacity;
        context.fillStyle = '#D4AF37';
        context.fillRect(92, 185, 86 + progress * 120, 5);
        context.font = '700 72px Georgia, serif';
        context.fillStyle = '#FFFFFF';
        context.fillText('LIKE A SHH', 90, 300);
        context.font = '600 28px Arial, sans-serif';
        context.fillStyle = '#E8C252';
        context.fillText('TU ACTITUD EMPIEZA AQUÍ', 94, 350);
        context.font = '400 24px Arial, sans-serif';
        context.fillStyle = 'rgba(255,255,255,.82)';
        context.fillText('Clases · Movimiento · Comunidad', 94, 406);

        context.strokeStyle = 'rgba(72,202,228,.82)';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(94, 470);
        context.lineTo(500, 470);
        context.stroke();
        context.font = '700 18px Arial, sans-serif';
        context.fillStyle = '#FFFFFF';
        context.fillText('likeashh.cl', 94, 515);
        context.restore();

        if (elapsed < duration) requestAnimationFrame(draw);
        else recorder.stop();
      }

      recorder.start(1000);
      requestAnimationFrame(draw);
      await done;
      const video = new Blob(chunks, { type: 'video/webm' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(video);
      link.download = 'likeashh-promo.webm';
      link.click();
    </script>
  `);

  const download = await downloadPromise;
  await download.saveAs(outputPath);
  console.log(`Video creado: ${outputPath}`);
} finally {
  await browser.close();
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}
