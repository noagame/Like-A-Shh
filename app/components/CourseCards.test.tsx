import type { ImgHTMLAttributes } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  // The mock only needs the image semantics, without Next's optimization runtime.
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: ImgHTMLAttributes<HTMLImageElement>) => <img src={src} alt={alt} />,
}));
vi.mock("@/app/components/CourseHeartButton", () => ({ default: () => null }));

import { resolveCourseLink } from "@/lib/course-links";
import { StandardProgramCard } from "./CourseCards";

afterEach(cleanup);

describe("course link labels and destinations", () => {
  it("uses a saved custom label and URL together", () => {
    expect(resolveCourseLink({
      title: "Clases Particulares Online",
      url: "https://example.com/agenda",
      link_label: "  Reservar mi hora  ",
    })).toEqual({ url: "https://example.com/agenda", label: "Reservar mi hora" });
  });

  it.each([
    "Clases Particulares Online",
    "Clases particulares Presenciales",
    "Clase particular presencial",
  ])("defaults to a WhatsApp label for %s", title => {
    expect(resolveCourseLink({ title, url: "#" }).label).toBe("Enlace a WhatsApp");
  });

  it.each(["https://wa.me/56971577711", "https://api.whatsapp.com/send?phone=56971577711"])(
    "recognizes an explicit WhatsApp destination %s", url => {
      expect(resolveCourseLink({ title: "Mi curso", url }).label).toBe("Enlace a WhatsApp");
    },
  );

  it("defaults other courses to a sales link label", () => {
    expect(resolveCourseLink({ title: "Flexibiliza tu actitud", url: "https://hotmart.com/curso" }).label)
      .toBe("Enlace a Hotmart/Web");
  });

  it.each([
    ["Clases Particulares Online", "online"],
    ["Clases Particulares Presenciales", "presencial"],
  ])("includes the correct modality in the fallback message for %s", (title, modality) => {
    const link = resolveCourseLink({ title, url: "#" });
    const destination = new URL(link.url);

    expect(destination.hostname).toBe("wa.me");
    expect(destination.searchParams.get("text")).toContain(modality);
  });

  it.each(["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "//evil.example.com"])(
    "does not expose an unsafe destination %s", url => {
      const destination = resolveCourseLink({ title: "Mi curso", url }).url;
      expect(destination).not.toBe(url);
      expect(destination).not.toMatch(/^(?:javascript:|data:|\/\/)/i);
    },
  );
});

describe("StandardProgramCard", () => {
  const props = {
    title: "Programa personalizado",
    description: "Descripción del programa.",
    imageUrl: "/images/programa.jpg",
    badgeText: "Programa",
  };

  it.each(["https://hotmart.com/mi-curso", "https://example.com/agenda", "/cursos/mi-curso"])(
    "renders the configured destination %s and custom button text", url => {
      render(<StandardProgramCard {...props} url={url} buttonText="Ver mi programa" />);
      const link = screen.getByRole("link", { name: /Ver mi programa/ });

      expect(link.getAttribute("href")).toBe(url);
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    },
  );

  it("does not render an executable link from an invalid course destination", () => {
    render(<StandardProgramCard {...props} url="javascript:alert(1)" buttonText="Consultar" />);

    const links = screen.queryAllByRole("link");
    expect(links.every(link => !link.getAttribute("href")?.match(/^(?:javascript:|data:|\/\/)/i))).toBe(true);
  });

  it("shows an unavailable state for a program without a configured destination", () => {
    render(<StandardProgramCard {...props} url="#" />);

    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("Enlace no disponible").getAttribute("aria-disabled")).toBe("true");
  });

  it("retains the WhatsApp agenda fallback for a private class without a URL", () => {
    render(<StandardProgramCard {...props} title="Clases particulares Online" url="#" />);
    const link = screen.getByRole("link", { name: /Agenda aquí/ });
    const destination = new URL(link.getAttribute("href")!);

    expect(destination.hostname).toBe("wa.me");
    expect(destination.searchParams.get("text")).toContain("online");
  });
});
