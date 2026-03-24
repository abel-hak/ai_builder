import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const skillCategories = [
  {
    title: "Frontend",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Redux"],
  },
  {
    title: "Backend",
    skills: ["Node.js", "Python", "FastAPI", "Express", "GraphQL", "REST APIs"],
  },
  {
    title: "AI / ML",
    skills: ["OpenAI / GPT", "LangChain", "RAG", "NLP", "TensorFlow", "Vector DBs"],
  },
  {
    title: "Database & Infra",
    skills: ["PostgreSQL", "MongoDB", "Redis", "Docker", "AWS", "CI/CD"],
  },
];

const SkillsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="skills" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary tracking-widest uppercase mb-4 block">Expertise</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Tech <span className="text-gradient-primary">Stack</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Tools and technologies I use to bring ideas to life.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillCategories.map((cat, catIdx) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: catIdx * 0.1 }}
              className="p-6 rounded-2xl border border-border bg-card"
            >
              <h3 className="text-lg font-semibold mb-5 text-gradient-primary">{cat.title}</h3>
              <div className="flex flex-col gap-3">
                {cat.skills.map((skill, i) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, x: -10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3, delay: catIdx * 0.1 + i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-sm text-foreground">{skill}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
        >
          {[
            { label: "Projects Completed", value: "30+" },
            { label: "Happy Clients", value: "20+" },
            { label: "Years Experience", value: "4+" },
            { label: "AI Models Deployed", value: "10+" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-2xl border border-border bg-card/50">
              <div className="text-3xl md:text-4xl font-bold text-gradient-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SkillsSection;
