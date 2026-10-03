import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import ContactSection from "@/components/ContactSection";
import { supabase } from "@/lib/supabase";

describe("ContactSection", () => {
  it("labels every field so the form is usable with a screen reader", () => {
    render(<ContactSection />);
    expect(screen.getByLabelText(/name/i)).toBeRequired();
    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/subject/i)).toBeRequired();
    expect(screen.getByLabelText(/message/i)).toBeRequired();
  });

  it("sends what the visitor typed to the contact_messages table", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    vi.spyOn(supabase, "from").mockReturnValue({ insert } as never);

    render(<ContactSection />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Dana" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "dana@acme.com" } });
    fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: "New build" } });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: "Can you help?" } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => expect(insert).toHaveBeenCalledTimes(1));
    expect(supabase.from).toHaveBeenCalledWith("contact_messages");
    expect(insert).toHaveBeenCalledWith({
      name: "Dana",
      email: "dana@acme.com",
      subject: "New build",
      message: "Can you help?",
    });
  });

  it("keeps the visitor's text when the submission fails", async () => {
    const insert = vi.fn().mockResolvedValue({ error: { message: "offline" } });
    vi.spyOn(supabase, "from").mockReturnValue({ insert } as never);

    render(<ContactSection />);

    const message = screen.getByLabelText(/message/i);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Dana" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "dana@acme.com" } });
    fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: "New build" } });
    fireEvent.change(message, { target: { value: "Can you help?" } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => expect(insert).toHaveBeenCalled());
    expect(message).toHaveValue("Can you help?");
  });
});
