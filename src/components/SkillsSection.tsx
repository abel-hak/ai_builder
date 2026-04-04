import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const skillCategories = [
  {
    title: "Languages",
    skills: ["Python", "JavaScript", "TypeScript", "Dart", "C++", "Java", "PHP"],
  },
  {
    title: "Frameworks",
    skills: ["Flutter", "React", "Next.js", "Node.js", "Django", "FastAPI", "Tailwind CSS"],
  },
  {
    title: "Backend & Data",
    skills: ["Supabase", "PostgreSQL", "MongoDB", "Firebase", "Redis", "Docker", "AWS"],
  },
  {
    title: "Tools",
    skills: ["Git", "Jira", "Figma", "Google Play Console", "LangChain", "RAG"],
  },
];

const SkillsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="skills" className="py-28 relative">
      <div className="max-w-6xl mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <span className="text-xs font-medium text-primary tracking-widest uppercase mb-6 block">Expertise</span>
          <h2 className="text-4xl md:text-5xl font-normal mb-4 leading-[1.1]">
            Tech <span className="text-gradient-primary italic">Stack</span>
          </h2>
          <p className="text-muted-foreground max-w-lg">
            Tools and technologies I use daily to build and ship products.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-lg overflow-hidden border border-border">
          {skillCategories.map((cat, catIdx) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: catIdx * 0.08 }}
              className="bg-card p-6"
            >
              <h3 className="text-sm font-medium text-primary mb-5 tracking-wide">{cat.title}</h3>
              <div className="flex flex-col gap-2.5">
                {cat.skills.map((skill, i) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.3, delay: catIdx * 0.08 + i * 0.03 }}
                    className="text-sm text-foreground/80"
                  >
                    {skill}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats — minimal, no card wrappers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap gap-12 md:gap-20 mt-16 pt-12 border-t border-border"
        >
          {[
            { label: "Projects Completed", value: "10+" },
            { label: "Users Impacted", value: "30k+" },
            { label: "Years Experience", value: "3+" },
            { label: "LeetCode Solved", value: "400+" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-normal text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SkillsSection;
