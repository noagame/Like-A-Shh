import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("./actions", () => ({ createAdminCommunityPost: mocks.create }));

import CommunityPostForm from "./CommunityPostForm";

beforeEach(() => { vi.clearAllMocks(); mocks.create.mockResolvedValue({ success: true }); });
afterEach(cleanup);

function fillAndSubmit() {
  fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Tema de la semana" } });
  fireEvent.change(screen.getByLabelText("Mensaje"), { target: { value: "Comparte qué aprendiste en tus clases." } });
  fireEvent.submit(screen.getByRole("form", { name: "Nueva conversación" }));
}

describe("admin community composer", () => {
  it("explains immediate publication and submits a new conversation without a moderation selector", async () => {
    render(<CommunityPostForm />);
    expect(screen.getByText(/la conversación queda aprobada/)).toBeDefined();
    expect(screen.queryByRole("combobox")).toBeNull();
    fillAndSubmit();
    await waitFor(() => expect(mocks.create).toHaveBeenCalledOnce());
    const data = mocks.create.mock.calls[0][0] as FormData;
    expect(data.get("title")).toBe("Tema de la semana");
    expect(data.get("body")).toBe("Comparte qué aprendiste en tus clases.");
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("Conversación publicada"));
    expect((screen.getByLabelText("Título") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("Mensaje") as HTMLTextAreaElement).value).toBe("");
  });

  it("preserves the author's text and displays a validation error when saving fails", async () => {
    mocks.create.mockResolvedValue({ error: "No se pudo crear la conversación." });
    render(<CommunityPostForm />);
    fillAndSubmit();
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("No se pudo crear"));
    expect((screen.getByLabelText("Título") as HTMLInputElement).value).toBe("Tema de la semana");
    expect((screen.getByLabelText("Mensaje") as HTMLTextAreaElement).value).toBe("Comparte qué aprendiste en tus clases.");
  });

  it("shows the saved-post warning and clears the form instead of promoting a duplicate", async () => {
    mocks.create.mockResolvedValue({ success: true, warning: "La conversación se creó y quedó pendiente." });
    render(<CommunityPostForm />);
    fillAndSubmit();
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("quedó pendiente"));
    expect((screen.getByLabelText("Título") as HTMLInputElement).value).toBe("");
  });

  it("retains the draft after a network failure and asks the administrator to check whether it was saved", async () => {
    mocks.create.mockRejectedValue(new Error("Network failure"));
    render(<CommunityPostForm />);
    fillAndSubmit();
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Revisa la lista antes de reintentar"));
    expect((screen.getByLabelText("Título") as HTMLInputElement).value).toBe("Tema de la semana");
  });
});
