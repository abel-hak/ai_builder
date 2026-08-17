import { render, screen, fireEvent } from "@testing-library/react";
import AIChatWidget from "@/components/AIChatWidget";

describe("AIChatWidget", () => {
  it("keeps the chat panel closed until the launcher is clicked", () => {
    render(<AIChatWidget />);
    expect(screen.queryByRole("heading", { name: /abel's ai assistant/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /toggle ai chat/i }));
    expect(screen.getByRole("heading", { name: /abel's ai assistant/i })).toBeInTheDocument();
  });

  it("shows the greeting and keeps send disabled while the input is empty", () => {
    render(<AIChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /toggle ai chat/i }));

    expect(
      screen.getByText(/want to know if he has experience with a specific tech stack/i),
    ).toBeInTheDocument();

    const sendButton = document.querySelector('button[type="submit"]');
    expect(sendButton).toBeDisabled();
  });

  it("enables send after the user types a question", () => {
    render(<AIChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /toggle ai chat/i }));

    const input = screen.getByPlaceholderText(/ask about abel's tech stack/i);
    fireEvent.change(input, { target: { value: "Do you use React?" } });

    const sendButton = document.querySelector('button[type="submit"]');
    expect(sendButton).not.toBeDisabled();
  });
});
