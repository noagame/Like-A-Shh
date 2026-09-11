import { expect, test } from "@playwright/test";

const student = {
  email: "alumna.demo@likeashh.local",
  password: "DemoAlumna_123!",
};

const admin = {
  email: "admin.demo@likeashh.local",
  password: "DemoAdmin_123!",
};

async function signIn(page: import("@playwright/test").Page, credentials: typeof student) {
  await page.goto("/login");
  // The form is rendered by the server and becomes interactive after its motion UI hydrates.
  await page.waitForTimeout(900);
  await page.locator('input[name="email"]').fill(credentials.email);
  await page.locator('input[name="password"]').fill(credentials.password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

async function showStep(page: import("@playwright/test").Page, milliseconds = 2_200) {
  await page.waitForTimeout(milliseconds);
}

test("recorrido grabado: catálogo, reserva, calendario, comunidad y moderación", async ({ page }) => {
  test.setTimeout(120_000);
  const postTitle = `Consulta de prueba ${Date.now()}`;

  await page.goto("/");
  await expect(page.getByText("Formación y Clases")).toBeVisible();
  await expect(page.getByText("Movilidad en vivo")).toBeVisible();
  await expect(page.getByText("Pole personalizado")).toBeVisible();
  await showStep(page, 3_500);

  await signIn(page, student);
  await expect(page).toHaveURL(/\/mi-cuenta$/);
  await expect(page.getByText("Alumna Demo")).toBeVisible();
  await showStep(page);

  await page.goto("/mi-cuenta/explorar");
  await expect(page.getByRole("heading", { name: "Explorar" })).toBeVisible();
  await showStep(page);
  const classToReserve = page.locator(".card-gold").filter({ has: page.getByText("Pole personalizado") });
  await expect(classToReserve).toBeVisible();
  const reserveButton = classToReserve.getByRole("button", { name: "Quiero asistir" });
  if (await reserveButton.isVisible()) await reserveButton.click();
  await expect(classToReserve.getByRole("button", { name: "Cancelar asistencia" })).toBeVisible();
  await showStep(page, 2_800);

  await page.goto("/mi-cuenta/clases");
  await expect(page.getByRole("heading", { name: "Mis clases" })).toBeVisible();
  await page.getByRole("button", { name: "Calendario" }).click();
  await expect(page.locator(".likeashh-calendar .fc-col-header-cell").first()).toHaveCSS("background-color", "rgb(23, 23, 23)");
  await expect(page.getByText("Pole personalizado")).toBeVisible();
  await showStep(page, 3_500);

  await page.goto("/mi-cuenta/comunidad");
  await expect(page.getByRole("heading", { name: "Comunidad", exact: true })).toBeVisible();
  await showStep(page);
  await page.getByPlaceholder("Título de tu pregunta o experiencia").fill(postTitle);
  await page.getByPlaceholder("Escribe con respeto y evita publicar datos personales.").fill("Esta publicación generada en el entorno local verifica el flujo de moderación.");
  await showStep(page, 1_500);
  await page.getByRole("button", { name: "Enviar a moderación" }).click();
  await expect(page.getByRole("status")).toContainText("quedó enviada para moderación");
  await showStep(page, 2_800);

  await page.getByRole("button", { name: "Salir" }).click();
  await expect(page).toHaveURL("/");

  await signIn(page, admin);
  await expect(page).toHaveURL(/\/mi-cuenta$/);
  await showStep(page);
  await page.goto("/admin/eventos");
  await expect(page.getByRole("heading", { name: "Eventos y clases" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Workshop Demo de Exotic" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Movilidad en vivo" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Pole personalizado" })).toBeVisible();
  await showStep(page, 3_500);

  await page.goto("/admin/comunidad?status=pending");
  const pendingPost = page.getByRole("article").filter({ hasText: postTitle });
  await expect(pendingPost).toBeVisible();
  await showStep(page);
  await pendingPost.getByRole("button", { name: "Aprobar" }).click();
  await page.reload();
  await page.goto("/admin/comunidad?status=approved");
  await expect(page.getByRole("article").filter({ hasText: postTitle })).toBeVisible();
  await showStep(page, 3_000);

  await page.goto("/blog");
  await expect(page.getByRole("heading", { name: "Blog & bienestar" })).toBeVisible();
  await expect(page.getByText("Bienvenida al Blog Demo")).toBeVisible();
  await showStep(page, 3_500);
});
