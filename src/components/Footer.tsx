import { Github, Linkedin, Mail, ArrowUpRight } from "lucide-react";

const footerLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

const socialLinks = [
  { icon: Github, href: "https://github.com/abel-hak", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/in/", label: "LinkedIn" },
  { icon: Mail, href: "mailto:erddunoabel47@gmail.com", label: "Email" },
];

const Footer = () => (
  <footer className="border-t border-border bg-card/50">
    <div className="max-w-6xl mx-auto px-6">
      {/* Top row */}
      <div className="py-12 grid sm:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <a href="#" className="text-lg font-medium tracking-tight mb-3 block">
            <span className="text-foreground">Abel</span>
            <span className="text-muted-foreground">.dev</span>
          </a>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Software Engineer based in Addis Ababa, Ethiopia.
            Building robust mobile & web applications with AI integration.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Navigation</h4>
          <ul className="space-y-2.5">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-foreground/70 hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Connect</h4>
          <ul className="space-y-2.5">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground/70 hover:text-foreground transition-colors inline-flex items-center gap-2"
                >
                  <Icon size={14} />
                  {label}
                  <ArrowUpRight size={10} className="text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom row */}
      <div className="border-t border-border py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Abel Erduno Hakenso. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground">
          Built with React, TypeScript & Supabase
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
