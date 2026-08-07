import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { scaleIn } from "@/lib/motion";
import type { CampusLifeSection } from "@/types";

const MotionLink = motion(Link);

export function CampusLifeCard({ section }: { section: CampusLifeSection }) {
  const Icon = section.icon;
  const isDark = section.theme === "dark";

  return (
    <MotionLink
      to={`/campus-life/${section.slug}`}
      variants={scaleIn}
      className={`group flex flex-col rounded-card border p-8 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:rounded-card focus-visible:outline-offset-4 ${
        isDark ? "border-primary-700 bg-primary text-white" : "border-border bg-white text-text-primary"
      }`}
    >
      <div className={`flex h-14 w-14 items-center justify-center rounded-full ${isDark ? "bg-white/10" : "bg-primary-50"}`}>
        <Icon className={isDark ? "h-7 w-7 text-secondary-light" : "h-7 w-7 text-primary"} aria-hidden="true" strokeWidth={1.75} />
      </div>
      <p className={`mt-6 text-small font-semibold uppercase tracking-widest ${isDark ? "text-secondary-light" : "text-primary"}`}>
        {section.eyebrow}
      </p>
      <h3 className={`mt-2 text-subtitle ${isDark ? "text-white" : "text-text-primary"}`}>{section.name}</h3>
      <p className={`mt-3 text-body ${isDark ? "text-secondary-50" : "text-text-secondary"}`}>{section.tagline}</p>
      <span className={`mt-6 flex items-center gap-2 text-small font-semibold ${isDark ? "text-secondary-light" : "text-primary"}`}>
        Explore
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </MotionLink>
  );
}