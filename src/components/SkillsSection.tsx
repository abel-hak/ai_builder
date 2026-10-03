import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const skillCategories = [
  {
    title: "Languages",
    primary: ["TypeScript", "Python", "Dart"],
    secondary: ["JavaScript", "C++", "Java", "PHP"],
  },
  {
    title: "Frameworks",
    primary: ["React", "Flutter", "FastAPI"],
    secondary: ["Next.js", "Node.js", "Django", "Tailwind"],
  },
  {
    title: "Data & Infra",
    primary: ["PostgreSQL", "Supabase", "Docker"],
    secondary: ["MongoDB", "Redis", "AWS", "Firebase"],
  },
  {
    title: "Practice",
    primary: ["LangChain", "RAG", "Git"],
    secondary: ["Figma", "Jira", "Play Console"],
  },
];

const stats = [
  { label: "Projects shipped", value: "10+" },
  { label: "Users impacted", value: "30k+" },
  { label: "Years building", value: "3+" },
  { label: "LeetCode solved", value: "400+" },
];

const SkillsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const reduceMotion = useReducedMotion();

  return (
    <section id="skills" className="py-24 relative border-t border-border">
      <div className="max-w-6xl mx-auto px-6" ref={ref}>
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="lg:col-span-4"
          >
            <span className="label text-primary mb-5 block">Toolkit</span>
            <h2 className="font-display text-display mb-4">
              What I reach for when the deadline is real
            </h2>
            <p className="text-body text-muted-foreground max-w-sm">
              Primary tools are sized louder. Everything else still ships, just quieter.
            </p>
          </motion.div>

          <div className="lg:col-span-7 lg:col-start-6 space-y-10">
            {skillCategories.map((cat, catIdx) => (
              <motion.div
                key={cat.title}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: reduceMotion ? 0 : catIdx * 0.07 }}
              >
                <p className="label text-muted-foreground mb-4">{cat.title}</p>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  {cat.primary.map((skill) => (
                    <span key={skill} className="font-display text-2xl md:text-3xl text-foreground">
                      {skill}
                    </span>
                  ))}
                  {cat.secondary.map((skill) => (
                    <span key={skill} className="text-sm text-muted-foreground">
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-border"
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="font-display text-3xl md:text-4xl text-foreground mb-1 tabular-nums">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SkillsSection;
