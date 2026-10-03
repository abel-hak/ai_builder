import SiteNav from "@/components/SiteNav";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ProjectsSection from "@/components/ProjectsSection";
import SkillsSection from "@/components/SkillsSection";
import ContactSection from "@/components/ContactSection";
import SiteFooter from "@/components/SiteFooter";
import AIChatWidget from "@/components/AIChatWidget";

/** Builder profile / case studies — secondary to the Forge.ai product home. */
const Work = () => {
  return (
    <main className="min-h-screen bg-background">
      <SiteNav mode="work" />
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <SkillsSection />
      <ContactSection />
      <SiteFooter mode="work" />
      <AIChatWidget />
    </main>
  );
};

export default Work;
