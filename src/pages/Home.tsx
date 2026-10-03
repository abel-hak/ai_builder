import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Code2, PenTool, BarChart3, Languages, Zap, Database, Radio } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import AIChatWidget from "@/components/AIChatWidget";

const tools = [
  {
    title: "Code Reviewer",
    desc: "Severity-tagged findings with line ranges and applyable patches — not a wall of prose.",
    href: "/code-review",
    icon: Code2,
    meta: "JSON findings · Apply fix · Refine",
  },
  {
    title: "Content Studio",
    desc: "Blog posts, LinkedIn copy, cold emails, and landing pages with tone and length controls.",
    href: "/content-studio",
    icon: PenTool,
    meta: "Tone slider · Markdown out",
  },
  {
    title: "Sentiment Engine",
    desc: "Emotion scores, confidence, and phrase highlights for product reviews or feedback dumps.",
    href: "/sentiment",
    icon: BarChart3,
    meta: "Radar · Export report",
  },
  {
    title: "Translation Hub",
    desc: "Context-aware translation with pronunciation notes — including Amharic and other non-Latin scripts.",
    href: "/translate",
    icon: Languages,
    meta: "12 languages · Notes",
  },
];

const steps = [
  {
    icon: Radio,
    title: "Prompt hits an Edge Function",
    desc: "The browser streams to a Supabase function that picks a system prompt by mode.",
  },
  {
    icon: Zap,
    title: "Groq returns tokens live",
    desc: "Responses arrive as an event stream — you see text as it’s generated, not after a spinner.",
  },
  {
    icon: Database,
    title: "Runs save to history",
    desc: "Completed generations are stored so you can reopen past reviews, posts, and translations.",
  },
];

const Home = () => {
  const reduceMotion = useReducedMotion();

  return (
    <main className="min-h-screen bg-background">
      <SiteNav mode="product" />

      {/* Hero — product first, one composition */}
      <section className="relative min-h-[88vh] flex items-end pb-20 md:pb-28 overflow-hidden bg-gradient-hero">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--border) / 0.35) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.35) 1px, transparent 1px)",
            backgroundSize: "96px 96px",
            maskImage: "radial-gradient(ellipse 65% 55% at 25% 75%, black 15%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
          <div className="max-w-3xl">
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="label text-muted-foreground mb-6 block"
            >
              Live AI tool suite
            </motion.p>

            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.05 }}
              className="font-display text-display-xl mb-6"
            >
              Forge
              <span className="text-gradient-primary italic">.ai</span>
            </motion.h1>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.1 }}
              className="text-body-lg text-muted-foreground max-w-xl mb-10"
            >
              Four streaming tools for code review, content, sentiment, and translation —
              running on Supabase Edge Functions and Groq.
            </motion.p>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.16 }}
              className="flex flex-wrap items-center gap-4"
            >
              <a href="#tools" className="btn-primary">
                Open the tools
                <ArrowRight size={16} />
              </a>
              <a
                href="mailto:erddunoabel47@gmail.com"
                className="inline-flex items-center gap-2 border border-border text-foreground px-6 py-3 rounded-md text-sm font-medium hover:bg-card transition-colors"
              >
                Contact Abel
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" className="pt-24 pb-20 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12 max-w-2xl">
            <span className="label text-primary mb-4 block">The suite</span>
            <h2 className="font-display text-display mb-4">Pick a tool. Paste input. Watch it stream.</h2>
            <p className="text-body text-muted-foreground">
              Each mode uses its own system prompt. Same gateway, different job.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden border border-border">
            {tools.map((tool, i) => (
              <Link
                key={tool.href}
                to={tool.href}
                className="group p-7 md:p-8 bg-card hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <tool.icon className="text-primary shrink-0" size={20} />
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-display text-display-sm text-foreground mb-2 group-hover:text-primary transition-colors">
                  {tool.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{tool.desc}</p>
                <p className="text-xs text-muted-foreground/80 inline-flex items-center gap-2">
                  {tool.meta}
                  <ArrowRight
                    size={12}
                    className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform]"
                  />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <span className="label text-primary mb-4 block">Pipeline</span>
              <h2 className="font-display text-display mb-4">How a request moves</h2>
              <p className="text-body text-muted-foreground">
                No fake delays. The UI is wired to a real streaming completion endpoint.
              </p>
            </div>
            <ol className="lg:col-span-7 lg:col-start-6 space-y-0 divide-y divide-border border-t border-b border-border">
              {steps.map((step, i) => (
                <li key={step.title} className="py-6 flex gap-5">
                  <span className="text-xs text-muted-foreground tabular-nums pt-1 w-6 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <step.icon size={14} className="text-primary shrink-0" />
                      <h3 className="text-sm font-medium text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Builder CTA — hire path without exposing the portfolio page */}
      <section className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl">
            <span className="label text-primary mb-4 block">Who built this</span>
            <h2 className="font-display text-display mb-5">
              Abel Erduno Hakenso — software engineer in Addis Ababa.
            </h2>
            <p className="text-body text-muted-foreground mb-8">
              Forge is a product sample: React, TypeScript, Supabase, and streaming LLMs in one
              shippable app. Reach out if you want something like this built for your team.
            </p>
            <a href="mailto:erddunoabel47@gmail.com" className="btn-primary">
              Email Abel
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <SiteFooter mode="product" />
      <AIChatWidget />
    </main>
  );
};

export default Home;
