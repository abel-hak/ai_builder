import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Code2, Brain, Database, Rocket } from "lucide-react";

const highlights = [
  { icon: Code2, title: "Full-Stack Dev", desc: "React, Flutter, TypeScript, Next.js" },
  { icon: Brain, title: "AI / ML", desc: "LLMs, NLP, RAG, LangChain" },
  { icon: Database, title: "Backend & Data", desc: "PostgreSQL, Supabase, Redis, AWS" },
  { icon: Rocket, title: "Ship Fast", desc: "CI/CD, Docker, Agile, BLoC" },
];

const AboutSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-28 relative">
      <div className="max-w-6xl mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-5 gap-16 items-start"
        >
          {/* Left — 3 cols */}
          <div className="lg:col-span-3">
            <span className="text-xs font-medium text-primary tracking-widest uppercase mb-6 block">About</span>
            <h2 className="text-4xl md:text-5xl font-normal mb-8 leading-[1.1]">
              Building with{" "}
              <span className="text-gradient-primary italic">intention</span>
            </h2>
            <div className="space-y-5">
              <p className="text-muted-foreground leading-[1.7]">
                I'm a computer science student at Addis Ababa University with hands-on experience
                building production-grade applications serving 30,000+ users.
                My work spans full-stack web platforms, mobile apps with Flutter/BLoC,
                and AI-powered tools that automate complex workflows.
              </p>
              <p className="text-muted-foreground leading-[1.7]">
                I've solved 400+ LeetCode problems, trained for a year in DSA through the
                Africa to Silicon Valley program, and completed ALX Backend Engineering
                with an 84.7% grade. Clean architecture and intentional engineering
                define everything I ship.
              </p>
            </div>
          </div>

          {/* Right — 2 cols, stacked cards */}
          <div className="lg:col-span-2 grid grid-cols-1 gap-3">
            {highlights.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/20 transition-colors duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/[0.08] flex items-center justify-center shrink-0">
                  <item.icon className="text-primary" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
