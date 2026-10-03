import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SiteFooter from "@/components/SiteFooter";

describe("SiteFooter", () => {
  it("product mode exposes tools and work navigation", () => {
    render(
      <MemoryRouter>
        <SiteFooter mode="product" />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: /^tools$/i })).toHaveAttribute("href", "/#tools");
    expect(screen.getByRole("link", { name: /^work$/i })).toHaveAttribute("href", "/work");
    expect(screen.getByRole("link", { name: /view builder profile/i })).toHaveAttribute("href", "/work");
  });

  it("exposes labeled social links", () => {
    render(
      <MemoryRouter>
        <SiteFooter mode="product" />
      </MemoryRouter>,
    );
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
