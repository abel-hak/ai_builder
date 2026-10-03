import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SiteNav from "@/components/SiteNav";

describe("SiteNav", () => {
  it("product mode links to tools and work", () => {
    render(
      <MemoryRouter>
        <SiteNav mode="product" />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: /forge\.ai home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /^tools$/i })).toHaveAttribute("href", "/#tools");
    expect(screen.getByRole("link", { name: /^work$/i })).toHaveAttribute("href", "/work");
    expect(screen.getAllByRole("link", { name: /try tools/i })[0]).toHaveAttribute("href", "/#tools");
  });

  it("work mode keeps hire and section anchors", () => {
    render(
      <MemoryRouter>
        <SiteNav mode="work" />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: /abel\.dev home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /^about$/i })).toHaveAttribute("href", "#about");
    expect(screen.getByRole("link", { name: /^projects$/i })).toHaveAttribute("href", "#projects");
    expect(screen.getAllByRole("link", { name: /hire me/i })[0]).toHaveAttribute("href", "#contact");
  });

  it("reveals additional links when the mobile menu opens", () => {
    render(
      <MemoryRouter>
        <SiteNav mode="work" />
      </MemoryRouter>,
    );
    const aboutBefore = screen.getAllByRole("link", { name: /^about$/i });
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
    const aboutAfter = screen.getAllByRole("link", { name: /^about$/i });
    expect(aboutAfter.length).toBeGreaterThan(aboutBefore.length);
  });
});
