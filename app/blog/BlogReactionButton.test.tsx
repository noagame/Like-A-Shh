import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const action = vi.hoisted(() => vi.fn());
vi.mock("./actions", () => ({ setBlogReaction: action }));
import BlogReactionButton from "./BlogReactionButton";

const props = {
  postId: "10000000-0000-4000-8000-000000000001",
  initialLiked: false,
  initialCount: 4,
  loggedIn: true,
  canReact: true,
  available: true,
};

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

describe("blog reactions", () => {
  it("shows a disabled reaction and a sign-in link for public readers", () => {
    render(<BlogReactionButton {...props} loggedIn={false} canReact={false} />);
    const button = screen.getByRole("button", { name: "Dar Me gusta" });
    expect(button.hasAttribute("disabled")).toBe(true);
    fireEvent.click(button);
    expect(action).not.toHaveBeenCalled();
    expect(screen.getByRole("link", { name: "Inicia sesión como alumno" }).getAttribute("href")).toBe("/login");
  });

  it("does not let administrators or other roles react", () => {
    render(<BlogReactionButton {...props} canReact={false} />);
    expect(screen.getByText("Solo los alumnos pueden reaccionar al blog.")).toBeDefined();
    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(true);
  });

  it("does not offer a writable control before the migration is applied", () => {
    render(<BlogReactionButton {...props} available={false} />);
    expect(screen.getByText("Las reacciones estarán disponibles pronto.")).toBeDefined();
    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(true);
    expect(screen.queryByText("4")).toBeNull();
  });

  it("lets a student add and remove a like using the authoritative totals", async () => {
    action.mockResolvedValueOnce({ success: true, liked: true, likesCount: 8 })
      .mockResolvedValueOnce({ success: true, liked: false, likesCount: 7 });
    render(<BlogReactionButton {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Dar Me gusta" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Quitar Me gusta" }).getAttribute("aria-pressed")).toBe("true"));
    expect(screen.getByText("8")).toBeDefined();
    expect(action).toHaveBeenNthCalledWith(1, props.postId, true);
    fireEvent.click(screen.getByRole("button", { name: "Quitar Me gusta" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Dar Me gusta" }).getAttribute("aria-pressed")).toBe("false"));
    expect(screen.getByText("7")).toBeDefined();
    expect(action).toHaveBeenNthCalledWith(2, props.postId, false);
  });

  it("preserves the previous state on failure and allows retrying", async () => {
    action.mockResolvedValueOnce({ error: "No se pudo guardar." });
    render(<BlogReactionButton {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Dar Me gusta" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("No se pudo guardar."));
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByText("4")).toBeDefined();
    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(false);
  });

  it("reports a connection failure without changing the total", async () => {
    action.mockRejectedValueOnce(new Error("offline"));
    render(<BlogReactionButton {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Dar Me gusta" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Intenta nuevamente"));
    expect(screen.getByText("4")).toBeDefined();
  });
});
