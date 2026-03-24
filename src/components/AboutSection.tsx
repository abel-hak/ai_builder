import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Code2, Brain, Database, Rocket } from "lucide-react";

const highlights = [
  { icon: Code2, title: "Full-Stack Dev", desc: "React, Node.js, TypeScript, Next.js" },
  { icon: Brain, title: "AI / ML", desc: "LLMs, NLP, Computer Vision, RAG" },
  { icon: Database, title: "Backend & Data", desc: "PostgreSQL, MongoDB, Redis, AWS" },
  { icon: Rocket, title: "Ship Fast", desc: "CI/CD, Docker, Agile, TDD" },
];

const AboutSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          {/* Left */}
          <div>
            <span className="text-sm font-medium text-primary tracking-widest uppercase mb-4 block">About Me</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Building the future with
              <span className="text-gradient-primary"> code & AI</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              I'm a passionate full-stack developer with deep expertise in AI integration.
              I've built production-grade applications serving thousands of users,
              from SaaS platforms to AI-powered tools that automate complex workflows.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              My approach combines clean architecture with cutting-edge AI capabilities.
              Whether it's building a React dashboard, designing RESTful APIs, or
              deploying ML models — I deliver solutions that scale.
            </p>
          </div>

          {/* Right - Highlight cards */}
          <div className="grid grid-cols-2 gap-4">
            {highlights.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-glow transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="text-primary" size={22} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
