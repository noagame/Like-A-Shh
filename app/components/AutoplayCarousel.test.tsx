import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import AutoplayCarousel from "./AutoplayCarousel";

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  m: {
    div: ({ children, className }: { children: ReactNode; className: string }) => (
      <div className={className}>{children}</div>
    ),
  },
}));

function cards(count: number) {
  return Array.from({ length: count }, (_, index) => (
    <article key={index} data-testid="class-card">Clase {index + 1}</article>
  ));
}

function visibleClasses() {
  return screen.getAllByTestId("class-card").map((card) => card.textContent);
}

describe("AutoplayCarousel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("innerWidth", 1280);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it.each([1, 2, 4])("keeps %i desktop cards visible without repeated carousel pages", (count) => {
    render(<AutoplayCarousel title="Clases">{cards(count)}</AutoplayCarousel>);

    const expectedClasses = Array.from({ length: count }, (_, index) => `Clase ${index + 1}`);
    expect(visibleClasses()).toEqual(expectedClasses);
    expect(screen.queryByRole("button", { name: "Siguiente" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Ir a página/ })).toBeNull();
    expect(vi.getTimerCount()).toBe(0);

    act(() => vi.advanceTimersByTime(16000));
    expect(visibleClasses()).toEqual(expectedClasses);
  });

  it("shows every class once per desktop cycle without filling the final page with duplicates", () => {
    render(<AutoplayCarousel title="Clases">{cards(9)}</AutoplayCarousel>);

    const visitedClasses = [...visibleClasses()];
    expect(visitedClasses).toEqual(["Clase 1", "Clase 2", "Clase 3", "Clase 4"]);
    expect(screen.getAllByRole("button", { name: /Ir a página/ })).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(visibleClasses()).toEqual(["Clase 5", "Clase 6", "Clase 7", "Clase 8"]);
    visitedClasses.push(...visibleClasses());

    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(visibleClasses()).toEqual(["Clase 9"]);
    visitedClasses.push(...visibleClasses());
    expect(new Set(visitedClasses).size).toBe(9);
    expect(visitedClasses).toHaveLength(9);
    expect(screen.getByText("3 / 3")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(visibleClasses()).toEqual(["Clase 1", "Clase 2", "Clase 3", "Clase 4"]);
    fireEvent.click(screen.getByRole("button", { name: "Anterior" }));
    expect(visibleClasses()).toEqual(["Clase 9"]);
    fireEvent.click(screen.getByRole("button", { name: "Ir a página 2" }));
    expect(visibleClasses()).toEqual(["Clase 5", "Clase 6", "Clase 7", "Clase 8"]);
  });

  it.each([
    { width: 390, firstPage: ["Clase 1"], secondPage: ["Clase 2"], pages: 5 },
    { width: 768, firstPage: ["Clase 1", "Clase 2"], secondPage: ["Clase 3", "Clase 4"], pages: 3 },
  ])("matches pagination to the columns at $width pixels", ({ width, firstPage, secondPage, pages }) => {
    vi.stubGlobal("innerWidth", width);
    render(<AutoplayCarousel title="Clases">{cards(5)}</AutoplayCarousel>);

    expect(visibleClasses()).toEqual(firstPage);
    expect(screen.getAllByRole("button", { name: /Ir a página/ })).toHaveLength(pages);
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(visibleClasses()).toEqual(secondPage);
  });

  it("advances one page per interval and pauses while the mouse is over the carousel", () => {
    const { container } = render(<AutoplayCarousel title="Clases">{cards(5)}</AutoplayCarousel>);

    act(() => vi.advanceTimersByTime(4000));
    expect(visibleClasses()).toEqual(["Clase 5"]);
    fireEvent.mouseEnter(container.firstElementChild!);
    act(() => vi.advanceTimersByTime(12000));
    expect(visibleClasses()).toEqual(["Clase 5"]);
    fireEvent.mouseLeave(container.firstElementChild!);
    act(() => vi.advanceTimersByTime(4000));
    expect(visibleClasses()).toEqual(["Clase 1", "Clase 2", "Clase 3", "Clase 4"]);
  });

  it("preserves swipe navigation and keeps a valid page after resizing", () => {
    vi.stubGlobal("innerWidth", 390);
    render(<AutoplayCarousel title="Clases">{cards(3)}</AutoplayCarousel>);
    const swipeArea = screen.getByTestId("class-card").closest(".touch-pan-y")!;

    fireEvent.touchStart(swipeArea, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(swipeArea, { changedTouches: [{ clientX: 100 }] });
    expect(visibleClasses()).toEqual(["Clase 2"]);
    fireEvent.touchStart(swipeArea, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(swipeArea, { changedTouches: [{ clientX: 200 }] });
    expect(visibleClasses()).toEqual(["Clase 1"]);
    fireEvent.click(screen.getByRole("button", { name: "Ir a página 3" }));

    vi.stubGlobal("innerWidth", 1280);
    fireEvent(window, new Event("resize"));
    expect(visibleClasses()).toEqual(["Clase 1", "Clase 2", "Clase 3"]);
    expect(screen.queryByRole("button", { name: "Siguiente" })).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps a valid page when classes are removed", () => {
    const { rerender } = render(<AutoplayCarousel title="Clases">{cards(9)}</AutoplayCarousel>);
    fireEvent.click(screen.getByRole("button", { name: "Ir a página 3" }));

    rerender(<AutoplayCarousel title="Clases">{cards(2)}</AutoplayCarousel>);
    expect(visibleClasses()).toEqual(["Clase 1", "Clase 2"]);
    expect(screen.queryByRole("button", { name: "Siguiente" })).toBeNull();
  });
});
