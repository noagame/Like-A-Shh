import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const actions = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn() }));
vi.mock("./actions", () => ({ createCourse: actions.create, updateCourse: actions.update }));

import CourseModal from "./Course.Modal";

const course = {
  id: "10000000-0000-4000-8000-000000000001",
  title: "Clases Particulares Presenciales",
  description: "Clases a tu medida.",
  url: "https://wa.me/56971577711?text=Hola",
  link_label: "Agendar presencial",
  status: "draft",
};

beforeEach(() => {
  vi.clearAllMocks();
  actions.create.mockResolvedValue(undefined);
  actions.update.mockResolvedValue(undefined);
});
afterEach(cleanup);

describe("course admin editor", () => {
  it("offers an editable destination, link label and status for a new course", () => {
    render(<CourseModal />);
    fireEvent.click(screen.getByRole("button", { name: /Nuevo Curso/ }));

    expect(screen.getByRole("dialog", { name: "Crear Nuevo Curso" })).toBeDefined();
    expect(screen.getByLabelText(/URL de destino/).getAttribute("name")).toBe("url");
    expect(screen.getByLabelText(/Texto del enlace/).getAttribute("name")).toBe("link_label");
    expect((screen.getByLabelText("Estado") as HTMLSelectElement).value).toBe("published");
  });

  it("opens existing values and saves a custom link without creating a second course", async () => {
    render(<CourseModal course={course} />);
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));

    const destination = screen.getByLabelText(/URL de destino/) as HTMLInputElement;
    const label = screen.getByLabelText(/Texto del enlace/) as HTMLInputElement;
    expect(destination.value).toBe(course.url);
    expect(label.value).toBe(course.link_label);
    expect((screen.getByLabelText("Estado") as HTMLSelectElement).value).toBe("draft");

    fireEvent.change(destination, { target: { value: "/agenda/presencial" } });
    expect(destination.checkValidity()).toBe(true);
    fireEvent.change(label, { target: { value: "Reservar ahora" } });
    fireEvent.change(screen.getByLabelText("Estado"), { target: { value: "published" } });
    fireEvent.submit(screen.getByRole("button", { name: "Guardar cambios" }).closest("form")!);

    await waitFor(() => expect(actions.update).toHaveBeenCalledTimes(1));
    const [id, data] = actions.update.mock.calls[0] as [string, FormData];
    expect(id).toBe(course.id);
    expect(data.get("url")).toBe("/agenda/presencial");
    expect(data.get("link_label")).toBe("Reservar ahora");
    expect(data.get("status")).toBe("published");
    expect(actions.create).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("retains the entered label and permits retrying after a failed save", async () => {
    actions.update.mockRejectedValue(new Error("Offline"));
    render(<CourseModal course={course} />);
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.change(screen.getByLabelText(/Texto del enlace/), { target: { value: "Mi texto nuevo" } });
    fireEvent.submit(screen.getByRole("button", { name: "Guardar cambios" }).closest("form")!);

    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("No se pudo guardar"));
    expect((screen.getByLabelText(/Texto del enlace/) as HTMLInputElement).value).toBe("Mi texto nuevo");
    expect(screen.getByRole("button", { name: "Guardar cambios" }).hasAttribute("disabled")).toBe(false);
  });
});
