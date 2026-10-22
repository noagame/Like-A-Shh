import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import EventImageField from "./EventImageField";

const oldImage = "https://project.supabase.co/storage/v1/object/public/eventos/flyers/old.png";
afterEach(cleanup);

describe("event image controls", () => {
  it("previews the current image and allows removal to be cancelled", () => {
    render(<EventImageField imageUrl={oldImage} />);
    expect(screen.getByRole("img", { name: "Imagen actual del evento" }).getAttribute("src")).toBe(oldImage);
    const remove = screen.getByRole("checkbox", { name: "Quitar imagen actual al guardar" }) as HTMLInputElement;
    fireEvent.click(remove);
    expect(remove.checked).toBe(true);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("La imagen se quitará al guardar los cambios.")).toBeTruthy();
    fireEvent.click(remove);
    expect(screen.getByRole("img", { name: "Imagen actual del evento" })).toBeTruthy();
  });

  it("previews a selected replacement, clears removal, and lets the user cancel it", async () => {
    render(<EventImageField imageUrl={oldImage} />);
    const remove = screen.getByRole("checkbox", { name: "Quitar imagen actual al guardar" }) as HTMLInputElement;
    fireEvent.click(remove);
    const input = screen.getByLabelText("Reemplazar imagen") as HTMLInputElement;
    const file = new File(["png-bytes"], "replacement.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(screen.getByRole("img", { name: "Vista previa de la nueva imagen" }).getAttribute("src")).toMatch(/^data:image\/png/));
    expect(remove.checked).toBe(false);
    expect(input.files?.[0]).toBe(file);
    fireEvent.click(screen.getByRole("button", { name: "Cancelar archivo seleccionado" }));
    expect(input.value).toBe("");
    expect(screen.getByRole("img", { name: "Imagen actual del evento" })).toBeTruthy();
  });

  it("offers upload when the event has no image and rejects unsupported files", () => {
    render(<EventImageField imageUrl={null} />);
    expect(screen.queryByRole("checkbox")).toBeNull();
    const input = screen.getByLabelText("Subir imagen");
    fireEvent.change(input, { target: { files: [new File(["gif-bytes"], "bad.gif", { type: "image/gif" })] } });
    expect(screen.getByRole("alert").textContent).toContain("hasta 5 MB");
    expect(screen.queryByRole("img")).toBeNull();
  });
});
