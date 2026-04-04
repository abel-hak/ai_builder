import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, Github, MessageSquare, BarChart3, Code2, PenTool, FileSearch, Languages, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const projects = [
  {
    title: "Cher.et — Full-stack Platform",
    desc: "Co-owned a full-stack platform transforming manual workflows into automated digital systems supporting 30,000+ active users.",
    tags: ["Full-Stack", "APIs", "System Scale", "Product"],
    icon: FileSearch,
    gradient: "from-primary/20 to-primary/5",
    featured: true,
    caseStudy: {
      problem: "Manual, fragmented workflows were severely bottlenecking operational scale and limiting system utility.",
      solution: "Engineered a robust full-stack automated digital workflow system capable of handling 30,000+ concurrent users with zero downtime.",
      tech: "Built scalable internal/external APIs, executed deep business logic, and integrated high-throughput third-party services to automate manual data processing pipelines."
    }
  },
  {
    title: "CodeQuest — AI-Powered Learning",
    desc: "Full-stack web platform enabling users to learn Python by actively debugging broken code rather than passively reading tutorials.",
    tags: ["React", "TypeScript", "FastAPI", "PostgreSQL"],
    icon: Code2,
    gradient: "from-accent/20 to-accent/5",
    featured: true,
    caseStudy: {
      problem: "Classical coding tutorials proved passive and unengaging for beginners trying to master Python context loops and debugging.",
      solution: "An interactive, AI-powered platform where learners are presented with organically generated 'broken' code to debug in real time.",
      tech: "Built with React and TypeScript on the frontend, securely communicating with a high-performance Python FastAPI backend, persisting data into PostgreSQL."
    }
  },
  {
    title: "JobGen — AI Remote Job Finder",
    desc: "Flutter mobile app improving job-matching by 30% through advanced AI integration and complex core modules including auth and chatbots.",
    tags: ["Flutter", "BLoC", "Clean Architecture", "AI Integration"],
    icon: MessageSquare,
    gradient: "from-primary/20 to-accent/5",
    featured: true,
    caseStudy: {
      problem: "Current remote job apps suffered from severe performance bottlenecks, low offline availability, and highly inaccurate AI matching.",
      solution: "A cleanly architected mobile app that optimized API calls/caching to boost load times by 25% and delivered fully functional offline access.",
      tech: "Implemented strict Clean Architecture and BLoC state management in Flutter, reducing bugs by 40% during testing. Collaborated tightly with backend AI models for a 30% improvement in match accuracy."
    }
  },
  {
    title: "Smart Personal Finance Platform",
    desc: "ETB-first robust financial dashboard driving AI-based expense categorization with 80% real-time accuracy and native SMS ingestion.",
    tags: ["Flutter", "Kotlin", "React", "Supabase Edge Functions"],
    icon: BarChart3,
    gradient: "from-accent/20 to-primary/10",
    featured: true,
    caseStudy: {
      problem: "No localized personal finance apps seamlessly integrated bank, mobile-money, and cash transactions natively for Ethiopian (ETB) contexts.",
      solution: "A unified analytics view offering JWT-authenticated APIs, real-time dashboards, and automated transaction categorization.",
      tech: "Used Flutter and React on the UI layer. Powered by Supabase (Postgres + AI Edge Functions). Engineered a native mobile SMS ingestion module in Kotlin that easily parses 100+ transactions/day on mobile endpoints."
    }
  },
  {
    title: "AI Code Reviewer",
    desc: "Expert-level automated code analysis — detects security vulnerabilities, performance bottlenecks, and architecture issues with actionable fix suggestions.",
    tags: ["React", "Groq LLM", "Streaming", "TypeScript"],
    icon: Code2,
    gradient: "from-primary/20 to-accent/10",
    featured: false,
    demo: "/code-review",
  },
  {
    title: "AI Content Studio",
    desc: "Full-stack content generation platform. Create blog posts, emails, landing pages with tone & style controls powered by LLMs.",
    tags: ["React", "Gemini AI", "Edge Functions", "Streaming"],
    icon: PenTool,
    gradient: "from-accent/20 to-primary/10",
    featured: false,
    demo: "/content-studio",
  },
  {
    title: "Sentiment Analysis Engine",
    desc: "Real-time emotion detection and tone analysis. Breaks down text into sentiment scores, key phrases, and emotional patterns.",
    tags: ["React", "NLP", "Gemini AI", "Streaming"],
    icon: BarChart3,
    gradient: "from-primary/15 to-accent/15",
    featured: false,
    demo: "/sentiment",
  },
  {
    title: "AI Translation Hub",
    desc: "Context-aware multilingual translation with cultural nuance preservation. Supports 10+ languages with translator notes.",
    tags: ["React", "Gemini AI", "i18n", "Streaming"],
    icon: Languages,
    gradient: "from-accent/15 to-primary/15",
    featured: false,
    demo: "/translate",
  },
];

const ProjectsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="projects" className="py-32 relative">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="max-w-7xl mx-auto px-6 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary tracking-widest uppercase mb-4 block">Portfolio</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Featured <span className="text-gradient-primary">Projects</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real-world applications showcasing full-stack development and AI integration expertise.
          </p>
        </motion.div>

        {/* Featured projects - large cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {projects.filter(p => p.featured).map((project, i) => (
            <Dialog key={project.title}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-glow flex flex-col"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative p-8 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <project.icon className="text-primary" size={26} />
                    </div>
                    <div className="flex gap-2">
                      <DialogTrigger asChild>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 text-primary bg-primary/5 hover:bg-primary/20 transition-all text-sm font-medium">
                          <BookOpen size={16} /> Case Study
                        </button>
                      </DialogTrigger>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{project.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed flex-1">{project.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <span key={tag} className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              <DialogContent className="sm:max-w-[650px] border-border bg-background shadow-2xl">
                <DialogHeader>
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border/50">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <project.icon className="text-primary" size={24} />
                    </div>
                    <DialogTitle className="text-2xl font-bold tracking-tight">{project.title}</DialogTitle>
                  </div>
                  
                  <div className="space-y-6 pt-2 text-left">
                    <div>
                      <h4 className="flex items-center gap-2 text-red-400 font-semibold mb-2 uppercase text-xs tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-red-400"></span> The Problem
                      </h4>
                      <p className="text-foreground/80 leading-relaxed">{project.caseStudy?.problem}</p>
                    </div>

                    <div>
                      <h4 className="flex items-center gap-2 text-green-400 font-semibold mb-2 uppercase text-xs tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span> The Solution
                      </h4>
                      <p className="text-foreground/80 leading-relaxed">{project.caseStudy?.solution}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                      <h4 className="text-primary font-semibold mb-2 flex items-center gap-2">
                        <Code2 size={16} /> Architecture & Tech Stack
                      </h4>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {project.caseStudy?.tech}
                      </p>
                    </div>
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          ))}
        </div>

        {/* Expert projects with live demos */}
        <div className="grid md:grid-cols-2 gap-6">
          {projects.filter(p => !p.featured).map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-glow transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative p-7 flex flex-col h-full">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <project.icon className="text-primary" size={22} />
                  </div>
                  {"demo" in project && project.demo && (
                    <Link
                      to={project.demo}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-all shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                    >
                      <ExternalLink size={12} />
                      Live Demo
                    </Link>
                  )}
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed flex-1">{project.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
