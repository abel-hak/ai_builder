import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const highlights = [
  { title: "Full-Stack", desc: "React, Flutter, TypeScript, Next.js" },
  { title: "AI / ML", desc: "LLMs, NLP, RAG, LangChain" },
  { title: "Backend & Data", desc: "PostgreSQL, Supabase, Redis, AWS" },
  { title: "Ship Fast", desc: "CI/CD, Docker, Agile, BLoC" },
];

const AboutSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const reduceMotion = useReducedMotion();

  return (
    <section id="about" className="pt-20 pb-24 relative">
      <div className="max-w-6xl mx-auto px-6" ref={ref}>
        <div className="grid lg:grid-cols-12 gap-x-8 gap-y-12 items-start">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55 }}
            className="lg:col-span-7"
          >
            <span className="label text-primary mb-5 block">About</span>
            <h2 className="font-display text-display mb-8">
              Building systems that{" "}
              <span className="italic text-foreground/80">earn their keep</span>
            </h2>
            <div className="space-y-5 max-w-xl">
              <p className="text-body text-muted-foreground">
                I'm a computer science student at Addis Ababa University with hands-on experience
                building production-grade applications serving 30,000+ users. My work spans
                full-stack web platforms, mobile apps with Flutter/BLoC, and AI-powered tools
                that automate complex workflows.
              </p>
              <p className="text-body text-muted-foreground">
                I've solved 400+ LeetCode problems, trained for a year in DSA through the Africa
                to Silicon Valley program, and completed ALX Backend Engineering with an 84.7%
                grade. Clean architecture and intentional engineering define everything I ship.
              </p>
            </div>
          </motion.div>

          <motion.ul
            initial={reduceMotion ? false : { opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.12 }}
            className="lg:col-span-4 lg:col-start-9 space-y-0 divide-y divide-border border-t border-b border-border"
          >
            {highlights.map((item) => (
              <li key={item.title} className="py-4">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
