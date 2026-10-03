import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, MessageSquare, BarChart3, Code2, PenTool, FileSearch, Languages, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const projects = [
  {
    title: "Cher.et",
    desc: "Co-owned a full-stack platform transforming manual workflows into automated digital systems supporting 30,000+ active users.",
    tags: ["Full-Stack", "APIs", "System Scale", "Product"],
    icon: FileSearch,
    featured: true,
    caseStudy: {
      problem: "Manual, fragmented workflows were severely bottlenecking operational scale and limiting system utility.",
      solution: "Engineered a robust full-stack automated digital workflow system capable of handling 30,000+ concurrent users with zero downtime.",
      tech: "Built scalable internal/external APIs, executed deep business logic, and integrated high-throughput third-party services to automate manual data processing pipelines.",
    },
  },
  {
    title: "CodeQuest",
    desc: "Full-stack web platform enabling users to learn Python by actively debugging broken code rather than passively reading tutorials.",
    tags: ["React", "TypeScript", "FastAPI", "PostgreSQL"],
    icon: Code2,
    featured: true,
    caseStudy: {
      problem: "Classical coding tutorials proved passive and unengaging for beginners trying to master Python context loops and debugging.",
      solution: "An interactive, AI-powered platform where learners are presented with organically generated 'broken' code to debug in real time.",
      tech: "Built with React and TypeScript on the frontend, securely communicating with a high-performance Python FastAPI backend, persisting data into PostgreSQL.",
    },
  },
  {
    title: "JobGen",
    desc: "Flutter mobile app improving job-matching by 30% through advanced AI integration and complex core modules including auth and chatbots.",
    tags: ["Flutter", "BLoC", "Clean Architecture", "AI"],
    icon: MessageSquare,
    featured: true,
    caseStudy: {
      problem: "Current remote job apps suffered from severe performance bottlenecks, low offline availability, and highly inaccurate AI matching.",
      solution: "A cleanly architected mobile app that optimized API calls/caching to boost load times by 25% and delivered fully functional offline access.",
      tech: "Implemented strict Clean Architecture and BLoC state management in Flutter, reducing bugs by 40% during testing. Collaborated tightly with backend AI models for a 30% improvement in match accuracy.",
    },
  },
  {
    title: "Smart Finance",
    desc: "ETB-first financial dashboard with AI expense categorization at 80% accuracy and native Kotlin SMS transaction ingestion.",
    tags: ["Flutter", "Kotlin", "React", "Supabase"],
    icon: BarChart3,
    featured: true,
    caseStudy: {
      problem: "No localized personal finance apps seamlessly integrated bank, mobile-money, and cash transactions natively for Ethiopian (ETB) contexts.",
      solution: "A unified analytics view offering JWT-authenticated APIs, real-time dashboards, and automated transaction categorization.",
      tech: "Used Flutter and React on the UI layer. Powered by Supabase (Postgres + AI Edge Functions). Engineered a native mobile SMS ingestion module in Kotlin that easily parses 100+ transactions/day on mobile endpoints.",
    },
  },
  {
    title: "AI Code Reviewer",
    desc: "Expert-level automated code analysis with security, performance, and architecture insights.",
    tags: ["React", "Groq LLM", "Streaming", "TypeScript"],
    icon: Code2,
    featured: false,
    demo: "/code-review",
  },
  {
    title: "AI Content Studio",
    desc: "Full-stack content generation with tone & style controls powered by LLMs.",
    tags: ["React", "Groq", "Edge Functions", "Streaming"],
    icon: PenTool,
    featured: false,
    demo: "/content-studio",
  },
  {
    title: "Sentiment Engine",
    desc: "Real-time emotion detection and tone analysis with structured sentiment scoring.",
    tags: ["React", "NLP", "Groq", "Streaming"],
    icon: BarChart3,
    featured: false,
    demo: "/sentiment",
  },
  {
    title: "Translation Hub",
    desc: "Context-aware multilingual translation with cultural nuance preservation.",
    tags: ["React", "Groq", "i18n", "Streaming"],
    icon: Languages,
    featured: false,
    demo: "/translate",
  },
];

const ProjectsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const reduceMotion = useReducedMotion();
  const featured = projects.filter((p) => p.featured);
  const demos = projects.filter((p): p is Extract<typeof p, { demo: string }> => "demo" in p);

  return (
    <section id="projects" className="pt-40 pb-28 relative">
      <div className="max-w-6xl mx-auto px-6 relative z-10" ref={ref}>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="mb-16 max-w-2xl"
        >
          <span className="label text-primary mb-5 block">Selected work</span>
          <h2 className="font-display text-display mb-5">
            Products that shipped.{" "}
            <span className="text-muted-foreground italic">Not demos dressed up as products.</span>
          </h2>
          <p className="text-body text-muted-foreground">
            Real-world applications spanning full-stack platforms, mobile apps, and AI tooling.
          </p>
        </motion.div>

        <div className="border-t border-border">
          {featured.map((project, i) => (
            <Dialog key={project.title}>
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: reduceMotion ? 0 : i * 0.06 }}
                className="group border-b border-border"
              >
                <div className="grid md:grid-cols-12 gap-4 py-7 md:py-8 items-start">
                  <div className="md:col-span-1 text-xs text-muted-foreground tabular-nums pt-1">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="md:col-span-5 min-w-0">
                    <h3 className="font-display text-display-sm text-foreground mb-2">{project.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{project.desc}</p>
                  </div>
                  <div className="md:col-span-4 flex flex-wrap gap-2 md:pt-2">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 rounded-sm border border-border text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="md:col-span-2 md:justify-self-end md:pt-2">
                    <DialogTrigger asChild>
                      <button className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                        Case study <ArrowUpRight size={12} />
                      </button>
                    </DialogTrigger>
                  </div>
                </div>
              </motion.div>

              <DialogContent className="sm:max-w-[600px] border-border bg-card rounded-xl">
                <DialogHeader>
                  <DialogTitle className="font-display text-display-sm mb-5 pb-5 border-b border-border text-left">
                    {project.title}
                  </DialogTitle>
                  <div className="space-y-5 text-left">
                    <div>
                      <p className="label text-muted-foreground mb-2">Problem</p>
                      <p className="text-sm text-foreground/85 leading-relaxed">{project.caseStudy?.problem}</p>
                    </div>
                    <div>
                      <p className="label text-muted-foreground mb-2">Solution</p>
                      <p className="text-sm text-foreground/85 leading-relaxed">{project.caseStudy?.solution}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <p className="label text-primary mb-2">Architecture</p>
                      <p className="text-sm text-foreground/80 leading-relaxed">{project.caseStudy?.tech}</p>
                    </div>
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          ))}
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.25 }}
          className="mt-16"
        >
          <p className="label text-muted-foreground mb-6">Try the live tools</p>
          <div className="grid sm:grid-cols-2 gap-px bg-border rounded-lg overflow-hidden border border-border">
            {demos.map((project) => (
              <Link
                key={project.title}
                to={project.demo}
                className="group p-5 bg-card hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <project.icon className="text-primary shrink-0 mt-0.5" size={16} />
                  <ExternalLink
                    size={12}
                    className="text-muted-foreground group-hover:text-primary transition-colors"
                  />
                </div>
                <h4 className="text-sm font-medium text-foreground mb-1">{project.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{project.desc}</p>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;
