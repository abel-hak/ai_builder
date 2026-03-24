import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, Github, Brain, MessageSquare, BarChart3, Code2, PenTool, FileSearch, Languages } from "lucide-react";
import { Link } from "react-router-dom";

const projects = [
  {
    title: "AI Document Analyzer",
    desc: "RAG-powered document analysis platform. Upload PDFs, ask questions, get AI-generated insights with source citations.",
    tags: ["React", "Python", "LangChain", "OpenAI", "PostgreSQL", "Docker"],
    icon: FileSearch,
    gradient: "from-primary/20 to-primary/5",
    featured: true,
  },
  {
    title: "Real-time Chat with AI Moderation",
    desc: "WebSocket chat application with AI-powered content moderation, sentiment analysis, and auto-translation.",
    tags: ["Next.js", "Socket.io", "NLP", "Redis", "TypeScript"],
    icon: MessageSquare,
    gradient: "from-accent/20 to-accent/5",
    featured: true,
  },
  {
    title: "AI Code Reviewer",
    desc: "Expert-level automated code analysis — detects security vulnerabilities, performance bottlenecks, and architecture issues with actionable fix suggestions.",
    tags: ["React", "Gemini AI", "Streaming", "TypeScript"],
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
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-glow"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <project.icon className="text-primary" size={26} />
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-all" aria-label="View source">
                      <Github size={16} />
                    </button>
                    <button className="p-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-all" aria-label="View live">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{project.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">{project.desc}</p>
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
              <div className="relative p-7">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <project.icon className="text-primary" size={22} />
                  </div>
                  {"demo" in project && project.demo && (
                    <Link
                      to={project.demo}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-all"
                    >
                      <ExternalLink size={12} />
                      Live Demo
                    </Link>
                  )}
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{project.desc}</p>
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
