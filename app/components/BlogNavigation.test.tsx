import type { ImgHTMLAttributes, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn(() => "/login") }));
vi.mock("next/navigation", () => ({ usePathname }));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: ImgHTMLAttributes<HTMLImageElement>) => <img src={src} alt={alt} />,
}));
vi.mock("@/app/login/actions", () => ({ signOut: vi.fn(async () => {}) }));

import MotionProvider from "./MotionProvider";
import Navbar from "./Navbar";
import PublicNavigation from "./PublicNavigation";
import Footer from "./Footer";
import AdminNavbar from "@/app/admin/NavBar";
import MiCuentaNavbar from "@/app/mi-cuenta/MiCuentaNavbar";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderWithMotion(component: ReactNode) {
  return render(<MotionProvider>{component}</MotionProvider>);
}

function clickWithoutNavigation(link: HTMLElement) {
  link.addEventListener("click", event => event.preventDefault(), { once: true });
  fireEvent.click(link);
}

describe("public blog navigation", () => {
  it.each([
    "/login", "/registro", "/registro/completar-perfil", "/auth/recuperar",
    "/auth/verificar-email", "/terminos", "/privacidad", "/blog", "/blog/mi-articulo",
  ])("offers blog access on %s", pathname => {
    usePathname.mockReturnValue(pathname);
    renderWithMotion(<PublicNavigation />);

    expect(screen.getByRole("link", { name: "Blog" }).getAttribute("href")).toBe("/blog");
  });

  it.each(["/", "/admin", "/admin/blog", "/mi-cuenta", "/mi-cuenta/comunidad"])(
    "avoids duplicate navigation on %s", pathname => {
      usePathname.mockReturnValue(pathname);
      renderWithMotion(<PublicNavigation />);

      expect(screen.queryByRole("navigation")).toBeNull();
    },
  );

  it("keeps home sections reachable from another page", () => {
    renderWithMotion(<Navbar />);

    expect(screen.getByRole("link", { name: "Inicio" }).getAttribute("href")).toBe("/#inicio");
    expect(screen.getByRole("link", { name: "Cursos Online" }).getAttribute("href")).toBe("/#cursos");
  });

  it("includes the blog in the mobile menu and closes it when selected", () => {
    renderWithMotion(<Navbar />);
    const toggle = screen.getByRole("button", { name: "Abrir menú" });
    fireEvent.click(toggle);
    const menu = document.getElementById("public-mobile-menu")!;
    const blog = within(menu).getByRole("link", { name: "Blog" });

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(blog.getAttribute("href")).toBe("/blog");
    clickWithoutNavigation(blog);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("links to the blog from the public footer", () => {
    vi.stubGlobal("IntersectionObserver", class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    renderWithMotion(<Footer />);
    expect(screen.getByRole("link", { name: "Blog" }).getAttribute("href")).toBe("/blog");
  });
});

describe("account blog navigation", () => {
  it("includes the public blog in the student desktop and mobile menus", () => {
    renderWithMotion(<MiCuentaNavbar userName="Alumna" />);
    const desktop = screen.getByRole("navigation", { name: "Navegación de alumnos" });
    expect(within(desktop).getByRole("link", { name: "Blog" }).getAttribute("href")).toBe("/blog");

    const toggle = screen.getByRole("button", { name: "Abrir menú de navegación" });
    fireEvent.click(toggle);
    const mobile = document.getElementById("student-mobile-menu")!;
    const blog = within(mobile).getByRole("link", { name: "Blog" });
    expect(blog.getAttribute("href")).toBe("/blog");
    clickWithoutNavigation(blog);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("distinguishes blog management from the public blog in the administrator menu", () => {
    renderWithMotion(<AdminNavbar />);
    const toggle = screen.getByRole("button", { name: "Abrir menú de administrador" });
    fireEvent.click(toggle);
    const menu = screen.getByRole("navigation", { name: "Navegación de administración" });

    expect(within(menu).getByRole("link", { name: "Administrar blog" }).getAttribute("href")).toBe("/admin/blog");
    const blog = within(menu).getByRole("link", { name: "Blog público" });
    expect(blog.getAttribute("href")).toBe("/blog");
    clickWithoutNavigation(blog);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });
});
