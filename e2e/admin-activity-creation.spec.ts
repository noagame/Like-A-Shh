import { expect, test } from "@playwright/test";

const admin = {
  email: "admin.demo@likeashh.local",
  password: "DemoAdmin_123!",
};

async function signInAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.waitForTimeout(900);
  await page.locator('input[name="email"]').fill(admin.email);
  await page.locator('input[name="password"]').fill(admin.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/mi-cuenta$/);
}

async function fillSchedule(page: import("@playwright/test").Page, start: string, end: string) {
  await page.locator('input[name="start_time"]').fill(start);
  await page.locator('input[name="end_time"]').fill(end);
}

test("QA: el administrador publica los tres tipos de actividad sin categorías precreadas", async ({ page }) => {
  test.setTimeout(90_000);
  const suffix = Date.now();
  const onlineTitle = `QA online ${suffix}`;
  const presentialTitle = `QA presencial ${suffix}`;
  const eventTitle = `QA evento ${suffix}`;

  await signInAsAdmin(page);
  await page.goto("/admin/eventos");

  await page.getByRole("button", { name: "+ Clase Particular Online" }).click();
  await expect(page.getByRole("heading", { name: "Nueva clase particular online" })).toBeVisible();
  await page.locator('input[name="title"]').fill(onlineTitle);
  await page.locator('input[name="location"]').fill("https://meet.google.com/qa-online");
  await fillSchedule(page, "2026-10-10T10:00", "2026-10-10T11:00");
  await page.getByRole("button", { name: "Publicar clase online" }).click();
  await expect(page.getByRole("cell", { name: onlineTitle })).toBeVisible();

  await page.getByRole("button", { name: "+ Clase Particular Presencial" }).click();
  await expect(page.getByRole("heading", { name: "Nueva clase particular presencial" })).toBeVisible();
  await page.locator('input[name="title"]').fill(presentialTitle);
  await page.locator('input[name="location"]').fill("Estudio QA, Santiago");
  await fillSchedule(page, "2026-10-11T10:00", "2026-10-11T11:00");
  await page.getByRole("button", { name: "Publicar clase presencial" }).click();
  await expect(page.getByRole("cell", { name: presentialTitle })).toBeVisible();

  await page.getByRole("button", { name: "+ Agregar Evento" }).click();
  await expect(page.getByRole("heading", { name: "Agregar evento" })).toBeVisible();
  await page.locator('input[name="title"]').fill(eventTitle);
  await page.locator('input[name="location"]').fill("Sala QA, Santiago");
  await fillSchedule(page, "2026-10-12T10:00", "2026-10-12T11:00");
  await page.getByRole("button", { name: "Crear evento" }).click();
  await expect(page.getByRole("cell", { name: eventTitle })).toBeVisible();
});

test("QA: una galería con imágenes guía al administrador y permite vaciarla y eliminarla", async ({ page }) => {
  const galleryName = `Galería QA ${Date.now()}`;

  await signInAsAdmin(page);
  await page.goto("/admin/galeria");
  await page.locator('input[name="name"]').fill(galleryName);
  await page.getByRole("button", { name: "+ Crear galería" }).click();

  const gallery = page.locator(".group").filter({ hasText: galleryName });
  await expect(gallery).toBeVisible();
  await gallery.getByRole("link").click();
  await page.locator('input[type="file"]').setInputFiles("public/assets/logo/logo_likeashh.jpg");
  await expect(page.locator('img[alt="logo_likeashh.jpg"]')).toBeVisible();

  await page.getByRole("link", { name: "← Todas las galerías" }).click();
  const galleryWithImage = page.locator(".group").filter({ hasText: galleryName });
  await expect(galleryWithImage).toBeVisible();
  await galleryWithImage.getByRole("button", { name: "Eliminar" }).click({ force: true });
  await expect(page.getByRole("alert").filter({ hasText: "Elimina primero las imágenes de la galería." })).toBeVisible();
  await page.getByRole("link", { name: "Abrir galería y administrar imágenes" }).click();
  await expect(page).toHaveURL(/\/admin\/galeria\/[0-9a-f-]{36}$/);

  await page.locator("form").filter({ has: page.locator('input[name="id"]') }).getByRole("button", { name: "Eliminar" }).click({ force: true });
  await expect(page.locator('img[alt="logo_likeashh.jpg"]')).toHaveCount(0);
  await page.getByRole("link", { name: "← Todas las galerías" }).click();
  const emptyGallery = page.locator(".group").filter({ hasText: galleryName });
  await emptyGallery.getByRole("button", { name: "Eliminar" }).click({ force: true });
  await expect(emptyGallery).toHaveCount(0);
});
