import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const actions = vi.hoisted(() => ({ save: vi.fn(), remove: vi.fn() }));
vi.mock("./actions", () => ({ saveBlogPost: actions.save, deleteBlogPost: actions.remove }));

import BlogEditor from "./BlogEditor";

const post = {
  id: "10000000-0000-4000-8000-000000000001",
  title: "Artículo original",
  excerpt: "Resumen del artículo para mostrar en las tarjetas del blog.",
  content: "Contenido completo del artículo para que los alumnos puedan leer todas las novedades.",
  cover_image_url: "https://example.com/cover.png",
  status: "published",
};

beforeEach(() => {
  vi.clearAllMocks();
  actions.save.mockResolvedValue({ success: true });
  actions.remove.mockResolvedValue({ success: true });
  vi.spyOn(window, "confirm").mockReturnValue(true);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("blog admin editor", () => {
  it("saves the current id and edited fields without conflicting React form props", async () => {
    const consoleError = vi.spyOn(console, "error");
    render(<BlogEditor post={post} />);
    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Título actualizado" } });
    fireEvent.change(screen.getByLabelText("Estado"), { target: { value: "draft" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar artículo" }));

    await waitFor(() => expect(actions.save).toHaveBeenCalledTimes(1));
    const [data] = actions.save.mock.calls[0] as [FormData];
    expect(data.getAll("id")).toEqual([post.id]);
    expect(data.get("title")).toBe("Título actualizado");
    expect(data.get("status")).toBe("draft");
    expect(data.get("content")).toBe(post.content);
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("Artículo guardado"));
    expect((screen.getByLabelText("Título") as HTMLInputElement).value).toBe("Título actualizado");
    expect(actions.remove).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("deletes using the hidden id even when required fields are empty, without React warnings", async () => {
    const consoleError = vi.spyOn(console, "error");
    render(<BlogEditor post={post} />);
    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Contenido del artículo"), { target: { value: "" } });
    const button = screen.getByRole("button", { name: "Eliminar" }) as HTMLButtonElement;
    expect(button.formNoValidate).toBe(true);
    expect(button.getAttribute("name")).toBeNull();
    expect(button.form!.checkValidity()).toBe(false);
    // JSDOM does not implement formNoValidate when a submit button is clicked.
    // Dispatching a real submit with this submitter also exercises React's formAction routing.
    fireEvent(button.form!, new SubmitEvent("submit", { bubbles: true, cancelable: true, submitter: button }));

    await waitFor(() => expect(actions.remove).toHaveBeenCalledTimes(1));
    const [data] = actions.remove.mock.calls[0] as [FormData];
    expect(data.getAll("id")).toEqual([post.id]);
    expect(actions.save).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Artículo eliminado."));
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("does not delete when confirmation is cancelled", async () => {
    vi.mocked(window.confirm).mockReturnValue(false);
    render(<BlogEditor post={post} />);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Eliminar" })));
    expect(window.confirm).toHaveBeenCalledWith("¿Eliminar este artículo?");
    expect(actions.remove).not.toHaveBeenCalled();
    expect(actions.save).not.toHaveBeenCalled();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("retains edits and allows retrying when saving fails", async () => {
    actions.save.mockRejectedValueOnce(new Error("Offline"));
    render(<BlogEditor post={post} />);
    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Título pendiente" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar artículo" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("No se pudo guardar"));
    expect((screen.getByLabelText("Título") as HTMLInputElement).value).toBe("Título pendiente");
    expect(screen.getByRole("button", { name: "Guardar artículo" }).hasAttribute("disabled")).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Guardar artículo" }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("Artículo guardado"));
    expect(actions.save).toHaveBeenCalledTimes(2);
  });

  it("refreshes fields and feedback when selecting a different article or creating a new one", async () => {
    actions.save.mockResolvedValueOnce({ error: "No se pudo guardar este artículo." });
    const view = render(<BlogEditor post={post} />);
    fireEvent.click(screen.getByRole("button", { name: "Guardar artículo" }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeDefined());
    const nextPost = { ...post, id: "10000000-0000-4000-8000-000000000002", title: "Segundo artículo", content: "Contenido distinto y completo para el segundo artículo publicado.", status: "archived" };
    view.rerender(<BlogEditor post={nextPost} />);
    expect((screen.getByLabelText("Título") as HTMLInputElement).value).toBe(nextPost.title);
    expect((screen.getByLabelText("Contenido del artículo") as HTMLTextAreaElement).value).toBe(nextPost.content);
    expect((screen.getByLabelText("Estado") as HTMLSelectElement).value).toBe("archived");
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Guardar artículo" }));
    await waitFor(() => expect(actions.save).toHaveBeenCalledTimes(2));
    expect((actions.save.mock.calls[1][0] as FormData).get("id")).toBe(nextPost.id);
    await waitFor(() => expect(screen.getByRole("status")).toBeDefined());
    view.rerender(<BlogEditor />);
    expect((screen.getByLabelText("Título") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("Estado") as HTMLSelectElement).value).toBe("draft");
    expect(screen.queryByRole("button", { name: "Eliminar" })).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("resets a successfully created article and prevents duplicate operations while saving", async () => {
    let finishSave!: (value: { success: true }) => void;
    actions.save.mockReturnValue(new Promise((resolve) => { finishSave = resolve; }));
    render(<BlogEditor />);
    fireEvent.change(screen.getByLabelText("Título"), { target: { value: post.title } });
    fireEvent.change(screen.getByLabelText("Resumen para tarjetas"), { target: { value: post.excerpt } });
    fireEvent.change(screen.getByLabelText("Contenido del artículo"), { target: { value: post.content } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar artículo" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Guardando…" }).hasAttribute("disabled")).toBe(true));
    expect((actions.save.mock.calls[0][0] as FormData).get("id")).toBe("");
    await act(async () => finishSave({ success: true }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("Artículo guardado"));
    expect((screen.getByLabelText("Título") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("Contenido del artículo") as HTMLTextAreaElement).value).toBe("");
  });
});
