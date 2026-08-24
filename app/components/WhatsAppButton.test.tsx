import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import WhatsAppButton from "./WhatsAppButton";
import MotionProvider from "./MotionProvider";

describe("WhatsAppButton Component", () => {
  it("renders correctly with WhatsApp link and access attributes", () => {
    render(
      <MotionProvider>
        <WhatsAppButton />
      </MotionProvider>
    );

    const buttonLink = screen.getByRole("link", { name: /Contactar por WhatsApp/i }) as HTMLAnchorElement;

    expect(buttonLink).toBeDefined();
    expect(buttonLink.getAttribute("id")).toBe("whatsapp-float-btn");
    expect(buttonLink.getAttribute("target")).toBe("_blank");
    expect(buttonLink.getAttribute("rel")).toBe("noopener noreferrer");
    expect(buttonLink.getAttribute("href")).toContain("wa.me/56971577711");
  });
});
