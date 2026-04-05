import { motion } from "framer-motion";
import { ArrowRight, Github, Linkedin, Mail, Download } from "lucide-react";
import { lazy, Suspense } from "react";

const HeroBackground = lazy(() => import("./HeroBackground"));

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-end pb-24 md:pb-32 overflow-hidden bg-gradient-hero">
      <Suspense fallback={null}>
        <HeroBackground />
      </Suspense>
      {/* Subtle grid — reduced opacity so it doesn't dominate */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      {/* Single warm ambient glow — NOT two competing orbs */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-primary/[0.04] rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-medium text-muted-foreground tracking-wide mb-6 block">
              Software Engineer · Addis Ababa
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-normal leading-[1.05] mb-8"
          >
            Abel Erduno{" "}
            <span className="text-gradient-primary italic">Hakenso</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed"
          >
            I build robust mobile & web applications and integrate intelligent AI solutions.
            From Flutter to FastAPI — I ship end-to-end.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="flex flex-wrap items-center gap-4 mb-16"
          >
            <a
              href="#projects"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-medium hover:brightness-110 transition-all"
            >
              View My Work
              <ArrowRight size={16} />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 border border-border text-foreground px-6 py-3 rounded-lg text-sm font-medium hover:bg-card transition-colors"
            >
              Get In Touch
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Download size={14} />
              Resume
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center gap-5"
          >
            {[
              { icon: Github, href: "https://github.com/", label: "GitHub" },
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
