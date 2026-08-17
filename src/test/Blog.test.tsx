import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Blog, { blogPosts } from "@/pages/Blog";

describe("Blog", () => {
  it("lists every published post with a link to its slug", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>,
    );

    expect(blogPosts.length).toBeGreaterThan(0);

    for (const post of blogPosts) {
      const title = screen.getByRole("heading", { name: post.title });
      expect(title).toBeInTheDocument();
      expect(title.closest("a")).toHaveAttribute("href", `/blog/${post.slug}`);
    }
  });

  it("links back to the portfolio home page", () => {
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /back to portfolio/i })).toHaveAttribute("href", "/");
  });
});
