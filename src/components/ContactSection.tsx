import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const ContactSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const reduceMotion = useReducedMotion();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
    });
    setSending(false);

    if (error) {
      toast({
        title: "Message not sent",
        description: "Something went wrong. Please email erddunoabel47@gmail.com directly.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Message sent!", description: "I'll get back to you soon." });
    form.reset();
  };

  return (
    <section id="contact" className="pt-28 pb-32 relative bg-card/40 border-t border-border">
      <div className="max-w-6xl mx-auto px-6 relative z-10" ref={ref}>
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5"
          >
            <span className="label text-primary mb-5 block">Contact</span>
            <h2 className="font-display text-display mb-6">
              Tell me what you're building.
            </h2>
            <p className="text-body text-muted-foreground mb-10 max-w-md">
              Open to full-time roles and freelance projects. Prefer email if the form is down.
            </p>

            <dl className="space-y-5">
              <div>
                <dt className="label text-muted-foreground mb-1">Email</dt>
                <dd>
                  <a
                    href="mailto:erddunoabel47@gmail.com"
                    className="text-sm text-foreground hover:text-primary transition-colors"
                  >
                    erddunoabel47@gmail.com
                  </a>
                </dd>
              </div>
              <div>
                <dt className="label text-muted-foreground mb-1">Location</dt>
                <dd className="text-sm text-foreground">Addis Ababa, Ethiopia</dd>
              </div>
              <div>
                <dt className="label text-muted-foreground mb-1">Phone</dt>
                <dd className="text-sm text-foreground">+251 995 527 848</dd>
              </div>
            </dl>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.1 }}
            className="lg:col-span-7 space-y-4 p-6 md:p-8 rounded-xl border border-border bg-background"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="text-xs text-muted-foreground mb-1.5 block">
                  Name
                </label>
                <Input
                  id="contact-name"
                  name="name"
                  placeholder="Your name"
                  required
                  className="bg-card rounded-md"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="text-xs text-muted-foreground mb-1.5 block">
                  Email
                </label>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  required
                  className="bg-card rounded-md"
                />
              </div>
            </div>
            <div>
              <label htmlFor="contact-subject" className="text-xs text-muted-foreground mb-1.5 block">
                Subject
              </label>
              <Input
                id="contact-subject"
                name="subject"
                placeholder="Project inquiry"
                required
                className="bg-card rounded-md"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="text-xs text-muted-foreground mb-1.5 block">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                placeholder="Tell me about your project..."
                required
                rows={4}
                className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>
            <button type="submit" disabled={sending} className="btn-primary w-full">
              {sending ? "Sending..." : "Send Message"}
              <Send size={14} />
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
