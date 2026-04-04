import { motion, useInView } from "framer-motion";
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
      tech: "Built scalable internal/external APIs, executed deep business logic, and integrated high-throughput third-party services to automate manual data processing pipelines."
    }
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
      tech: "Built with React and TypeScript on the frontend, securely communicating with a high-performance Python FastAPI backend, persisting data into PostgreSQL."
    }
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
      tech: "Implemented strict Clean Architecture and BLoC state management in Flutter, reducing bugs by 40% during testing. Collaborated tightly with backend AI models for a 30% improvement in match accuracy."
    }
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
      tech: "Used Flutter and React on the UI layer. Powered by Supabase (Postgres + AI Edge Functions). Engineered a native mobile SMS ingestion module in Kotlin that easily parses 100+ transactions/day on mobile endpoints."
    }
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
    tags: ["React", "Gemini AI", "Edge Functions", "Streaming"],
    icon: PenTool,
    featured: false,
    demo: "/content-studio",
  },
  {
    title: "Sentiment Engine",
    desc: "Real-time emotion detection and tone analysis with structured sentiment scoring.",
    tags: ["React", "NLP", "Gemini AI", "Streaming"],
    icon: BarChart3,
    featured: false,
    demo: "/sentiment",
  },
  {
    title: "Translation Hub",
    desc: "Context-aware multilingual translation with cultural nuance preservation.",
    tags: ["React", "Gemini AI", "i18n", "Streaming"],
    icon: Languages,
    featured: false,
    demo: "/translate",
  },
];

const ProjectsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="projects" className="py-28 relative">
      <div className="max-w-6xl mx-auto px-6 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <span className="text-xs font-medium text-primary tracking-widest uppercase mb-6 block">Portfolio</span>
          <h2 className="text-4xl md:text-5xl font-normal mb-4 leading-[1.1]">
            Featured <span className="text-gradient-primary italic">Projects</span>
          </h2>
          <p className="text-muted-foreground max-w-lg">
            Real-world applications showcasing full-stack development and AI integration.
          </p>
        </motion.div>

        {/* Featured projects — clean list layout */}
        <div className="space-y-px rounded-lg border border-border overflow-hidden mb-8">
          {projects.filter(p => p.featured).map((project, i) => (
            <Dialog key={project.title}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group bg-card hover:bg-secondary/40 transition-colors duration-200"
              >
                <div className="flex items-center justify-between p-5 md:p-6 gap-4">
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/[0.08] flex items-center justify-center shrink-0">
                      <project.icon className="text-primary" size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-medium text-foreground mb-1">{project.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-1 hidden sm:block">{project.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden md:flex gap-2">
                      {project.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs px-2.5 py-1 rounded-md bg-secondary text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <DialogTrigger asChild>
                      <button className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                        Details <ArrowUpRight size={12} />
                      </button>
                    </DialogTrigger>
                  </div>
                </div>
              </motion.div>

              <DialogContent className="sm:max-w-[600px] border-border bg-card">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-5 pb-5 border-b border-border">
                    <div className="w-10 h-10 rounded-lg bg-primary/[0.08] flex items-center justify-center">
                      <project.icon className="text-primary" size={18} />
                    </div>
                    <DialogTitle className="text-xl font-normal">{project.title}</DialogTitle>
                  </div>

                  <div className="space-y-5 text-left">
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Problem</h4>
                      <p className="text-sm text-foreground/85 leading-relaxed">{project.caseStudy?.problem}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Solution</h4>
                      <p className="text-sm text-foreground/85 leading-relaxed">{project.caseStudy?.solution}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <h4 className="text-xs font-medium text-primary mb-2">Architecture</h4>
                      <p className="text-sm text-foreground/80 leading-relaxed">{project.caseStudy?.tech}</p>
                    </div>
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          ))}
        </div>

        {/* Demo projects — smaller grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Live Demos</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {projects.filter(p => !p.featured).map((project) => (
              <Link
                key={project.title}
                to={(project as any).demo}
                className="group p-4 rounded-lg border border-border bg-card hover:border-primary/20 hover:bg-secondary/30 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <project.icon className="text-primary" size={16} />
                  <ExternalLink size={12} className="text-muted-foreground group-hover:text-primary transition-colors" />
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
