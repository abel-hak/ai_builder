import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

describe("Footer", () => {
  it("renders section navigation links", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /^about$/i })).toHaveAttribute("href", "#about");
    expect(screen.getByRole("link", { name: /^projects$/i })).toHaveAttribute("href", "#projects");
    expect(screen.getByRole("link", { name: /^skills$/i })).toHaveAttribute("href", "#skills");
    expect(screen.getByRole("link", { name: /^contact$/i })).toHaveAttribute("href", "#contact");
  });

  it("exposes labeled social links", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      "https://github.com/abel-hak",
    );
    expect(screen.getByRole("link", { name: /email/i })).toHaveAttribute(
      "href",
      "mailto:erddunoabel47@gmail.com",
    );
  });
});
