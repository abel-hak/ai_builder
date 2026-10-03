import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

type NavMode = "product" | "work";

const productLinks = [
  { label: "Tools", href: "/#tools" },
  { label: "How it works", href: "/#how" },
  { label: "Blog", href: "/blog" },
];

const workLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "#contact" },
];

const SiteNav = ({ mode = "product" }: { mode?: NavMode }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const links = mode === "product" ? productLinks : workLinks;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const resolveHref = (href: string) => href;

  return (
    <motion.nav
      initial={reduceMotion ? false : { y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled ? "bg-background/90 backdrop-blur-lg border-b border-border" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-medium tracking-tight" aria-label={mode === "product" ? "Forge.ai home" : "Abel.dev home"}>
          {mode === "product" ? (
            <>
              <span className="text-foreground" aria-hidden>
                Forge
              </span>
              <span className="text-muted-foreground" aria-hidden>
                .ai
              </span>
            </>
          ) : (
            <>
              <span className="text-foreground" aria-hidden>
                Abel
              </span>
              <span className="text-muted-foreground" aria-hidden>
                .dev
              </span>
            </>
          )}
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((item) =>
            item.href.startsWith("/") && !item.href.includes("#") ? (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={resolveHref(item.href)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {item.label}
              </a>
            ),
          )}
          <ThemeToggle />
          {mode === "product" ? (
            <a href="/#tools" className="btn-primary !px-5 !py-2">
              Try tools
            </a>
          ) : (
            <a href="#contact" className="btn-primary !px-5 !py-2">
              Hire Me
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground p-2 -mr-2"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-lg border-b border-border"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {links.map((item) =>
                item.href.startsWith("/") && !item.href.includes("#") ? (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.href}
                    href={resolveHref(item.href)}
                    onClick={() => setMobileOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {item.label}
                  </a>
                ),
              )}
              <div className="flex items-center justify-between gap-3">
                {mode === "product" ? (
                  <a href="/#tools" onClick={() => setMobileOpen(false)} className="btn-primary flex-1">
                    Try tools
                  </a>
                ) : (
                  <a href="#contact" onClick={() => setMobileOpen(false)} className="btn-primary flex-1">
                    Hire Me
                  </a>
                )}
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default SiteNav;
