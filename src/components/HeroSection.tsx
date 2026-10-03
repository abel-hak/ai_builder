import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Github, Linkedin, Mail, Download } from "lucide-react";

const HeroSection = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-screen flex items-end pb-24 md:pb-32 overflow-hidden bg-gradient-hero">
      {/* Soft editorial wash — CSS only, visible in both themes */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border) / 0.35) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.35) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          maskImage: "radial-gradient(ellipse 70% 60% at 30% 70%, black 20%, transparent 75%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
        <div className="max-w-3xl">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="label text-muted-foreground mb-7 block"
          >
            Software Engineer · Addis Ababa
          </motion.p>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.06 }}
            className="font-display text-display-xl mb-8"
          >
            Abel Erduno{" "}
            <span className="text-gradient-primary italic">Hakenso</span>
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.12 }}
            className="text-body-lg text-muted-foreground max-w-xl mb-10"
          >
            I build robust mobile & web applications and integrate intelligent AI solutions.
            From Flutter to FastAPI — I ship end-to-end.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.18 }}
            className="flex flex-wrap items-center gap-4 mb-16"
          >
            <a href="#projects" className="btn-primary">
              View My Work
              <ArrowRight size={16} />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 border border-border text-foreground px-6 py-3 rounded-md text-sm font-medium hover:bg-card transition-colors"
            >
              Get In Touch
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Download size={14} />
              Resume
            </a>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.28 }}
            className="flex items-center gap-5"
          >
            {[
              { icon: Github, href: "https://github.com/abel-hak", label: "GitHub" },
              { icon: Linkedin, href: "https://linkedin.com/in/", label: "LinkedIn" },
              { icon: Mail, href: "mailto:erddunoabel47@gmail.com", label: "Email" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                aria-label={label}
              >
                <Icon size={18} />
              </a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
