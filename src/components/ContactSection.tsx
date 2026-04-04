import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Send, Mail, MapPin, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast({ title: "Message sent!", description: "I'll get back to you soon." });
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <section id="contact" className="py-28 relative">
      <div className="max-w-6xl mx-auto px-6 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <span className="text-xs font-medium text-primary tracking-widest uppercase mb-6 block">Contact</span>
          <h2 className="text-4xl md:text-5xl font-normal mb-4 leading-[1.1]">
            Let's <span className="text-gradient-primary italic">work together</span>
          </h2>
          <p className="text-muted-foreground max-w-lg">
            Have a project in mind? Let's discuss how I can help bring your vision to life.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact info — 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {[
              { icon: Mail, label: "Email", value: "erddunoabel47@gmail.com" },
              { icon: MapPin, label: "Location", value: "Addis Ababa, Ethiopia" },
              { icon: Phone, label: "Phone", value: "+251995527848" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/[0.08] flex items-center justify-center shrink-0">
                  <Icon className="text-primary" size={16} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                  <div className="text-sm text-foreground">{value}</div>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Currently open to <span className="text-primary font-medium">full-time roles</span> and
                freelance projects. Fast turnaround, clean code.
              </p>
            </div>
          </motion.div>

          {/* Form — 3 cols */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3 space-y-4 p-6 rounded-lg border border-border bg-card"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Name</label>
                <Input placeholder="Your name" required className="bg-background rounded-lg" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
                <Input type="email" placeholder="you@company.com" required className="bg-background rounded-lg" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Subject</label>
              <Input placeholder="Project inquiry" required className="bg-background rounded-lg" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Message</label>
              <textarea
                placeholder="Tell me about your project..."
                required
                rows={4}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={sending}
              className="w-full bg-primary text-primary-foreground hover:brightness-110 rounded-lg"
            >
              {sending ? "Sending..." : "Send Message"}
              <Send size={14} className="ml-2" />
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
