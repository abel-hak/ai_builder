import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "@/components/Navbar";

describe("Navbar", () => {
  it("renders the primary section links", () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /^about$/i })).toHaveAttribute("href", "#about");
    expect(screen.getByRole("link", { name: /^projects$/i })).toHaveAttribute("href", "#projects");
    expect(screen.getByRole("link", { name: /^skills$/i })).toHaveAttribute("href", "#skills");
    expect(screen.getByRole("link", { name: /^blog$/i })).toHaveAttribute("href", "/blog");
    expect(screen.getByRole("link", { name: /^contact$/i })).toHaveAttribute("href", "#contact");
  });

  it("renders a Hire Me call to action", () => {
    render(<Navbar />);
    const hireLinks = screen.getAllByRole("link", { name: /hire me/i });
    expect(hireLinks.length).toBeGreaterThan(0);
    expect(hireLinks[0]).toHaveAttribute("href", "#contact");
  });

  it("reveals additional nav links when the mobile menu opens", () => {
    render(<Navbar />);
    const aboutBefore = screen.getAllByRole("link", { name: /^about$/i });
    const mobileToggle = screen.getAllByRole("button").find((button) => !button.getAttribute("aria-label"));
    expect(mobileToggle).toBeDefined();
    fireEvent.click(mobileToggle!);
    const aboutAfter = screen.getAllByRole("link", { name: /^about$/i });
    expect(aboutAfter.length).toBeGreaterThan(aboutBefore.length);
  });
});
